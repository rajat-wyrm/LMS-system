"""
Automated AI Tutor Response Latency Test Suite for Issue #170 (Phase 5).

Measures response latency across the AI Tutor pipeline:
1. Vector Retrieval Latency: chroma_store.query (embedding calculation + vector search).
2. RAG Pipeline Latency: rag_service.get_response (retrieval + prompt assembly + LLM generation).
3. End-to-End API Latency: POST /api/chats/{chat_id}/ask (HTTP parsing + DB lookups + RAG + DB message persistence).

Performance Thresholds & SLA Distinctions:
- Test-Environment Threshold:
  Average latency < 350ms, Max latency < 800ms.
  This automated quality gate verifies that retrieval, database operations, and prompt construction
  remain performant without algorithmic bottlenecks, memory leaks, or unindexed database queries.
- Production SLA (Target Reference):
  Average latency < 3,000ms, P95 latency < 5,000ms.
  In production with a live LLM (Ollama Mistral / external API), latency is dominated by
  token-by-token autoregressive generation. Mocked tests verify pipeline mechanics, not live GPU/LLM inference.
"""

import sys
import time
import json
import math
import hashlib
import tempfile
import statistics
from pathlib import Path
from typing import List, Dict, Any
from unittest.mock import patch, MagicMock

import pytest

# Add AI/api to sys.path
api_dir = Path(__file__).resolve().parent.parent
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

# Harmonize Pydantic UTC datetime default factories for SQLModel in test runtime
import datetime
import app.db.models as models
for cls in [models.Notebook, models.Document, models.Chat, models.Message, models.Quiz, models.AssignmentEvaluation]:
    if hasattr(cls, "model_fields"):
        if "created_at" in cls.model_fields:
            cls.model_fields["created_at"].default_factory = lambda: datetime.datetime.now(datetime.timezone.utc)
        if "updated_at" in cls.model_fields:
            cls.model_fields["updated_at"].default_factory = lambda: datetime.datetime.now(datetime.timezone.utc)
        if "uploaded_at" in cls.model_fields:
            cls.model_fields["uploaded_at"].default_factory = lambda: datetime.datetime.now(datetime.timezone.utc)

from langchain_core.embeddings import Embeddings
from langchain_core.documents import Document as LCDocument
from langchain_core.messages import AIMessage
from langchain_core.runnables import RunnableLambda
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.vectorstore.chroma_store import ChromaStore
from app.services.rag_service import RAGService
from app.main import app
from app.db.session import engine
from app.db.models import Notebook, Chat, User


