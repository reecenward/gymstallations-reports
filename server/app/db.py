import os
import sqlite3
from contextlib import contextmanager

from .config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  job_number TEXT NOT NULL,
  client_name TEXT,
  site_address TEXT,
  equipment_type TEXT,
  payload_json TEXT NOT NULL,
  email_status TEXT NOT NULL DEFAULT 'pending',
  email_error TEXT,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
"""


def init_db() -> None:
    db_dir = os.path.dirname(os.path.abspath(settings.db_path))
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    with connect() as conn:
        conn.executescript(SCHEMA)
        # Add columns introduced after the original schema. SQLite has no
        # IF NOT EXISTS for ADD COLUMN, so we probe pragma_table_info first.
        cols = {r["name"] for r in conn.execute("PRAGMA table_info(users)")}
        if "is_admin" not in cols:
            conn.execute("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0")
        conn.commit()


@contextmanager
def connect():
    conn = sqlite3.connect(settings.db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        conn.close()
