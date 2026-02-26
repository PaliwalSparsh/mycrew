class QueueEngine {
  constructor({ onRun }) {
    this.onRun = onRun;
    this.queue = [];
    this.processing = false;
    this.paused = false;
  }

  enqueue(run) {
    const duplicate = this.queue.find((queued) => queued.taskId === run.taskId && queued.source === run.source && queued.state === 'queued');
    if (duplicate) {
      return { deduped: true, run: duplicate };
    }
    this.queue.push(run);
    this.queue.sort((a, b) => a.priority - b.priority || Number(a.runId) - Number(b.runId));
    this.process().catch(() => {});
    return { deduped: false, run };
  }

  cancel(runId) {
    const idx = this.queue.findIndex((run) => run.runId === runId);
    if (idx >= 0) {
      const [removed] = this.queue.splice(idx, 1);
      return removed;
    }
    return null;
  }

  setPaused(paused) {
    this.paused = paused;
    if (!paused) {
      this.process().catch(() => {});
    }
  }

  async process() {
    if (this.processing || this.paused) return;
    this.processing = true;

    while (this.queue.length > 0 && !this.paused) {
      const run = this.queue.shift();
      await this.onRun(run);
    }

    this.processing = false;
  }
}

module.exports = { QueueEngine };
