from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.parser import parse_file, extract_url
from app.services.similarity import compute_similarity
from app.services.corpus_manager import get_corpus, save_result, get_corpus_doc_by_id
from app.services.highlighter import get_highlighted_matches
from app.services.academic_search import search_academic_databases
import asyncio
import json

router = APIRouter()

@router.post("/file")
async def check_file(
    file: UploadFile = File(...),
    mode: str = Form(default="tfidf"),
    include_academic: bool = Form(default=False)
):
    try:
        content = await parse_file(file)
        return await _run_check(file.filename, content, mode, include_academic)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/url")
async def check_url(
    url: str = Form(...),
    mode: str = Form(default="tfidf"),
    include_academic: bool = Form(default=False)
):
    try:
        content = extract_url(url)
        return await _run_check(url, content, mode, include_academic)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/text")
async def check_text(
    text: str = Form(...),
    label: str = Form(default="manual input"),
    mode: str = Form(default="tfidf"),
    include_academic: bool = Form(default=False)
):
    return await _run_check(label, text, mode, include_academic)

async def _run_check(name: str, content: str, mode: str, include_academic: bool = False):
    corpus = get_corpus()
    if not corpus:
        raise HTTPException(status_code=400, detail="Corpus is empty. Upload documents first.")

    # Run corpus similarity
    matches = compute_similarity(content, corpus, mode)
    top_match = matches[0] if matches else {}
    top_score = top_match.get("similarity", 0)

    save_result(name, top_score, top_match.get("filename", ""), json.dumps(matches[:10]))

    response = {
        "document":       name,
        "top_similarity": top_score,
        "top_match":      top_match.get("filename", ""),
        "mode":           mode,
        "matches":        matches[:10],
        "extracted_text": content,
        "academic":       None
    }

    # Run academic search if requested
    if include_academic:
        try:
            academic = await asyncio.to_thread(search_academic_databases, content)
            response["academic"] = academic
        except Exception:
            response["academic"] = {
                "academic_matches":       [],
                "academic_top_score":     0,
                "academic_sources_count": 0,
                "databases_searched":     []
            }

    return response

@router.post("/academic")
async def check_academic_only(
    text: str = Form(...),
):
    """Standalone endpoint — search academic databases only, no corpus needed."""
    try:
        result = await asyncio.to_thread(search_academic_databases, text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/highlight")
async def highlight_matches(
    text: str = Form(...),
    corpus_id: int = Form(...),
    threshold: float = Form(default=0.5)
):
    corpus = get_corpus()
    doc = next((d for d in corpus if d["id"] == corpus_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Corpus document not found")
    result = get_highlighted_matches(text, doc["content"], threshold)
    return {"corpus_filename": doc["filename"], **result}

@router.post("/highlight/file")
async def highlight_file(
    file: UploadFile = File(...),
    corpus_id: int = Form(...),
    threshold: float = Form(default=0.5)
):
    try:
        content = await parse_file(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    corpus = get_corpus()
    doc = next((d for d in corpus if d["id"] == corpus_id), None)
    if not doc:
        raise HTTPException(status_code=404, detail="Corpus document not found")
    result = get_highlighted_matches(content, doc["content"], threshold)
    return {"corpus_filename": doc["filename"], **result}

@router.get("/results")
def get_all_results():
    from app.services.corpus_manager import get_results
    return get_results()

@router.delete("/results/clear")
def clear_results():
    from app.services.corpus_manager import clear_all_results
    clear_all_results()
    return {"message": "All results cleared"}

@router.delete("/results/{result_id}")
def delete_result(result_id: int):
    from app.services.corpus_manager import delete_result
    delete_result(result_id)
    return {"message": f"Result {result_id} deleted"}