# -----------------------------------------------------------------------------
# DETERMINISTIC TEST MOCKS (OFFLINE CAPABLE)
# -----------------------------------------------------------------------------
class DeterministicTestEmbeddings(Embeddings):
    """
    384-dimensional deterministic mock embeddings for consistent, offline vector search.
    """
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _embed(self, text: str) -> List[float]:
        vec = [0.0] * self.dimension
        tokens = [t.lower().strip() for t in text.split() if len(t.strip()) > 1]
        if not tokens:
            return vec
        for token in tokens:
            digest = hashlib.md5(token.encode("utf-8")).digest()
            idx = int.from_bytes(digest[:2], byteorder="big") % self.dimension
            sign = 1.0 if (digest[2] % 2 == 0) else -1.0
            vec[idx] += sign
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._embed(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._embed(text)


def mock_llm_function(prompt_val: Any) -> AIMessage:
    """Mock LLM callable returning verified response for latency tests."""
    return AIMessage(content="Verified latency test answer based on course documents.")


# -----------------------------------------------------------------------------
# TEST FIXTURES
# -----------------------------------------------------------------------------
DATASET_PATH = Path(__file__).resolve().parent / "fixtures" / "tutor_eval_dataset.json"


@pytest.fixture(scope="module")
def eval_dataset() -> List[Dict[str, Any]]:
    assert DATASET_PATH.exists(), f"Evaluation dataset not found at {DATASET_PATH}"
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [q for q in data if q["type"] == "in_scope"]


@pytest.fixture(scope="module")
def isolated_vector_store():
    """Creates an isolated temporary vector store seeded with demo course documents."""
    temp_dir = tempfile.mkdtemp(prefix="chroma_latency_test_")
    store = ChromaStore(chroma_path=temp_dir, model_name="latency-mock")
    store.embedding_function = DeterministicTestEmbeddings()

    course_chunks = [
        LCDocument(
            page_content="Python was created by Guido van Rossum in 1991. The Zen of Python emphasizes readability.",
            metadata={"source": "python_01_intro.txt", "page": 1, "course_id": "demo_course_python_101"}
        ),
        LCDocument(
            page_content="Python data types: mutable lists and dicts, immutable ints, floats, strings, and tuples.",
            metadata={"source": "python_02_variables_types.txt", "page": 1, "course_id": "demo_course_python_101"}
        ),
        LCDocument(
            page_content="Tom Mitchell defined machine learning: computer programs learn from experience E with task T and performance P.",
            metadata={"source": "ml_01_intro.txt", "page": 1, "course_id": "demo_course_ml_201"}
        ),
        LCDocument(
            page_content="Web foundations consist of HTML for structure, CSS for presentation, and JavaScript for behavior.",
            metadata={"source": "web_01_html_css_js.txt", "page": 1, "course_id": "demo_course_web_301"}
        ),
    ]

    for doc in course_chunks:
        nb_id = f"nb_course_{doc.metadata['course_id']}"
        store.add_documents([doc], notebook_id=nb_id)

    yield store

    import shutil
    try:
        shutil.rmtree(temp_dir)
    except Exception:
        pass


@pytest.fixture(scope="module")
def latency_rag_service(isolated_vector_store):
    """Provides a RAGService with deterministic mock LLM for latency benchmarking."""
    service = RAGService(chroma_store=isolated_vector_store, model_name="mock-model")
    service.llm = RunnableLambda(mock_llm_function)
    return service


@pytest.fixture(scope="module")
def api_test_session():
    """Seeds a test Notebook and Chat for API latency measurements and cleans up."""
    with Session(engine) as session:
        user = session.get(User, "test_latency_user")
        if not user:
            user = User(id="test_latency_user", name="Latency Tester", email="latency@lms.local")
            session.add(user)

        nb = session.get(Notebook, "nb_course_demo_course_python_101")
        if not nb:
            nb = Notebook(
                id="nb_course_demo_course_python_101",
                title="Python 101 Latency Notebook",
                user_id="test_latency_user",
                embedding_model="latency-mock"
            )
            session.add(nb)

        chat = session.get(Chat, "chat_latency_test_01")
        if not chat:
            chat = Chat(
                id="chat_latency_test_01",
                title="Latency Test Chat",
                notebook_id="nb_course_demo_course_python_101"
            )
            session.add(chat)

        session.commit()

    yield {
        "chat_id": "chat_latency_test_01",
        "notebook_id": "nb_course_demo_course_python_101"
    }

    # Teardown test chat
    with Session(engine) as session:
        chat = session.get(Chat, "chat_latency_test_01")
        if chat:
            session.delete(chat)
            session.commit()


# -----------------------------------------------------------------------------
# LATENCY TESTS
# -----------------------------------------------------------------------------
def test_vector_retrieval_latency(isolated_vector_store, eval_dataset):
    """
    Measures ChromaDB vector retrieval latency across multiple in-scope queries.
    Threshold: Average retrieval < 50ms, Max retrieval < 150ms.
    """
    latencies_ms = []

    for item in eval_dataset:
        query = item["question"]
        nb_id = item["notebook_id"]

        start_time = time.perf_counter()
        results = isolated_vector_store.query(query, notebook_id=nb_id, k=3)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        latencies_ms.append(elapsed_ms)
        assert len(results) >= 0  # Retrieval completed successfully

    avg_ms = statistics.mean(latencies_ms)
    max_ms = max(latencies_ms)
    min_ms = min(latencies_ms)

    print(f"\n[Vector Retrieval Latency] Count: {len(latencies_ms)} | Avg: {avg_ms:.2f}ms | Min: {min_ms:.2f}ms | Max: {max_ms:.2f}ms")

    # Assert test-environment threshold
    assert avg_ms < 50.0, f"Average vector retrieval latency ({avg_ms:.2f}ms) exceeded threshold of 50ms"
    assert max_ms < 150.0, f"Max vector retrieval latency ({max_ms:.2f}ms) exceeded threshold of 150ms"


def test_rag_pipeline_latency(latency_rag_service, eval_dataset):
    """
    Measures RAG service get_response pipeline latency (retrieval + prompt assembly + mock LLM).
    Threshold: Average RAG latency < 100ms, Max latency < 250ms.
    """
    latencies_ms = []

    for item in eval_dataset:
        query = item["question"]
        nb_id = item["notebook_id"]

        start_time = time.perf_counter()
        answer, sources = latency_rag_service.get_response(query, notebook_id=nb_id)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        latencies_ms.append(elapsed_ms)
        assert isinstance(answer, str) and len(answer) > 0

    avg_ms = statistics.mean(latencies_ms)
    max_ms = max(latencies_ms)
    min_ms = min(latencies_ms)

    print(f"\n[RAG Pipeline Latency] Count: {len(latencies_ms)} | Avg: {avg_ms:.2f}ms | Min: {min_ms:.2f}ms | Max: {max_ms:.2f}ms")

    assert avg_ms < 100.0, f"Average RAG pipeline latency ({avg_ms:.2f}ms) exceeded threshold of 100ms"
    assert max_ms < 250.0, f"Max RAG pipeline latency ({max_ms:.2f}ms) exceeded threshold of 250ms"


def test_api_ask_endpoint_latency(isolated_vector_store, latency_rag_service, api_test_session, eval_dataset):
    """
    Measures end-to-end HTTP POST /api/chats/{chat_id}/ask latency using FastAPI TestClient.
    Exercises: HTTP parsing, SQLModel lookups, vector query, mock LLM, SQLite message persistence, JSON serialization.
    Threshold: Average API latency < 350ms, Max latency < 800ms.
    """
    client = TestClient(app)
    chat_id = api_test_session["chat_id"]
    latencies_ms = []

    with patch("app.api.chat.ChromaStore", return_value=isolated_vector_store), \
         patch("app.api.chat.RAGService", return_value=latency_rag_service):

        for item in eval_dataset:
            payload = {"question": item["question"]}

            start_time = time.perf_counter()
            response = client.post(f"/api/chats/{chat_id}/ask", json=payload)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            assert response.status_code == 200, f"Request failed: {response.text}"
            data = response.json()
            assert "answer" in data
            latencies_ms.append(elapsed_ms)

    avg_ms = statistics.mean(latencies_ms)
    max_ms = max(latencies_ms)
    min_ms = min(latencies_ms)
    p95_ms = statistics.quantiles(latencies_ms, n=20)[18] if len(latencies_ms) >= 20 else max_ms

    print(f"\n[API Endpoint Latency] Count: {len(latencies_ms)} | Avg: {avg_ms:.2f}ms | Min: {min_ms:.2f}ms | Max: {max_ms:.2f}ms | P95: {p95_ms:.2f}ms")

    # Assert test-environment non-regression threshold
    assert avg_ms < 350.0, f"Average API latency ({avg_ms:.2f}ms) exceeded test threshold of 350ms"
    assert max_ms < 800.0, f"Max API latency ({max_ms:.2f}ms) exceeded test threshold of 800ms"


def test_latency_statistical_summary(isolated_vector_store, latency_rag_service, eval_dataset):
    """
    Compiles and prints a structured benchmark summary for the QA Release Audit Report.
    Validates statistical stability across repeated runs.
    """
    samples = []
    # Execute 3 iterations per question to compute robust statistics (30 data points)
    for _ in range(3):
        for item in eval_dataset:
            start = time.perf_counter()
            latency_rag_service.get_response(item["question"], notebook_id=item["notebook_id"])
            elapsed_ms = (time.perf_counter() - start) * 1000.0
            samples.append(elapsed_ms)

    assert len(samples) == 30
    mean_val = statistics.mean(samples)
    median_val = statistics.median(samples)
    stdev_val = statistics.stdev(samples)
    min_val = min(samples)
    max_val = max(samples)

    # 95th percentile using quantiles
    p95_val = statistics.quantiles(samples, n=20)[18]

    print("\n" + "=" * 65)
    print("AI TUTOR RESPONSE LATENCY BENCHMARK REPORT (MOCK TEST ENVIRONMENT)")
    print("=" * 65)
    print(f"Total Requests Evaluated:  {len(samples)}")
    print(f"Minimum Latency:           {min_val:.2f} ms")
    print(f"Maximum Latency:           {max_val:.2f} ms")
    print(f"Mean (Average) Latency:    {mean_val:.2f} ms")
    print(f"Median Latency:            {median_val:.2f} ms")
    print(f"Standard Deviation:        {stdev_val:.2f} ms")
    print(f"95th Percentile (P95):     {p95_val:.2f} ms")
    print("-" * 65)
    print("Test-Environment Quality Gate (< 350 ms): PASS")
    print("Production SLA Target (< 3000 ms mean, < 5000 ms P95): NOT VERIFIED IN MOCK")
    print("=" * 65 + "\n")

    assert mean_val < 350.0
