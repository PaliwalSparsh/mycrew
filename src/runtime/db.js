const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

class RuntimeDb {
  constructor(dbPath) {
    const baseDir = path.dirname(dbPath);
    fs.mkdirSync(baseDir, { recursive: true });
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this._migrate();
  }

  _migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        prompt TEXT NOT NULL,
        trigger_type TEXT NOT NULL,
        schedule TEXT,
        watch_path TEXT,
        priority INTEGER NOT NULL,
        retries INTEGER NOT NULL,
        status TEXT NOT NULL,
        run_count INTEGER NOT NULL,
        failed_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS runs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        source TEXT NOT NULL,
        state TEXT NOT NULL,
        attempts INTEGER NOT NULL,
        max_attempts INTEGER NOT NULL,
        queued_at TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT,
        error_message TEXT,
        FOREIGN KEY(task_id) REFERENCES tasks(id)
      );
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        run_id TEXT,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        run_id TEXT,
        action_type TEXT NOT NULL,
        action_payload TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        resolved_at TEXT
      );
    `);
  }
}

module.exports = { RuntimeDb };
