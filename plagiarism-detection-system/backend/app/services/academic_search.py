import requests
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Helpers ───────────────────────────────────────────────────────

def _extract_key_phrases(text: str, max_phrases: int = 3) -> list[str]:
    """Extract the most meaningful sentences to use as search queries."""
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 40]
    # Pick sentences from different parts of the document
    if not sentences:
        return [text[:200]]
    step = max(1, len(sentences) // max_phrases)
    picked = [sentences[i] for i in range(0, len(sentences), step)][:max_phrases]
    return picked


def _tfidf_score(source: str, candidate: str) -> float:
    """Quick TF-IDF cosine similarity between two texts."""
    if not source.strip() or not candidate.strip():
        return 0.0
    try:
        vec = TfidfVectorizer(stop_words="english", sublinear_tf=True)
        matrix = vec.fit_transform([source, candidate])
        score = cosine_similarity(matrix[0:1], matrix[1:2]).flatten()[0]
        return round(float(score) * 100, 2)
    except Exception:
        return 0.0


# ── Semantic Scholar ──────────────────────────────────────────────

def search_semantic_scholar(text: str) -> list[dict]:
    """Search Semantic Scholar for matching academic papers."""
    results = []
    phrases = _extract_key_phrases(text, max_phrases=2)

    for phrase in phrases:
        try:
            query = phrase[:200]
            url   = "https://api.semanticscholar.org/graph/v1/paper/search"
            params = {
                "query":  query,
                "limit":  5,
                "fields": "title,authors,year,abstract,externalIds,url,venue"
            }
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code != 200:
                continue

            for paper in resp.json().get("data", []):
                abstract = paper.get("abstract") or ""
                title    = paper.get("title")    or ""
                if not title:
                    continue

                candidate_text = f"{title} {abstract}"
                score = _tfidf_score(text[:1000], candidate_text)
                if score < 5:
                    continue

                authors = ", ".join(
                    a.get("name", "") for a in paper.get("authors", [])[:3]
                )
                doi = paper.get("externalIds", {}).get("DOI", "")
                paper_url = paper.get("url") or (f"https://doi.org/{doi}" if doi else "")

                results.append({
                    "source":   "Semantic Scholar",
                    "title":    title,
                    "authors":  authors,
                    "year":     paper.get("year", ""),
                    "venue":    paper.get("venue", ""),
                    "doi":      doi,
                    "url":      paper_url,
                    "abstract": abstract[:300] + "..." if len(abstract) > 300 else abstract,
                    "similarity": score
                })
        except Exception:
            continue

    return results


# ── CrossRef ─────────────────────────────────────────────────────

def search_crossref(text: str) -> list[dict]:
    """Search CrossRef for matching published journal articles."""
    results = []
    phrases = _extract_key_phrases(text, max_phrases=2)

    for phrase in phrases:
        try:
            url    = "https://api.crossref.org/works"
            params = {
                "query":            phrase[:200],
                "rows":             5,
                "select":           "title,author,published,DOI,abstract,URL,container-title",
                "mailto":           "lakshyaai@research.com"
            }
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code != 200:
                continue

            for item in resp.json().get("message", {}).get("items", []):
                title_list = item.get("title", [])
                title      = title_list[0] if title_list else ""
                if not title:
                    continue

                abstract   = item.get("abstract", "")
                # CrossRef abstracts have XML tags — strip them
                abstract   = re.sub(r'<[^>]+>', '', abstract)

                candidate_text = f"{title} {abstract}"
                score = _tfidf_score(text[:1000], candidate_text)
                if score < 5:
                    continue

                authors = ", ".join(
                    f"{a.get('given', '')} {a.get('family', '')}".strip()
                    for a in item.get("author", [])[:3]
                )
                doi      = item.get("DOI", "")
                pub_date = item.get("published", {}).get("date-parts", [[""]])[0][0]
                journal  = ""
                ct       = item.get("container-title", [])
                if ct:
                    journal = ct[0]

                results.append({
                    "source":   "CrossRef",
                    "title":    title,
                    "authors":  authors,
                    "year":     pub_date,
                    "venue":    journal,
                    "doi":      doi,
                    "url":      f"https://doi.org/{doi}" if doi else item.get("URL", ""),
                    "abstract": abstract[:300] + "..." if len(abstract) > 300 else abstract,
                    "similarity": score
                })
        except Exception:
            continue

    return results


# ── arXiv ─────────────────────────────────────────────────────────

def search_arxiv(text: str) -> list[dict]:
    """Search arXiv for matching preprints."""
    results = []
    phrases = _extract_key_phrases(text, max_phrases=2)

    for phrase in phrases:
        try:
            query = phrase[:200].replace(" ", "+")
            url   = f"http://export.arxiv.org/api/query?search_query=all:{query}&max_results=5"
            resp  = requests.get(url, timeout=10)
            if resp.status_code != 200:
                continue

            # Parse Atom XML response
            entries = re.findall(r'<entry>(.*?)</entry>', resp.text, re.DOTALL)
            for entry in entries:
                title    = re.search(r'<title>(.*?)</title>',     entry, re.DOTALL)
                abstract = re.search(r'<summary>(.*?)</summary>', entry, re.DOTALL)
                link     = re.search(r'<id>(.*?)</id>',           entry, re.DOTALL)
                authors_raw = re.findall(r'<name>(.*?)</name>',   entry)
                published   = re.search(r'<published>(.*?)</published>', entry)

                title    = title.group(1).strip()    if title    else ""
                abstract = abstract.group(1).strip() if abstract else ""
                link     = link.group(1).strip()     if link     else ""
                year     = published.group(1)[:4]    if published else ""

                if not title:
                    continue

                candidate_text = f"{title} {abstract}"
                score = _tfidf_score(text[:1000], candidate_text)
                if score < 5:
                    continue

                results.append({
                    "source":   "arXiv",
                    "title":    title,
                    "authors":  ", ".join(authors_raw[:3]),
                    "year":     year,
                    "venue":    "arXiv Preprint",
                    "doi":      "",
                    "url":      link,
                    "abstract": abstract[:300] + "..." if len(abstract) > 300 else abstract,
                    "similarity": score
                })
        except Exception:
            continue

    return results


# ── Main Entry Point ──────────────────────────────────────────────

def search_academic_databases(text: str) -> dict:
    """
    Run all 3 academic database searches in parallel-ish fashion.
    Returns combined deduplicated results sorted by similarity.
    """
    all_results = []

    # Run all 3 searches
    all_results.extend(search_semantic_scholar(text))
    all_results.extend(search_crossref(text))
    all_results.extend(search_arxiv(text))

    # Deduplicate by title similarity
    seen_titles = []
    unique = []
    for r in all_results:
        title_lower = r["title"].lower()
        is_dup = any(
            _tfidf_score(title_lower, seen) > 70
            for seen in seen_titles
        )
        if not is_dup:
            seen_titles.append(title_lower)
            unique.append(r)

    # Sort by similarity descending
    unique.sort(key=lambda x: x["similarity"], reverse=True)

    top_score = unique[0]["similarity"] if unique else 0

    return {
        "academic_matches":     unique[:10],
        "academic_top_score":   top_score,
        "academic_sources_count": len(unique),
        "databases_searched":   ["Semantic Scholar", "CrossRef", "arXiv"]
    }
