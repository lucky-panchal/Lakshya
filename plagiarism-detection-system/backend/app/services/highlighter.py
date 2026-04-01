import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def get_highlighted_matches(source: str, corpus_doc: str, threshold: float = 0.5) -> dict:
    # Tokenize both documents into sentences
    source_sentences  = nltk.sent_tokenize(source)
    corpus_sentences  = nltk.sent_tokenize(corpus_doc)

    if not source_sentences or not corpus_sentences:
        return {
            "source_sentences":  [],
            "corpus_sentences":  [],
            "highlighted_source": [],
            "highlighted_corpus": [],
            "matches": []
        }

    all_sentences = source_sentences + corpus_sentences
    n_src = len(source_sentences)

    try:
        # sublinear_tf speeds up and improves quality
        vectorizer = TfidfVectorizer(stop_words="english", sublinear_tf=True)
        vectors = vectorizer.fit_transform(all_sentences)
    except ValueError:
        return {
            "source_sentences":   source_sentences,
            "corpus_sentences":   corpus_sentences,
            "highlighted_source": [],
            "highlighted_corpus": [],
            "matches": []
        }

    source_vectors = vectors[:n_src]
    corpus_vectors = vectors[n_src:]

    # Compute full similarity matrix in one shot — faster than looping
    sim_matrix = cosine_similarity(source_vectors, corpus_vectors)

    # Vectorized threshold check
    best_scores = sim_matrix.max(axis=1)
    best_indices = sim_matrix.argmax(axis=1)

    flagged = np.where(best_scores >= threshold)[0]

    matches           = []
    highlighted_source = []
    highlighted_corpus = set()

    for i in flagged:
        j     = int(best_indices[i])
        score = float(best_scores[i])
        matches.append({
            "source_index": int(i),
            "corpus_index": j,
            "score":        round(score * 100, 2)
        })
        highlighted_source.append(int(i))
        highlighted_corpus.add(j)

    return {
        "source_sentences":   source_sentences,
        "corpus_sentences":   corpus_sentences,
        "highlighted_source": highlighted_source,
        "highlighted_corpus": list(highlighted_corpus),
        "matches":            matches
    }
