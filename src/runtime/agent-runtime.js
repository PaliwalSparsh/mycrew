const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { RuntimeDb } = require('./db');
const { TaskStore } = require('./task-store');
const { LogService } = require('./log-service');
const { TriggerManager } = require('./trigger-manager');
const { QueueEngine } = require('./queue-engine');
const { PolicyEngine } = require('./policy-engine');
const { RunExecutor, planActions } = require('./run-executor');

class AgentRuntime extends EventEmitter {
  constructor() {
    super();
    const dbPath = path.join(os.homedir(), '.mycrew', 'runtime.db');
    this.db = new RuntimeDb(dbPath).db;
    this.taskStore = new TaskStore(this.db);
    this.logService = new LogService(this.db);
    this.policyEngine = new PolicyEngine();
    this.runExecutor = new RunExecutor({ policyEngine: this.policyEngine });
    this.pendingApprovals = new Map();
    this.approvedApprovals = new Set();
    this.nextTaskId = Number(this.db.prepare("SELECT COUNT(*) as c FROM tasks").get().c) + 1;
    this.nextRunId = Number(this.db.prepare("SELECT COUNT(*) as c FROM runs").get().c) + 1;

    this.insertRunStmt = this.db.prepare('INSERT INTO runs (id, task_id, source, state, attempts, max_attempts, queued_at, started_at, completed_at, error_message) VALUES (?,?,?,?,?,?,?,?,?,?)');
    this.updateRunStmt = this.db.prepare('UPDATE runs SET state=?, attempts=?, started_at=?, completed_at=?, error_message=? WHERE id=?');

    this.queueEngine = new QueueEngine({ onRun: async (run) => this._runDequeued(run) });
    this.triggerManager = new TriggerManager({
      onTrigger: (taskId, source) => this.enqueueTask(taskId, source),
      onLog: (type, data) => this._log(type, data)
    });

    for (const task of this.taskStore.list()) {
      this.triggerManager.bind(task);
    }
  }

  listTasks() {
    return this.taskStore.list().map((task) => ({ ...task, triggerHealth: this.triggerManager.getHealth(task.id) }));
  }

  listLogs() {
    return this.logService.list(200);
  }

  listApprovals() {
    return Array.from(this.pendingApprovals.values());
  }

