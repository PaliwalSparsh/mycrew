const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const chokidar = require('chokidar');

class TriggerManager {
  constructor({ onTrigger, onLog }) {
    this.onTrigger = onTrigger;
    this.onLog = onLog;
    this.watchers = new Map();
    this.schedulers = new Map();
    this.lastTriggeredAt = new Map();
    this.debounce = new Map();
  }

  bind(task) {
    if (task.trigger === 'cron') {
      if (!task.schedule || !cron.validate(task.schedule)) {
        this.onLog('trigger.invalid', { taskId: task.id, trigger: 'cron', schedule: task.schedule });
        return;
      }
      const scheduler = cron.schedule(task.schedule, () => {
        this._mark(task.id);
        this.onTrigger(task.id, 'cron');
      });
      this.schedulers.set(task.id, scheduler);
      this.onLog('trigger.bound', { taskId: task.id, trigger: 'cron', schedule: task.schedule });
    }

    if (task.trigger === 'folder') {
      const resolved = path.resolve(task.watchPath || '');
      if (!resolved || !fs.existsSync(resolved)) {
        this.onLog('trigger.invalid', { taskId: task.id, trigger: 'folder', watchPath: task.watchPath });
        return;
      }
      const watcher = chokidar.watch(resolved, { ignoreInitial: true });
      const handler = (eventType) => {
        const key = `${task.id}:${eventType}`;
        if (this.debounce.has(key)) return;
        this.debounce.set(key, setTimeout(() => this.debounce.delete(key), 400));
        this._mark(task.id);
        this.onTrigger(task.id, `folder:${eventType}`);
      };
      watcher.on('add', () => handler('add'));
      watcher.on('change', () => handler('change'));
      this.watchers.set(task.id, watcher);
      this.onLog('trigger.bound', { taskId: task.id, trigger: 'folder', watchPath: resolved });
    }
  }

  unbind(taskId) {
    const watcher = this.watchers.get(taskId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(taskId);
    }

    const scheduler = this.schedulers.get(taskId);
    if (scheduler) {
      scheduler.stop();
      this.schedulers.delete(taskId);
    }
  }

  _mark(taskId) {
    this.lastTriggeredAt.set(taskId, new Date().toISOString());
  }

  getHealth(taskId) {
    return {
      hasWatcher: this.watchers.has(taskId),
      hasScheduler: this.schedulers.has(taskId),
      lastTriggeredAt: this.lastTriggeredAt.get(taskId) || null
    };
  }
}

module.exports = { TriggerManager };
