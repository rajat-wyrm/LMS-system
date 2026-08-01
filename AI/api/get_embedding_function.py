import os
from langchain_ollama import OllamaEmbeddings
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

def get_embedding_function(model_name: str = "nomic-embed-text"):
    # If model_name is empty or None, fallback to default
    if not model_name:
        model_name = "nomic-embed-text"
        
    if model_name == "nomic-embed-text":
        return OllamaEmbeddings(model="nomic-embed-text")
    elif model_name == "all-MiniLM-L6-v2":
        return LocalSentenceTransformerEmbeddings("all-MiniLM-L6-v2")
    elif model_name == "bge-small-en-v1.5":
        return LocalSentenceTransformerEmbeddings("BAAI/bge-small-en-v1.5")
    else:
        return OllamaEmbeddings(model=model_name)