  createTask(input) {
    this._validateTaskInput(input);
    const now = new Date().toISOString();
    const task = {
      id: String(this.nextTaskId++),
      name: input.name.trim(),
      prompt: input.prompt.trim(),
      trigger: input.trigger,
      schedule: input.schedule || null,
      watchPath: input.watchPath || null,
      priority: Number(input.priority ?? 5),
      retries: Number(input.retries ?? 3),
      status: 'idle',
      runCount: 0,
      failedCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.taskStore.create(task);
    this.triggerManager.bind(task);
    this._log('task.created', { taskId: task.id, name: task.name, trigger: task.trigger });
    this.emit('state.changed');
    return task;
  }

  removeTask(taskId) {
    this.taskStore.delete(taskId);
    this.triggerManager.unbind(taskId);
    this._log('task.deleted', { taskId });
    this.emit('state.changed');
  }

  enqueueTask(taskId, source = 'manual') {
    const task = this.taskStore.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const run = {
      runId: String(this.nextRunId++),
      taskId,
      source,
      priority: task.priority,
      attempts: 0,
      maxAttempts: task.retries + 1,
      state: 'queued',
      queuedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      errorMessage: null
    };
    this.insertRunStmt.run(run.runId, run.taskId, run.source, run.state, run.attempts, run.maxAttempts, run.queuedAt, null, null, null);
    const result = this.queueEngine.enqueue(run);
    if (result.deduped) {
      this._log('run.deduped', { taskId, source, existingRunId: result.run.runId });
      return result.run;
    }

    this._log('run.queued', { runId: run.runId, taskId, source, priority: run.priority });
    this.emit('state.changed');
    return run;
  }

  cancelRun(runId) {
    const removed = this.queueEngine.cancel(runId);
    if (removed) {
      this.updateRunStmt.run('cancelled', removed.attempts, removed.startedAt, new Date().toISOString(), 'Cancelled by user', runId);
      this._log('run.cancelled', { runId });
      this.emit('state.changed');
    }
    return removed;
  }

  setQueuePaused(paused) {
    this.queueEngine.setPaused(Boolean(paused));
    this._log(paused ? 'queue.paused' : 'queue.resumed', {});
    this.emit('state.changed');
  }

  resolveApproval(approvalId, decision) {
    const approval = this.pendingApprovals.get(approvalId);
    if (!approval) throw new Error('Approval not found');
    approval.status = decision ? 'approved' : 'rejected';
    approval.resolvedAt = new Date().toISOString();
    if (decision) this.approvedApprovals.add(approvalId);
    this.pendingApprovals.delete(approvalId);
    this._log('approval.resolved', { approvalId, decision: approval.status });
    this.emit('state.changed');
  }

  async _runDequeued(run) {
    const task = this.taskStore.get(run.taskId);
    if (!task) {
      this._log('run.dropped', { runId: run.runId, reason: 'task_missing' });
      return;
    }

    run.state = 'running';
    run.startedAt = new Date().toISOString();
    this.updateRunStmt.run(run.state, run.attempts, run.startedAt, null, null, run.runId);
    this._log('run.started', { runId: run.runId, taskId: task.id, name: task.name });

    let done = false;
    while (!done && run.attempts < run.maxAttempts) {
      run.attempts += 1;
      try {
        const actions = planActions(task.prompt);
        this._log('planner.actions', { runId: run.runId, count: actions.length, actions });

        for (const [actionIndex, action] of actions.entries()) {
          const risk = this.policyEngine.assess(action);
          if (risk.risky) {
            const approvalId = `${run.runId}-${actionIndex}-${action.type}`;
            if (this.approvedApprovals.has(approvalId)) {
              this._log('approval.used', { approvalId, runId: run.runId, actionType: action.type });
            } else if (!this.pendingApprovals.has(approvalId)) {
              this.pendingApprovals.set(approvalId, {
                id: approvalId,
                runId: run.runId,
                taskId: task.id,
                action,
                reason: risk.reason,
                status: 'pending',
                createdAt: new Date().toISOString()
              });
              this._log('approval.requested', { approvalId, runId: run.runId, actionType: action.type, reason: risk.reason });
              throw new Error(`Approval required for ${action.type}`);
            }
          }

          this._log('tool.called', { runId: run.runId, actionType: action.type });
          const result = this.runExecutor.executeAction(action);
          this._log('tool.result', { runId: run.runId, actionType: action.type, result });
        }

        run.state = 'success';
        run.completedAt = new Date().toISOString();
        run.errorMessage = null;
        task.status = 'idle';
        task.runCount += 1;
        task.updatedAt = new Date().toISOString();
        this.taskStore.saveStats(task);
        this.updateRunStmt.run(run.state, run.attempts, run.startedAt, run.completedAt, null, run.runId);
        this._log('run.success', { runId: run.runId, taskId: task.id, attempts: run.attempts });
        done = true;
      } catch (error) {
        this._log('run.attempt_failed', { runId: run.runId, taskId: task.id, attempt: run.attempts, message: error.message });
        run.errorMessage = error.message;
        if (run.attempts >= run.maxAttempts) {
          run.state = 'failed';
          run.completedAt = new Date().toISOString();
          task.status = 'failed';
          task.failedCount += 1;
          task.updatedAt = new Date().toISOString();
          this.taskStore.saveStats(task);
          this.updateRunStmt.run(run.state, run.attempts, run.startedAt, run.completedAt, run.errorMessage, run.runId);
          this._log('run.failed', { runId: run.runId, taskId: task.id, reason: run.errorMessage, remediation: 'Review approval requests or prompt/tool inputs.' });
          done = true;
        }
      }
    }

    this.emit('state.changed');
  }

  _log(type, payload) {
    const entry = this.logService.log({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      runId: payload?.runId || null,
      type,
      payload,
      createdAt: new Date().toISOString()
    });
    this.emit('log', entry);
  }

  _validateTaskInput(input) {
    if (!input || typeof input !== 'object') throw new Error('Invalid input');
    if (!input.name || typeof input.name !== 'string') throw new Error('Task name is required');
    if (!input.prompt || typeof input.prompt !== 'string') throw new Error('Task prompt is required');
    if (!['manual', 'cron', 'folder'].includes(input.trigger)) throw new Error('Invalid task trigger');

    if (input.trigger === 'cron' && (!input.schedule || typeof input.schedule !== 'string')) {
      throw new Error('Cron schedule is required');
    }

    if (input.trigger === 'folder' && (!input.watchPath || typeof input.watchPath !== 'string')) {
      throw new Error('Folder watch path is required');
    }
  }
}

module.exports = { AgentRuntime };
