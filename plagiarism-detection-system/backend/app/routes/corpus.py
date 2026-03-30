from fastapi import APIRouter, HTTPException
from app.services.corpus_manager import get_corpus, delete_from_corpus

router = APIRouter()

@router.get("/")
def list_corpus():
    corpus = get_corpus()
    return [{"id": doc["id"], "filename": doc["filename"], "source_type": doc["source_type"]} for doc in corpus]

@router.delete("/{doc_id}")
def remove_document(doc_id: int):
    try:
        delete_from_corpus(doc_id)
        return {"message": f"Document {doc_id} removed from corpus"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
