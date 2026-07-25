from sqlmodel import create_engine, Session, SQLModel
import os

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # Run simple sqlite migration to add columns if they don't exist
    import sqlite3
    if os.path.exists(sqlite_file_name):
        try:
            conn = sqlite3.connect(sqlite_file_name)
            cursor = conn.cursor()
            
            # Check existing columns
            cursor.execute("PRAGMA table_info(notebook)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if "embedding_model" not in columns:
                cursor.execute("ALTER TABLE notebook ADD COLUMN embedding_model VARCHAR DEFAULT 'nomic-embed-text'")
                print("Migration: Added 'embedding_model' column to 'notebook' table.")
                
            if "use_reranking" not in columns:
                cursor.execute("ALTER TABLE notebook ADD COLUMN use_reranking BOOLEAN DEFAULT 0")
                print("Migration: Added 'use_reranking' column to 'notebook' table.")
                
            if "chunk_size" not in columns:
                cursor.execute("ALTER TABLE notebook ADD COLUMN chunk_size INTEGER DEFAULT 500")
                print("Migration: Added 'chunk_size' column to 'notebook' table.")
                
            if "chunk_overlap" not in columns:
                cursor.execute("ALTER TABLE notebook ADD COLUMN chunk_overlap INTEGER DEFAULT 100")
                print("Migration: Added 'chunk_overlap' column to 'notebook' table.")
                
            if "updated_at" not in columns:
                cursor.execute("ALTER TABLE notebook ADD COLUMN updated_at DATETIME")
                cursor.execute("UPDATE notebook SET updated_at = created_at WHERE updated_at IS NULL")
                print("Migration: Added 'updated_at' column to 'notebook' table.")
                
            cursor.execute("PRAGMA table_info(quiz)")
            columns_quiz = [col[1] for col in cursor.fetchall()]
            if "submitted_answers" not in columns_quiz:
                cursor.execute("ALTER TABLE quiz ADD COLUMN submitted_answers VARCHAR")
                print("Migration: Added 'submitted_answers' column to 'quiz' table.")
                
            cursor.execute("PRAGMA table_info(quizquestion)")
            columns_q = [col[1] for col in cursor.fetchall()]
            if "explanation" not in columns_q:
                cursor.execute("ALTER TABLE quizquestion ADD COLUMN explanation VARCHAR")
                print("Migration: Added 'explanation' column to 'quizquestion' table.")
            if "explanations" not in columns_q:
                cursor.execute("ALTER TABLE quizquestion ADD COLUMN explanations VARCHAR")
                print("Migration: Added 'explanations' column to 'quizquestion' table.")
                
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Migration error: {str(e)}")

def get_session():
    with Session(engine) as session:
        yield session
