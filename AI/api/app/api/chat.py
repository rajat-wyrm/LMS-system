from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from app.db.models import Chat, Message, Notebook
from app.db.session import get_session
from app.services.rag_service import RAGService
from app.vectorstore.chroma_store import ChromaStore

router = APIRouter()
chroma_store = ChromaStore()
rag_service = RAGService(chroma_store)

class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"

class QuestionRequest(BaseModel):
    question: str
    source_names: Optional[List[str]] = None

class QuestionResponse(BaseModel):
    answer: str
    sources: List[dict]

@router.post("/notebooks/{id}/chats", response_model=Chat)
def create_chat(id: str, chat_in: ChatCreate, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    # Try to find existing chat with same title
    statement = select(Chat).where(Chat.notebook_id == id).where(Chat.title == chat_in.title)
    existing_chat = session.exec(statement).first()
    if existing_chat:
        return existing_chat
    
    db_chat = Chat(title=chat_in.title, notebook_id=id)
    session.add(db_chat)
    session.commit()
    session.refresh(db_chat)
    return db_chat

@router.get("/notebooks/{id}/chats", response_model=List[Chat])
def list_chats(id: str, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return notebook.chats

@router.get("/chats/{chat_id}/messages", response_model=List[Message])
def get_messages(chat_id: str, session: Session = Depends(get_session)):
    chat = session.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat.messages

@router.post("/chats/{chat_id}/ask", response_model=QuestionResponse)
def ask_question(chat_id: str, req: QuestionRequest, session: Session = Depends(get_session)):
    chat = session.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    notebook = session.get(Notebook, chat.notebook_id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
        
    # Dynamically instantiate using notebook-specific configuration
    dyn_chroma_store = ChromaStore(model_name=notebook.embedding_model)
    dyn_rag_service = RAGService(dyn_chroma_store)
    
    # Get history
    history = [{"role": m.role, "content": m.content} for m in chat.messages[-10:]]
    
    answer, sources = dyn_rag_service.get_response(
        req.question, 
        notebook_id=chat.notebook_id, 
        chat_history=history,
        source_names=req.source_names,
        use_reranking=notebook.use_reranking
    )
    
    # Save messages
    user_msg = Message(role="user", content=req.question, chat_id=chat_id)
    assistant_msg = Message(role="assistant", content=answer, chat_id=chat_id)
    session.add(user_msg)
    session.add(assistant_msg)
    session.commit()
    
    return QuestionResponse(answer=answer, sources=sources)
