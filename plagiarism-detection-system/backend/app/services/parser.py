import fitz  # PyMuPDF
import docx
import requests
from bs4 import BeautifulSoup
from fastapi import UploadFile
import io

async def parse_file(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        return extract_pdf(content)
    elif filename.endswith(".docx"):
        return extract_docx(content)
    elif filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    else:
        raise ValueError(f"Unsupported file type: {file.filename}")

def extract_pdf(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    return " ".join(page.get_text() for page in doc).strip()

def extract_docx(content: bytes) -> str:
    doc = docx.Document(io.BytesIO(content))
    return " ".join(p.text for p in doc.paragraphs if p.text.strip())

def extract_url(url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    response = requests.get(url, timeout=10, headers=headers)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)
