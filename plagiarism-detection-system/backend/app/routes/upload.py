from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.parser import parse_file, extract_url
from app.services.corpus_manager import add_to_corpus

router = APIRouter()

@router.post("/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await parse_file(file)
        add_to_corpus(file.filename, content, "file")
        return {"message": f"{file.filename} added to corpus", "chars": len(content)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/url")
async def upload_url(url: str = Form(...)):
    try:
        content = extract_url(url)
        add_to_corpus(url, content, "url")
        return {"message": f"URL content added to corpus", "chars": len(content)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
