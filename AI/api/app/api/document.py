from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import List
import os
import shutil
from app.db.models import Document, Notebook
from app.db.session import get_session
from file_processor import FileProcessor
from app.vectorstore.chroma_store import ChromaStore

router = APIRouter()
processor = FileProcessor()
chroma_store = ChromaStore()

UPLOAD_DIR = "data/uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/notebooks/{id}/documents", response_model=Document)
async def upload_document(id: str, file: UploadFile = File(...), session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    # Basic filename sanitization
    filename = os.path.basename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    db_doc = Document(name=filename, file_url=file_path, notebook_id=id, status="processing")
    session.add(db_doc)
    session.commit()
    session.refresh(db_doc)
    
    # Process document
    try:
        ext = filename.lower()
        if ext.endswith(".pdf"):
            docs = processor.load_pdf(file_path)
        elif ext.endswith((".pptx", ".ppt")):
            docs = processor.load_ppt(file_path)
        elif ext.endswith((".txt", ".md")):
            docs = processor.load_txt(file_path)
        else:
            db_doc.status = "error"
            session.add(db_doc)
            session.commit()
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")

        if not docs:
            raise Exception("No content could be extracted from the file.")

        dyn_processor = FileProcessor(
            chunk_size=getattr(notebook, "chunk_size", 500),
            chunk_overlap=getattr(notebook, "chunk_overlap", 100)
        )
        chunks = dyn_processor.split_documents(docs)
        if not chunks:
            raise Exception("Document splitting resulted in zero chunks.")

        dyn_chroma_store = ChromaStore(model_name=notebook.embedding_model)
        dyn_chroma_store.add_documents(chunks, notebook_id=id)
        
        db_doc.status = "indexed"
        session.add(db_doc)
        session.commit()
        session.refresh(db_doc)
    except Exception as e:
        db_doc.status = "error"
        session.add(db_doc)
        session.commit()
        # Log the error (optional: print or use a logger)
        print(f"Error processing {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
        
    return db_doc

@router.get("/notebooks/{id}/documents", response_model=List[Document])
def list_documents(id: str, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook.documents

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str, session: Session = Depends(get_session)):
    doc = session.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from vector store
    notebook = session.get(Notebook, doc.notebook_id)
    if notebook:
        dyn_chroma_store = ChromaStore(model_name=notebook.embedding_model)
        dyn_chroma_store.delete_document_data(doc.notebook_id, os.path.basename(doc.file_url))
    
    # Delete file
    if os.path.exists(doc.file_url):
        os.remove(doc.file_url)
        
    session.delete(doc)
    session.commit()
    return {"message": "Document deleted"}
