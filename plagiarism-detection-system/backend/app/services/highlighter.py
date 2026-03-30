import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def get_highlighted_matches(source: str, corpus_doc: str, threshold: float = 0.5) -> dict:
    source_sentences = nltk.sent_tokenize(source)
    corpus_sentences = nltk.sent_tokenize(corpus_doc)

    if not source_sentences or not corpus_sentences:
        return {"source_sentences": [], "corpus_sentences": [], "matches": []}

    all_sentences = source_sentences + corpus_sentences
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        vectors = vectorizer.fit_transform(all_sentences)
    except ValueError:
        return {"source_sentences": source_sentences, "corpus_sentences": corpus_sentences, "matches": []}

    source_vectors = vectors[:len(source_sentences)]
    corpus_vectors = vectors[len(source_sentences):]
    similarity_matrix = cosine_similarity(source_vectors, corpus_vectors)

    matches = []
    highlighted_source = []
    highlighted_corpus = set()

    for i, source_sent in enumerate(source_sentences):
        best_score = float(similarity_matrix[i].max())
        best_j = int(similarity_matrix[i].argmax())
        if best_score >= threshold:
            matches.append({
                "source_index": i,
                "corpus_index": best_j,
                "score": round(best_score * 100, 2)
            })
            highlighted_source.append(i)
            highlighted_corpus.add(best_j)

    return {
        "source_sentences": source_sentences,
        "corpus_sentences": corpus_sentences,
        "highlighted_source": highlighted_source,
        "highlighted_corpus": list(highlighted_corpus),
        "matches": matches
    }
