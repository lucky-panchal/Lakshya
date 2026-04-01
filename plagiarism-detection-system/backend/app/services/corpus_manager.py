from app.models.db import get_connection

# ── In-memory corpus cache ────────────────────────────────────────
# Avoids hitting SQLite on every single check request
_corpus_cache: list[dict] | None = None

def _invalidate_corpus_cache():
    global _corpus_cache
    _corpus_cache = None

# ── Corpus operations ─────────────────────────────────────────────
def add_to_corpus(filename: str, content: str, source_type: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO corpus (filename, content, source_type) VALUES (?, ?, ?)",
        (filename, content, source_type)
    )
    conn.commit()
    _invalidate_corpus_cache()
    # Also invalidate similarity cache so new doc is included
    from app.services.similarity import invalidate_similarity_cache
    invalidate_similarity_cache()

def get_corpus() -> list[dict]:
    global _corpus_cache
    if _corpus_cache is not None:
        return _corpus_cache
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, filename, content, source_type FROM corpus"
    ).fetchall()
    _corpus_cache = [
        {"id": r[0], "filename": r[1], "content": r[2], "source_type": r[3]}
        for r in rows
    ]
    return _corpus_cache

def get_corpus_doc_by_id(doc_id: int) -> dict | None:
    # Check cache first
    cache = get_corpus()
    for doc in cache:
        if doc["id"] == doc_id:
            return doc
    return None

def delete_from_corpus(doc_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM corpus WHERE id = ?", (doc_id,))
    conn.commit()
    _invalidate_corpus_cache()
    from app.services.similarity import invalidate_similarity_cache
    invalidate_similarity_cache()

# ── Results operations ────────────────────────────────────────────
def save_result(filename: str, score: float, matched_source: str, details: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO results (filename, similarity_score, matched_source, details) VALUES (?, ?, ?, ?)",
        (filename, score, matched_source, details)
    )
    conn.commit()

def get_results() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, filename, similarity_score, matched_source, details, created_at "
        "FROM results ORDER BY created_at DESC"
    ).fetchall()
    return [
        {
            "id":             r[0],
            "filename":       r[1],
            "score":          r[2],
            "matched_source": r[3],
            "details":        r[4],
            "created_at":     r[5],
        }
        for r in rows
    ]

def delete_result(result_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM results WHERE id = ?", (result_id,))
    conn.commit()

def clear_all_results():
    conn = get_connection()
    conn.execute("DELETE FROM results")
    conn.commit()
