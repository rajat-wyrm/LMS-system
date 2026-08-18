from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
import json
from app.db.models import AssignmentEvaluation, Notebook
from app.db.session import get_session
from app.services.rag_service import RAGService
from app.vectorstore.chroma_store import ChromaStore

router = APIRouter()
chroma_store = ChromaStore()
rag_service = RAGService(chroma_store)

class EvaluateRequest(BaseModel):
    question: str
    student_answer: str
    source_names: Optional[List[str]] = None

class PracticeRequest(BaseModel):
    topic: Optional[str] = "general"
    source_names: Optional[List[str]] = None

@router.post("/notebooks/{id}/evaluate", response_model=AssignmentEvaluation)
def evaluate_answer(id: str, req: EvaluateRequest, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
        
    dyn_chroma_store = ChromaStore(model_name=notebook.embedding_model)
    dyn_rag_service = RAGService(dyn_chroma_store)
    
    eval_content = dyn_rag_service.evaluate_assignment(
        id, 
        req.question, 
        req.student_answer, 
        source_names=req.source_names,
        use_reranking=notebook.use_reranking
    )
    
    try:
        json_str = eval_content
        if "```json" in eval_content:
            json_str = eval_content.split("```json")[1].split("```")[0].strip()
        elif "```" in eval_content:
            json_str = eval_content.split("```")[1].split("```")[0].strip()
        
        json_str = json_str.strip()
        if not json_str.startswith("{"):
            start = json_str.find("{")
            end = json_str.rfind("}")
            if start != -1 and end != -1:
                json_str = json_str[start:end+1]
                
        eval_data = json.loads(json_str)
        
        # Robust score parsing
        try:
            score_val = int(eval_data.get("score", 0))
        except:
            score_val = 0

        db_eval = AssignmentEvaluation(
            question_text=req.question,
            student_answer=req.student_answer,
            score=score_val,
            feedback=eval_data.get("feedback", "No feedback provided."),
            strengths="|".join(eval_data.get("strengths", []) if isinstance(eval_data.get("strengths"), list) else []),
            missing_concepts="|".join(eval_data.get("missing_concepts", []) if isinstance(eval_data.get("missing_concepts"), list) else []),
            notebook_id=id
        )
        session.add(db_eval)
        session.commit()
        session.refresh(db_eval)
        return db_eval
    except Exception as e:
        print(f"Eval Parse Error: {str(e)}. Raw: {eval_content}")
        # Fallback evaluation if JSON fails
        db_eval = AssignmentEvaluation(
            question_text=req.question,
            student_answer=req.student_answer,
            score=5,
            feedback=eval_content, # Store raw content as feedback
            notebook_id=id
        )
        session.add(db_eval)
        session.commit()
        session.refresh(db_eval)
        return db_eval

@router.post("/notebooks/{id}/practice-question")
def generate_practice_question(id: str, req: PracticeRequest, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
        
    dyn_chroma_store = ChromaStore(model_name=notebook.embedding_model)
    dyn_rag_service = RAGService(dyn_chroma_store)
    
    question = dyn_rag_service.generate_practice_question(
        id, 
        topic=req.topic, 
        source_names=req.source_names,
        use_reranking=notebook.use_reranking
    )
    return {"question": question}

@router.get("/notebooks/{id}/evaluations", response_model=List[AssignmentEvaluation])
def list_evaluations(id: str, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    statement = select(AssignmentEvaluation).where(AssignmentEvaluation.notebook_id == id).order_by(AssignmentEvaluation.created_at.desc())
    return session.exec(statement).all()
