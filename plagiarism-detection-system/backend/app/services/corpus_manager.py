from app.models.db import get_connection

def add_to_corpus(filename: str, content: str, source_type: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO corpus (filename, content, source_type) VALUES (?, ?, ?)",
        (filename, content, source_type)
    )
    conn.commit()
    conn.close()

def get_corpus() -> list[dict]:
    conn = get_connection()
    rows = conn.execute("SELECT id, filename, content, source_type FROM corpus").fetchall()
    conn.close()
    return [{"id": r[0], "filename": r[1], "content": r[2], "source_type": r[3]} for r in rows]

def get_corpus_doc_by_id(doc_id: int) -> dict | None:
    conn = get_connection()
    row = conn.execute("SELECT id, filename, content, source_type FROM corpus WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    if row:
        return {"id": row[0], "filename": row[1], "content": row[2], "source_type": row[3]}
    return None

def delete_from_corpus(doc_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM corpus WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()

def save_result(filename: str, score: float, matched_source: str, details: str):
    conn = get_connection()
    conn.execute(
        "INSERT INTO results (filename, similarity_score, matched_source, details) VALUES (?, ?, ?, ?)",
        (filename, score, matched_source, details)
    )
    conn.commit()
    conn.close()

def get_results() -> list[dict]:
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, filename, similarity_score, matched_source, details, created_at FROM results ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [
        {"id": r[0], "filename": r[1], "score": r[2], "matched_source": r[3], "details": r[4], "created_at": r[5]}
        for r in rows
    ]

def delete_result(result_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM results WHERE id = ?", (result_id,))
    conn.commit()
    conn.close()

def clear_all_results():
    conn = get_connection()
    conn.execute("DELETE FROM results")
    conn.commit()
    conn.close()
