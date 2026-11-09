import { createClient } from '@libsql/client';

let db;
let initialized;

export function getDb() {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) throw new Error('Turso environment missing');
    db = createClient({ url, authToken });
  }
  return db;
}

const schema = [
  `CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK(severity IN ('low','medium','high','critical')),
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','investigating','resolved')),
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,
  'CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status)',
  'CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity)',
  `CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    summary TEXT NOT NULL,
    model TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    FOREIGN KEY(incident_id) REFERENCES incidents(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER,
    action TEXT NOT NULL CHECK(action IN ('create','update','delete')),
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`
];

export async function initDb() {
  if (!initialized) {
    initialized = (async () => {
      const client = getDb();
      for (const statement of schema) await client.execute(statement);
    })().catch(err => { initialized = undefined; throw err; });
  }
  return initialized;
}

export async function sql(statement, args = []) {
  await initDb();
  return getDb().execute({ sql: statement, args });
}
