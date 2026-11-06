import os
import shutil

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field

from rag_engine import add_document, generate_answer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCUMENT_DIR = os.path.join(BASE_DIR, "documents")
os.makedirs(DOCUMENT_DIR, exist_ok=True)

app = FastAPI(
    title="Independent AI Tutor",
    description="Standalone RAG-based AI Tutor with grounded answers and source citations",
    version="1.0.0",
)


class TutorRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)


class TutorResponse(BaseModel):
    answer: str
    sources: list[dict]


@app.get("/")
def home():
    return {
        "message": "Independent AI Tutor API is running",
        "upload_endpoint": "/api/tutor/upload",
        "generate_endpoint": "/api/tutor/generate",
        "swagger": "/docs",
    }


@app.post("/api/tutor/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = os.path.basename(file.filename or "")
    if not filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")

    file_path = os.path.join(DOCUMENT_DIR, filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        chunks_added = add_document(file_path)
        return {
            "message": "Document uploaded and indexed successfully",
            "filename": filename,
            "chunks_added": chunks_added,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        await file.close()


@app.post("/api/tutor/generate", response_model=TutorResponse)
def generate_tutor_response(request: TutorRequest):
    try:
        result = generate_answer(request.question)
        return TutorResponse(answer=result["answer"], sources=result["sources"])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
