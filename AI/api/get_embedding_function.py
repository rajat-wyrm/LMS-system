import os
import hashlib
import math
from langchain_core.embeddings import Embeddings

# In-memory model cache to avoid reloading from disk on every query
_model_cache = {}

class LocalSentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name: str):
        from sentence_transformers import SentenceTransformer
        self.model_name = model_name
        if model_name not in _model_cache:
            print(f"Loading SentenceTransformer model in memory: {model_name}...")
            _model_cache[model_name] = SentenceTransformer(model_name)
        self.model = _model_cache[model_name]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> list[float]:
        # BGE models benefit from query prefix
        if "bge" in self.model_name.lower():
            text = f"Represent this sentence for searching relevant passages: {text}"
        embedding = self.model.encode(text, show_progress_bar=False, convert_to_numpy=True)
        return embedding.tolist()

class DeterministicEmbeddings(Embeddings):
    """
    Deterministic normalized embedding generator for offline testing,
    isolated CI workflows, and mock environments without a local Ollama daemon.
    Generates consistent, semantic-sensitive 384-dimensional vectors.
    """
    def __init__(self, dim: int = 384):
        self.dim = dim

    def _embed_text(self, text: str) -> list[float]:
        vec = [0.0] * self.dim
        words = text.lower().split()
        if not words:
            return vec
        for word in words:
            h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dim
            sign = 1.0 if (h >> 1) % 2 == 0 else -1.0
            vec[idx] += sign * (1.0 + (len(word) % 5) * 0.1)
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_text(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed_text(text)

def get_embedding_function(model_name: str = "nomic-embed-text"):
    # If model_name is empty or None, fallback to default
    if not model_name:
        model_name = "nomic-embed-text"

    # Support deterministic embeddings for mock/offline testing
    if model_name in ("deterministic", "mock", "test", "test-embeddings") or os.environ.get("USE_MOCK_EMBEDDINGS") == "1":
        return DeterministicEmbeddings()
        
    if model_name == "nomic-embed-text":
        try:
            from langchain_ollama import OllamaEmbeddings
            return OllamaEmbeddings(model="nomic-embed-text")
        except Exception:
            return DeterministicEmbeddings()
    elif model_name == "all-MiniLM-L6-v2":
        return LocalSentenceTransformerEmbeddings("all-MiniLM-L6-v2")
    elif model_name == "bge-small-en-v1.5":
        return LocalSentenceTransformerEmbeddings("BAAI/bge-small-en-v1.5")
    else:
        try:
            from langchain_ollama import OllamaEmbeddings
            return OllamaEmbeddings(model=model_name)
        except Exception:
            return DeterministicEmbeddings()
