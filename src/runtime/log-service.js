class LogService {
  constructor(db) {
    this.db = db;
    this.insertStmt = db.prepare('INSERT INTO events (id, run_id, type, payload, created_at) VALUES (?,?,?,?,?)');
    this.listStmt = db.prepare('SELECT * FROM events ORDER BY created_at DESC LIMIT ?');
  }

  log({ id, runId = null, type, payload, createdAt }) {
    this.insertStmt.run(id, runId, type, JSON.stringify(payload ?? {}), createdAt);
    return { id, runId, type, payload, at: createdAt };
  }

  list(limit = 200) {
    return this.listStmt.all(limit).map((row) => ({
      id: row.id,
      runId: row.run_id,
      type: row.type,
      data: JSON.parse(row.payload),
      at: row.created_at
    }));
  }
}

module.exports = { LogService };
