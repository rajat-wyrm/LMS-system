from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
import json
from datetime import datetime
from app.db.models import Notebook, User
from app.db.session import get_session
from app.vectorstore.chroma_store import ChromaStore
from app.services.rag_service import RAGService

router = APIRouter()
chroma_store = ChromaStore()
rag_service = RAGService(chroma_store)

class TitleGenerateRequest(BaseModel):
    description: str

class NotebookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    embedding_model: Optional[str] = None
    use_reranking: Optional[bool] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None

@router.post("", response_model=Notebook)
def create_notebook(notebook_in: Notebook, session: Session = Depends(get_session)):
    # For now, we assume a default user exists or we create one if not provided
    # In a real app, this would come from auth
    user = session.exec(select(User)).first()
    if not user:
        user = User(name="Default User", email="user@example.com")
        session.add(user)
        session.commit()
        session.refresh(user)
    
    notebook_in.user_id = user.id
    session.add(notebook_in)
    session.commit()
    session.refresh(notebook_in)
    return notebook_in

@router.get("", response_model=List[Notebook])
def list_notebooks(session: Session = Depends(get_session)):
    statement = select(Notebook).order_by(Notebook.updated_at.desc())
    return session.exec(statement).all()

@router.get("/{id}", response_model=Notebook)
def get_notebook(id: str, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    # Update last opened/accessed time
    notebook.updated_at = datetime.utcnow()
    session.add(notebook)
    session.commit()
    session.refresh(notebook)
    
    return notebook

@router.patch("/{id}", response_model=Notebook)
def update_notebook(id: str, notebook_update: NotebookUpdate, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    if notebook_update.title is not None:
        notebook.title = notebook_update.title
    if notebook_update.description is not None:
        notebook.description = notebook_update.description
    if notebook_update.embedding_model is not None:
        notebook.embedding_model = notebook_update.embedding_model
    if notebook_update.use_reranking is not None:
        notebook.use_reranking = notebook_update.use_reranking
    if notebook_update.chunk_size is not None:
        notebook.chunk_size = notebook_update.chunk_size
    if notebook_update.chunk_overlap is not None:
        notebook.chunk_overlap = notebook_update.chunk_overlap
        
    session.add(notebook)
    session.commit()
    session.refresh(notebook)
    return notebook

@router.get("/{id}/suggested-topics")
def get_suggested_topics(id: str, source_names: Optional[str] = None, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    # Optional source filtering (source_names passed as comma-separated string)
    sources = source_names.split(",") if source_names else None
    
    return rag_service.get_suggested_topics(id, source_names=sources)

@router.delete("/{id}")
def delete_notebook(id: str, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    # Delete from vector store
    chroma_store.delete_notebook_data(id)
    
    session.delete(notebook)
    session.commit()
    return {"message": "Notebook deleted"}

@router.post("/generate-title")
def generate_title(req: TitleGenerateRequest):
    title = rag_service.generate_title(req.description)
    return {"title": title}

@router.post("/{id}/generate-description")
def generate_description(id: str, source_names: Optional[List[str]] = None, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    description = rag_service.generate_description(id, source_names=source_names)
    notebook.description = description
    session.add(notebook)
    session.commit()
    session.refresh(notebook)
    return {"description": description}
