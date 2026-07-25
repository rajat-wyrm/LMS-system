from typing import List, Optional
from datetime import datetime
from sqlmodel import Field, Relationship, SQLModel
import uuid

class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    
    notebooks: List["Notebook"] = Relationship(back_populates="user")

class Notebook(SQLModel, table=True):
    id: str = Field(default_factory=lambda: f"nb_{uuid.uuid4().hex[:8]}", primary_key=True)
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    embedding_model: str = Field(default="nomic-embed-text")
    use_reranking: bool = Field(default=False)
    chunk_size: int = Field(default=500)
    chunk_overlap: int = Field(default=100)
    
    user_id: Optional[str] = Field(default=None, foreign_key="user.id")
    user: User = Relationship(back_populates="notebooks")
    
    documents: List["Document"] = Relationship(back_populates="notebook", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    chats: List["Chat"] = Relationship(back_populates="notebook", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    quizzes: List["Quiz"] = Relationship(back_populates="notebook", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    evaluations: List["AssignmentEvaluation"] = Relationship(back_populates="notebook", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Document(SQLModel, table=True):
    id: str = Field(default_factory=lambda: f"doc_{uuid.uuid4().hex[:8]}", primary_key=True)
    name: str
    file_url: str
    status: str = "uploaded"  # uploaded, processing, indexed, error
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    notebook_id: Optional[str] = Field(default=None, foreign_key="notebook.id")
    notebook: Notebook = Relationship(back_populates="documents")

class Chat(SQLModel, table=True):
    id: str = Field(default_factory=lambda: f"chat_{uuid.uuid4().hex[:8]}", primary_key=True)
    title: str = "New Chat"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    notebook_id: Optional[str] = Field(default=None, foreign_key="notebook.id")
    notebook: Notebook = Relationship(back_populates="chats")
    
    messages: List["Message"] = Relationship(back_populates="chat", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class Message(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    role: str  # user, assistant
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    chat_id: str = Field(foreign_key="chat.id")
    chat: Chat = Relationship(back_populates="messages")

class Quiz(SQLModel, table=True):
    id: str = Field(default_factory=lambda: f"quiz_{uuid.uuid4().hex[:8]}", primary_key=True)
    topic: str
    score: Optional[int] = None
    submitted_answers: Optional[str] = Field(default=None) # JSON list of integers
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    notebook_id: Optional[str] = Field(default=None, foreign_key="notebook.id")
    notebook: Notebook = Relationship(back_populates="quizzes")
    
    questions: List["QuizQuestion"] = Relationship(back_populates="quiz", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class QuizQuestion(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    question_text: str
    options: str  # JSON string or comma-separated
    correct_option: int
    explanation: Optional[str] = Field(default=None)
    explanations: Optional[str] = Field(default=None) # JSON list of strings parallel to options
    
    quiz_id: str = Field(foreign_key="quiz.id")
    quiz: Quiz = Relationship(back_populates="questions")

class AssignmentEvaluation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: f"eval_{uuid.uuid4().hex[:8]}", primary_key=True)
    question_text: Optional[str] = None
    student_answer: str
    score: int
    feedback: str
    strengths: Optional[str] = None
    missing_concepts: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    notebook_id: Optional[str] = Field(default=None, foreign_key="notebook.id")
    notebook: Notebook = Relationship(back_populates="evaluations")
