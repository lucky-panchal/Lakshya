from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, check, corpus
from app.models.db import init_db

app = FastAPI(title="Plagiarism Detection System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    init_db()

app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(check.router, prefix="/api/check", tags=["check"])
app.include_router(corpus.router, prefix="/api/corpus", tags=["corpus"])

@app.get("/")
def root():
    return {"status": "Plagiarism Detection API running"}
