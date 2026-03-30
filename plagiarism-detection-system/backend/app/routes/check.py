from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.parser import parse_file, extract_url
from app.services.similarity import compute_similarity
from app.services.corpus_manager import get_corpus, save_result, get_corpus_doc_by_id
from app.services.highlighter import get_highlighted_matches
import json

router = APIRouter()

@router.post("/file")
async def check_file(file: UploadFile = File(...), mode: str = Form(default="tfidf")):
    try:
        content = await parse_file(file)
        return await _run_check(file.filename, content, mode)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/url")
async def check_url(url: str = Form(...), mode: str = Form(default="tfidf")):
    try:
        from app.services.parser import extract_url
        content = extract_url(url)
        return await _run_check(url, content, mode)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/text")
async def check_text(text: str = Form(...), label: str = Form(default="manual input"), mode: str = Form(default="tfidf")):
    return await _run_check(label, text, mode)

async def _run_check(name: str, content: str, mode: str):
    corpus = get_corpus()
    if not corpus:
        raise HTTPException(status_code=400, detail="Corpus is empty. Upload documents first.")

    matches = compute_similarity(content, corpus, mode)
    top_match = matches[0] if matches else {}
    top_score = top_match.get("similarity", 0)

    save_result(name, top_score, top_match.get("filename", ""), json.dumps(matches[:10]))

    return {
        "document": name,
        "top_similarity": top_score,
        "top_match": top_match.get("filename", ""),
        "mode": mode,
        "matches": matches[:10],
        "extracted_text": content
    }

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
