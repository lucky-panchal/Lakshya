from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
import hashlib
import time

# ── BERT model — loaded once, reused forever ─────────────────────
_bert_model: SentenceTransformer | None = None

def get_bert_model() -> SentenceTransformer:
    global _bert_model
    if _bert_model is None:
        _bert_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _bert_model

def warmup_bert():
    """Call on startup so first real request is instant."""
    model = get_bert_model()
    model.encode(["warmup"], convert_to_numpy=True)

# ── TF-IDF corpus cache ───────────────────────────────────────────
# Key: hash of all corpus texts combined
# Value: (vectorizer, corpus_vectors, corpus_ids)
_tfidf_cache: dict = {}

def _corpus_hash(texts: list[str]) -> str:
    combined = "||".join(texts)
    return hashlib.md5(combined.encode()).hexdigest()

def tfidf_similarity(source: str, corpus: list[str]) -> list[float]:
    if not corpus:
        return []

    cache_key = _corpus_hash(corpus)

    if cache_key in _tfidf_cache:
        vectorizer, corpus_vectors = _tfidf_cache[cache_key]
        # Transform only the source using the cached vectorizer
        source_vector = vectorizer.transform([source])
    else:
        vectorizer = TfidfVectorizer(stop_words="english", sublinear_tf=True)
        all_vectors = vectorizer.fit_transform([source] + corpus)
        source_vector = all_vectors[0:1]
        corpus_vectors = all_vectors[1:]
        # Cache for next request with same corpus
        _tfidf_cache[cache_key] = (vectorizer, corpus_vectors)
        # Keep cache small — max 3 entries
        if len(_tfidf_cache) > 3:
            oldest = next(iter(_tfidf_cache))
            del _tfidf_cache[oldest]

    scores = cosine_similarity(source_vector, corpus_vectors).flatten()
    return scores.tolist()

# ── BERT corpus embeddings cache ─────────────────────────────────
_bert_cache: dict = {}

def bert_similarity(source: str, corpus: list[str]) -> list[float]:
    if not corpus:
        return []

    model = get_bert_model()
    cache_key = _corpus_hash(corpus)

    if cache_key in _bert_cache:
        corpus_embeddings = _bert_cache[cache_key]
    else:
        # Encode corpus in one batch — much faster than one by one
        corpus_embeddings = model.encode(
            corpus,
            convert_to_numpy=True,
            batch_size=32,
            show_progress_bar=False
        )
        _bert_cache[cache_key] = corpus_embeddings
        # Keep cache small
        if len(_bert_cache) > 3:
            oldest = next(iter(_bert_cache))
            del _bert_cache[oldest]

    # Encode only the source document
    source_embedding = model.encode(
        [source],
        convert_to_numpy=True,
        batch_size=1,
        show_progress_bar=False
    )

    scores = cosine_similarity(source_embedding, corpus_embeddings).flatten()
    return scores.tolist()

# ── Invalidate cache when corpus changes ─────────────────────────
def invalidate_similarity_cache():
    """Call this whenever a corpus document is added or deleted."""
    _tfidf_cache.clear()
    _bert_cache.clear()

# ── Main entry point ─────────────────────────────────────────────
def compute_similarity(source: str, corpus: list[dict], mode: str = "tfidf") -> list[dict]:
    texts = [doc["content"] for doc in corpus]

    scores = bert_similarity(source, texts) if mode == "bert" else tfidf_similarity(source, texts)

    results = [
        {
            "filename":    doc["filename"],
            "similarity":  round(scores[i] * 100, 2),
            "source_type": doc.get("source_type", "unknown"),
            "url":         doc.get("url", ""),
        }
        for i, doc in enumerate(corpus)
    ]

    return sorted(results, key=lambda x: x["similarity"], reverse=True)
