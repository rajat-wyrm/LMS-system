"""
Demo Course Ingestion and RAG Mapping Pipeline for Issue #169.

Reads demo course and lesson definitions, maps each course to an isolated AI notebook,
processes all supporting educational materials using the existing FileProcessor,
and indexes document chunks into ChromaDB with strict course metadata for retrieval isolation.
"""

import os
import sys
import json
from pathlib import Path

# Add AI/api to sys.path so app modules are discoverable
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from sqlmodel import Session, select
from app.db.session import engine, create_db_and_tables
from app.db.models import Notebook, Document, User
from app.services.course_mapping_service import get_or_create_course_notebook, list_all_course_mappings
from app.vectorstore.chroma_store import ChromaStore
from file_processor import FileProcessor

DATA_DIR = current_dir / "data" / "demo_courses"
COURSES_JSON_PATH = current_dir.parent.parent / "backend" / "scripts" / "demoCoursesData.json"

COURSE_SUBDIRS = {
    "demo_course_python_101": "python_fundamentals",
    "demo_course_ml_201": "ml_foundations",
    "demo_course_web_301": "web_development"
}

def load_demo_courses_spec():
    """Loads demo courses specification from JSON file or provides fallback."""
    if COURSES_JSON_PATH.exists():
        with open(COURSES_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    raise FileNotFoundError(f"Demo courses data not found at {COURSES_JSON_PATH}")

def ingest_demo_courses(embedding_model="nomic-embed-text", verbose=True):
    """
    Main ingestion routine:
    1. Initializes SQLite schema and migrations.
    2. Maps each demo course to a dedicated Notebook.
    3. Processes each lesson text file with FileProcessor.
    4. Indexes chunks into ChromaDB with course_id and notebook_id metadata.
    5. Returns an ingestion summary report.
    """
    if verbose:
        print("=" * 70)
        print("Issue #169: Autonomous Demo Course Ingestion & RAG Mapping")
        print("=" * 70)

    # Ensure tables exist and migrations run
    create_db_and_tables()

    courses = load_demo_courses_spec()
    processor = FileProcessor(chunk_size=500, chunk_overlap=100)
    chroma_store = ChromaStore(model_name=embedding_model)

    summary = {
        "courses_processed": 0,
        "notebooks_mapped": 0,
        "documents_ingested": 0,
        "chunks_indexed": 0,
        "status": "complete",  # "complete" or "partial"
        "missing_documents": [],
        "errors": [],
        "course_details": []
    }

    with Session(engine) as session:
        for course in courses:
            c_id = course["id"]
            c_title = course["title"]
            c_desc = course["description"]
            subdir = COURSE_SUBDIRS.get(c_id, "")

            if verbose:
                print(f"\n[Course Mapping] Establishing mapping for: [{c_id}] '{c_title}'")

            # Step 1: Establish course-to-notebook mapping
            notebook = get_or_create_course_notebook(
                session=session,
                course_id=c_id,
                title=c_title,
                description=c_desc,
                embedding_model=embedding_model
            )
            summary["notebooks_mapped"] += 1
            if verbose:
                print(f" -> Mapped to Notebook ID: {notebook.id} (course_id: {notebook.course_id})")

            course_chunks = 0
            course_docs = 0

            # Step 2: Ingest supporting documents for each lesson
            for lesson in course["lessons"]:
                doc_filename = lesson["sourceDocument"]
                doc_path = DATA_DIR / subdir / doc_filename

                if not doc_path.exists():
                    msg = f"Document not found: {doc_path} for lesson {lesson['id']} in course {c_id}"
                    summary["missing_documents"].append(msg)
                    summary["status"] = "partial"
                    if verbose:
                        print(f"   [Error] {msg}")
                    # Mark or record document record as error in SQLite if requested
                    existing_doc = session.exec(
                        select(Document).where(Document.notebook_id == notebook.id).where(Document.name == doc_filename)
                    ).first()
                    if not existing_doc:
                        err_doc = Document(
                            name=doc_filename,
                            file_url=str(doc_path),
                            status="error",
                            notebook_id=notebook.id
                        )
                        session.add(err_doc)
                    else:
                        existing_doc.status = "error"
                        session.add(existing_doc)
                    session.commit()
                    continue

                try:
                    # Load raw text using FileProcessor
                    raw_docs = processor.load_txt(str(doc_path))
                    if not raw_docs:
                        msg = f"Empty or unreadable document: {doc_path}"
                        summary["errors"].append(msg)
                        summary["status"] = "partial"
                        continue

                    # Split into semantic chunks
                    chunks = processor.split_documents(raw_docs)

                    # Attach rich course, lesson, and source traceability metadata
                    for chunk in chunks:
                        chunk.metadata["course_id"] = c_id
                        chunk.metadata["notebook_id"] = notebook.id
                        chunk.metadata["lesson_id"] = lesson["id"]
                        chunk.metadata["lesson_title"] = lesson["title"]
                        chunk.metadata["lesson_order"] = lesson["order"]
                        chunk.metadata["source"] = doc_filename
                        chunk.metadata["filename"] = doc_filename

                    # Index chunks into ChromaDB (safely adds/replaces chunks)
                    chroma_store.add_documents(chunks, notebook_id=notebook.id, course_id=c_id)

                    # Persist or update Document record in SQLite
                    existing_doc = session.exec(
                        select(Document).where(Document.notebook_id == notebook.id).where(Document.name == doc_filename)
                    ).first()

                    if not existing_doc:
                        db_doc = Document(
                            name=doc_filename,
                            file_url=str(doc_path),
                            status="indexed",
                            notebook_id=notebook.id
                        )
                        session.add(db_doc)
                    else:
                        existing_doc.status = "indexed"
                        session.add(existing_doc)

                    session.commit()

                    course_docs += 1
                    course_chunks += len(chunks)
                    if verbose:
                        print(f"   [Ingested] Lesson {lesson['order']}: {doc_filename} ({len(chunks)} chunks)")

                except Exception as doc_err:
                    err_msg = f"Error processing document {doc_filename}: {str(doc_err)}"
                    summary["errors"].append(err_msg)
                    summary["status"] = "partial"
                    if verbose:
                        print(f"   [Error] {err_msg}")

            summary["courses_processed"] += 1
            summary["documents_ingested"] += course_docs
            summary["chunks_indexed"] += course_chunks
            summary["course_details"].append({
                "course_id": c_id,
                "title": c_title,
                "notebook_id": notebook.id,
                "documents": course_docs,
                "chunks": course_chunks
            })

    if verbose:
        print("\n" + "=" * 70)
        print("Ingestion Summary:")
        print(f" - Status:            {summary['status'].upper()}")
        print(f" - Courses processed: {summary['courses_processed']}")
        print(f" - Notebooks mapped:  {summary['notebooks_mapped']}")
        print(f" - Documents indexed: {summary['documents_ingested']}")
        print(f" - Total vector chunks: {summary['chunks_indexed']}")
        if summary["missing_documents"]:
            print(f" - Missing documents: {len(summary['missing_documents'])}")
            for m in summary["missing_documents"]:
                print(f"   * {m}")
        if summary["errors"]:
            print(f" - Errors encountered: {len(summary['errors'])}")
            for e in summary["errors"]:
                print(f"   * {e}")
        print("=" * 70)

    return summary

if __name__ == "__main__":
    ingest_demo_courses()

