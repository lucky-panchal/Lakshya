from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, check, corpus
from app.models.db import init_db
import asyncio

app = FastAPI(title="Plagiarism Detection System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # 1. Init database with WAL mode + indexes
    init_db()

    # 2. Pre-download NLTK punkt tokenizer so first highlight request is instant
    await asyncio.to_thread(_preload_nltk)

    # 3. Warm up BERT in background — doesn't block server startup
    asyncio.create_task(asyncio.to_thread(_warmup_bert))

def _preload_nltk():
    import nltk
    try:
        nltk.data.find("tokenizers/punkt")
    except LookupError:
        nltk.download("punkt", quiet=True)
    try:
        nltk.data.find("tokenizers/punkt_tab")
    except LookupError:
        nltk.download("punkt_tab", quiet=True)

def _warmup_bert():
    try:
        from app.services.similarity import warmup_bert
        warmup_bert()
        print("✓ BERT model warmed up and ready")
    except Exception as e:
        print(f"BERT warmup skipped: {e}")

app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(check.router,  prefix="/api/check",  tags=["check"])
app.include_router(corpus.router, prefix="/api/corpus", tags=["corpus"])

@app.get("/")
def root():
    return {"status": "Plagiarism Detection API running", "version": "2.0.0"}
