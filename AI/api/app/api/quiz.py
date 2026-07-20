from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
import json
from app.db.models import Quiz, QuizQuestion, Notebook
from app.db.session import get_session
from app.services.rag_service import RAGService
from app.vectorstore.chroma_store import ChromaStore

router = APIRouter()
chroma_store = ChromaStore()
rag_service = RAGService(chroma_store)

class QuizGenerateRequest(BaseModel):
    topic: str
    num_questions: int = 5
    source_names: Optional[List[str]] = None

class QuizSubmitRequest(BaseModel):
    answers: List[int]

@router.post("/notebooks/{id}/quiz/generate")
def generate_quiz(id: str, req: QuizGenerateRequest, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    dyn_chroma_store = ChromaStore(model_name=notebook.embedding_model)
    dyn_rag_service = RAGService(dyn_chroma_store)
    
    quiz_content = dyn_rag_service.generate_quiz(
        id, 
        req.topic, 
        req.num_questions, 
        source_names=req.source_names,
        use_reranking=notebook.use_reranking
    )
    
    try:
        json_str = quiz_content
        if "```json" in quiz_content:
            json_str = quiz_content.split("```json")[1].split("```")[0].strip()
        elif "```" in quiz_content:
            json_str = quiz_content.split("```")[1].split("```")[0].strip()
        
        json_str = json_str.strip()
        if not json_str.startswith("["):
            start = json_str.find("[")
            end = json_str.rfind("]")
            if start != -1 and end != -1:
                json_str = json_str[start:end+1]
            
        questions_data = json.loads(json_str)
        
        db_quiz = Quiz(topic=req.topic, notebook_id=id)
        session.add(db_quiz)
        session.commit()
        session.refresh(db_quiz)
        
        if isinstance(questions_data, list):
            for q in questions_data:
                opts = q.get("options", [])
                if isinstance(opts, list):
                    options_str = "|".join([str(o) for o in opts])
                else:
                    options_str = str(opts)
                    
                # Robust correct_option parsing
                try:
                    co = int(q.get("correct_option", 0))
                except:
                    co = 0

                explanation_val = q.get("explanation", "")
                explanations_val = q.get("explanations", [])
                explanations_str = json.dumps(explanations_val) if isinstance(explanations_val, list) else "{}"

                db_q = QuizQuestion(
                    question_text=q.get("question_text", "Untitled Question"),
                    options=options_str,
                    correct_option=co,
                    explanation=explanation_val,
                    explanations=explanations_str,
                    quiz_id=db_quiz.id
                )
                session.add(db_q)
        
        session.commit()
        session.refresh(db_quiz)
        
        questions_list = []
        for q in db_quiz.questions:
            questions_list.append({
                "id": q.id,
                "question_text": q.question_text,
                "options": q.options,
                "correct_option": q.correct_option,
                "explanation": q.explanation,
                "explanations": q.explanations
            })
            
        return {
            "id": db_quiz.id,
            "topic": db_quiz.topic,
            "created_at": db_quiz.created_at.isoformat(),
            "notebook_id": db_quiz.notebook_id,
            "questions": questions_list
        }
    except Exception as e:
        print(f"Quiz Parse Error: {str(e)}. Raw: {quiz_content}")
        # Fallback to avoid 500
        db_quiz = Quiz(topic=req.topic, notebook_id=id)
        session.add(db_quiz)
        session.commit()
        session.refresh(db_quiz)
        db_q = QuizQuestion(
            question_text=f"Error generating quiz for {req.topic}. Please try again.",
            options="Try Again|Change Topic",
            correct_option=0,
            explanation="An error occurred during generation. Please try again.",
            explanations=json.dumps(["Please try again.", "Please try again."]),
            quiz_id=db_quiz.id
        )
        session.add(db_q)
        session.commit()
        return {
            "id": db_quiz.id,
            "topic": db_quiz.topic,
            "created_at": db_quiz.created_at.isoformat(),
            "notebook_id": db_quiz.notebook_id,
            "questions": [{
                "id": db_q.id,
                "question_text": db_q.question_text,
                "options": db_q.options,
                "correct_option": db_q.correct_option,
                "explanation": db_q.explanation,
                "explanations": db_q.explanations
            }]
        }

@router.get("/quizzes/{quiz_id}", response_model=Quiz)
def get_quiz(quiz_id: str, session: Session = Depends(get_session)):
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.get("/notebooks/{id}/quizzes", response_model=List[Quiz])
def list_quizzes(id: str, session: Session = Depends(get_session)):
    notebook = session.get(Notebook, id)
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    statement = select(Quiz).where(Quiz.notebook_id == id).order_by(Quiz.created_at.desc())
    return session.exec(statement).all()

@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(quiz_id: str, req: QuizSubmitRequest, session: Session = Depends(get_session)):
    quiz = session.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    score = 0
    results = []
    for i, answer in enumerate(req.answers):
        if i < len(quiz.questions):
            is_correct = (answer == quiz.questions[i].correct_option)
            if is_correct: score += 1
            results.append({"question": quiz.questions[i].question_text, "correct": is_correct})
    
    quiz.score = score
    quiz.submitted_answers = json.dumps(req.answers)
    session.add(quiz)
    session.commit()
            
    return {"score": score, "total": len(quiz.questions), "results": results}
