import os

# Load environment variables from .env if it exists
for env_path in [".env", "../.env", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")]:
    if os.path.exists(env_path):
        try:
            with open(env_path) as f:
                for line in f:
                    if "=" in line and not line.strip().startswith("#"):
                        key, val = line.strip().split("=", 1)
                        os.environ[key.strip()] = val.strip().strip('"').strip("'")
            break
        except Exception as e:
            pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import create_db_and_tables
from app.api import notebook, document, chat, quiz, assignment

app = FastAPI(title="Notebook-based Learning Platform API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(notebook.router, prefix="/api/notebooks", tags=["Notebooks"])
app.include_router(document.router, prefix="/api", tags=["Documents"])
app.include_router(chat.router, prefix="/api", tags=["Chats"])
app.include_router(quiz.router, prefix="/api", tags=["Quizzes"])
app.include_router(assignment.router, prefix="/api", tags=["Assignments"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Notebook-based Learning Platform API"}
