class TaskStore {
  constructor(db) {
    this.db = db;
    this.insertTaskStmt = db.prepare(`
      INSERT INTO tasks (id,name,prompt,trigger_type,schedule,watch_path,priority,retries,status,run_count,failed_count,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    this.updateTaskStatsStmt = db.prepare('UPDATE tasks SET status=?, run_count=?, failed_count=?, updated_at=? WHERE id=?');
    this.deleteTaskStmt = db.prepare('DELETE FROM tasks WHERE id=?');
    this.getTaskStmt = db.prepare('SELECT * FROM tasks WHERE id=?');
    this.listTasksStmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
  }

  _map(row) {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      prompt: row.prompt,
      trigger: row.trigger_type,
      schedule: row.schedule,
      watchPath: row.watch_path,
      priority: row.priority,
      retries: row.retries,
      status: row.status,
      runCount: row.run_count,
      failedCount: row.failed_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  create(task) {
    this.insertTaskStmt.run(
      task.id,
      task.name,
      task.prompt,
      task.trigger,
      task.schedule,
      task.watchPath,
      task.priority,
      task.retries,
      task.status,
      task.runCount,
      task.failedCount,
      task.createdAt,
      task.updatedAt
    );
    return task;
  }

  list() {
    return this.listTasksStmt.all().map((row) => this._map(row));
  }

  get(taskId) {
    return this._map(this.getTaskStmt.get(taskId));
  }

  delete(taskId) {
    this.deleteTaskStmt.run(taskId);
  }

  saveStats(task) {
    this.updateTaskStatsStmt.run(task.status, task.runCount, task.failedCount, task.updatedAt, task.id);
  }
}

module.exports = { TaskStore };
