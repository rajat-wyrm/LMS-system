"""
Course-to-Notebook Mapping Service for Issue #169.

Establishes and persists a reliable, 1:1 bi-directional relationship between
LMS courses (course_id) and AI notebooks (notebook_id / ChromaDB vector stores).
Ensures course isolation at the mapping and database layer.
"""

from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from datetime import datetime, timezone
from app.db.models import Notebook, User, Document

def get_or_create_course_notebook(
    session: Session,
    course_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    embedding_model: str = "nomic-embed-text"
) -> Notebook:
    """
    Retrieves the existing Notebook mapped to course_id, or creates a new one
    with deterministic ID conventions and uniqueness constraints.
    Prevents duplicate or conflicting mappings, refreshes title/description if provided,
    and rejects conflicts where a deterministic notebook ID belongs to another course.
    """
    if not course_id:
        raise ValueError("course_id must not be empty")

    now_utc = datetime.now(timezone.utc)
    deterministic_id = f"nb_course_{course_id}"

    # 1. Query for existing notebook mapped to this course_id
    statement = select(Notebook).where(Notebook.course_id == course_id)
    existing_nb = session.exec(statement).first()
    if existing_nb:
        # Refresh metadata if title or description was explicitly provided
        updated = False
        if title and existing_nb.title != title:
            existing_nb.title = title
            updated = True
        if description and existing_nb.description != description:
            existing_nb.description = description
            updated = True
        if updated:
            existing_nb.updated_at = now_utc
            session.add(existing_nb)
            session.commit()
            session.refresh(existing_nb)
        return existing_nb

    # 2. Check if a notebook with deterministic_id already exists
    nb_by_id = session.get(Notebook, deterministic_id)
    if nb_by_id:
        # If it belongs to a different course, reject the conflict explicitly
        if nb_by_id.course_id and nb_by_id.course_id != course_id:
            raise ValueError(
                f"Notebook ID conflict: '{deterministic_id}' is already mapped to course '{nb_by_id.course_id}', "
                f"cannot map to '{course_id}'."
            )
        # If it had no course_id assigned yet, link it to this course
        nb_by_id.course_id = course_id
        if title:
            nb_by_id.title = title
        if description:
            nb_by_id.description = description
        nb_by_id.updated_at = now_utc
        session.add(nb_by_id)
        session.commit()
        session.refresh(nb_by_id)
        return nb_by_id

    # 3. Ensure a valid user exists for foreign key constraint
    user = session.exec(select(User)).first()
    if not user:
        user = User(name="Default Instructor", email="system.instructor@lms.local")
        session.add(user)
        session.commit()
        session.refresh(user)

    # 4. Create new notebook mapped to course_id
    new_notebook = Notebook(
        id=deterministic_id,
        course_id=course_id,
        title=title or f"Course Notebook: {course_id}",
        description=description or f"AI Learning Knowledge Base for Course {course_id}",
        embedding_model=embedding_model,
        user_id=user.id,
        created_at=now_utc,
        updated_at=now_utc
    )
    session.add(new_notebook)
    session.commit()
    session.refresh(new_notebook)
    return new_notebook

def get_notebook_by_course(session: Session, course_id: str) -> Optional[Notebook]:
    """Retrieves the notebook associated with a given course_id, or None."""
    statement = select(Notebook).where(Notebook.course_id == course_id)
    return session.exec(statement).first()

def get_course_id_for_notebook(session: Session, notebook_id: str) -> Optional[str]:
    """Retrieves the course_id associated with a notebook_id, or None."""
    notebook = session.get(Notebook, notebook_id)
    return notebook.course_id if notebook else None

def list_all_course_mappings(session: Session) -> List[Dict[str, Any]]:
    """Returns a list of all courses mapped to notebooks with their document counts."""
    statement = select(Notebook).where(Notebook.course_id.is_not(None))
    notebooks = session.exec(statement).all()
    
    mappings = []
    for nb in notebooks:
        mappings.append({
            "course_id": nb.course_id,
            "notebook_id": nb.id,
            "title": nb.title,
            "embedding_model": nb.embedding_model,
            "document_count": len(nb.documents) if nb.documents else 0,
            "created_at": nb.created_at.isoformat() if nb.created_at else None
        })
    return mappings
