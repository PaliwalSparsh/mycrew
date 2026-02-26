const test = require('node:test');
const assert = require('node:assert/strict');
const { AgentRuntime } = require('../src/runtime/agent-runtime');

test('creates task and queues run', async () => {
  const runtime = new AgentRuntime();
  const task = runtime.createTask({
    name: 'test-manual',
    prompt: 'hello world',
    trigger: 'manual',
    priority: 4,
    retries: 1
  });

  const run = runtime.enqueueTask(task.id, 'manual');
  assert.equal(run.taskId, task.id);
  await new Promise((resolve) => setTimeout(resolve, 250));

  const logs = runtime.listLogs();
  assert.ok(logs.find((entry) => entry.type === 'run.success'));
});

test('requires approval for risky terminal action', async () => {
  const runtime = new AgentRuntime();
  const task = runtime.createTask({
    name: 'terminal-risky',
    prompt: 'terminal: echo hello',
    trigger: 'manual',
    priority: 3,
    retries: 0
  });

  runtime.enqueueTask(task.id, 'manual');
  await new Promise((resolve) => setTimeout(resolve, 250));

  const approvals = runtime.listApprovals();
  assert.ok(approvals.length >= 1);
});
