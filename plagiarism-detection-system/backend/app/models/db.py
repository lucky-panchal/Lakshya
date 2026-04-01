import sqlite3
import os
import threading

# Use Render persistent disk in production, local path in development
DB_PATH = os.environ.get(
    "DATABASE_PATH",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "corpus.db"))
)

# Ensure the directory exists
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True) if os.path.dirname(DB_PATH) else None

# Thread-local storage so each thread gets its own connection
_local = threading.local()

def get_connection() -> sqlite3.Connection:
    if not hasattr(_local, "conn") or _local.conn is None:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        # WAL mode = much faster concurrent reads/writes
        conn.execute("PRAGMA journal_mode=WAL")
        # Keep data in memory cache — faster reads
        conn.execute("PRAGMA cache_size=-8000")   # 8MB cache
        conn.execute("PRAGMA synchronous=NORMAL") # faster writes, still safe
        conn.row_factory = sqlite3.Row
        _local.conn = conn
    return _local.conn

def init_db():
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS corpus (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            filename    TEXT      NOT NULL,
            content     TEXT      NOT NULL,
            source_type TEXT      NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS results (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            filename         TEXT  NOT NULL,
            similarity_score REAL  NOT NULL,
            matched_source   TEXT,
            details          TEXT,
            created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_corpus_id      ON corpus(id);
        CREATE INDEX IF NOT EXISTS idx_results_date   ON results(created_at DESC);
    """)
    conn.commit()
