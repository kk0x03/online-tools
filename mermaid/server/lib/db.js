import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { config } from './config.js'

let db = null

function resolveDbPath() {
  if (config.auth.dbPath === ':memory:') return config.auth.dbPath
  return resolve(process.cwd(), config.auth.dbPath)
}

export function getDb() {
  if (!db) {
    const dbPath = resolveDbPath()
    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true })
    }
    db = new DatabaseSync(dbPath)
    db.exec('PRAGMA foreign_keys = ON')
    db.exec('PRAGMA journal_mode = WAL')
  }
  return db
}

export function initDb() {
  const database = getDb()

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      created_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS email_login_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      consumed_at TEXT,
      created_at TEXT NOT NULL,
      request_ip TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_email_login_codes_email_created
      ON email_login_codes(email, created_at);

    CREATE INDEX IF NOT EXISTS idx_email_login_codes_request_ip_created
      ON email_login_codes(request_ip, created_at);

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token_hash
      ON sessions(token_hash);

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id
      ON sessions(user_id);

    CREATE TABLE IF NOT EXISTS ai_usage_counters (
      identity_key TEXT NOT NULL,
      feature TEXT NOT NULL,
      window_type TEXT NOT NULL,
      window_start TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (identity_key, feature, window_type, window_start)
    );

    CREATE INDEX IF NOT EXISTS idx_ai_usage_counters_lookup
      ON ai_usage_counters(identity_key, feature, window_type, window_start);

    CREATE TABLE IF NOT EXISTS ai_usage_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      anon_id_hash TEXT,
      ip_hash TEXT,
      feature TEXT NOT NULL,
      status TEXT NOT NULL,
      counted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ai_usage_events_created
      ON ai_usage_events(created_at);

    CREATE INDEX IF NOT EXISTS idx_ai_usage_events_feature_status
      ON ai_usage_events(feature, status, created_at);
  `)

  return database
}
