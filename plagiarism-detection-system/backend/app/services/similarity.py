from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np

_bert_model = None

def get_bert_model():
    global _bert_model
    if _bert_model is None:
        _bert_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _bert_model

def tfidf_similarity(source: str, corpus: list[str]) -> list[float]:
    if not corpus:
        return []
    vectorizer = TfidfVectorizer(stop_words="english")
    vectors = vectorizer.fit_transform([source] + corpus)
    scores = cosine_similarity(vectors[0:1], vectors[1:]).flatten()
    return scores.tolist()

def bert_similarity(source: str, corpus: list[str]) -> list[float]:
    if not corpus:
        return []
    model = get_bert_model()
    embeddings = model.encode([source] + corpus, convert_to_numpy=True)
    scores = cosine_similarity([embeddings[0]], embeddings[1:]).flatten()
    return scores.tolist()

def compute_similarity(source: str, corpus: list[dict], mode: str = "tfidf") -> list[dict]:
    texts = [doc["content"] for doc in corpus]

    if mode == "bert":
        scores = bert_similarity(source, texts)
    else:
        scores = tfidf_similarity(source, texts)

    results = []
    for i, doc in enumerate(corpus):
        results.append({
            "filename": doc["filename"],
            "similarity": round(scores[i] * 100, 2),
            "source_type": doc.get("source_type", "unknown")
        })

    return sorted(results, key=lambda x: x["similarity"], reverse=True)
