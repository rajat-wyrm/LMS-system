import os
import sys
import json
import time
import shutil
import numpy as np
from typing import List, Dict, Any, Tuple

# Set huggingface hub offline if needed, or allow downloads (online is fine)
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Add parent path to import app/get_embedding_function
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.embeddings import Embeddings
from sentence_transformers import SentenceTransformer, CrossEncoder

# Define local embedding wrapper
class LocalSentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name: str):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        embedding = self.model.encode(text, show_progress_bar=False, convert_to_numpy=True)
        return embedding.tolist()

def load_eval_dataset(filepath: str) -> List[Dict[str, Any]]:
    with open(filepath, "r") as f:
        return json.load(f)

def get_original_chunks() -> List[Document]:
    # Extract all chunks from the primary Chroma database
    from langchain_chroma import Chroma
    from get_embedding_function import get_embedding_function
    db = Chroma(
        persist_directory="chroma",
        embedding_function=get_embedding_function("nomic-embed-text")
    )
    
    data = db.get(include=['documents', 'metadatas'])
    documents = data['documents']
    metadatas = data['metadatas']
    ids = data['ids']
    
    chunks = []
    for doc, meta, cid in zip(documents, metadatas, ids):
        # Create a document object with ID in metadata
        meta_copy = meta.copy()
        meta_copy["id"] = cid
        chunks.append(Document(page_content=doc, metadata=meta_copy))
    return chunks

def calculate_metrics(retrieved_ids: List[str], ground_truth_id: str, k_list=[1, 3, 5]) -> Dict[str, float]:
    metrics = {}
    
    # Hit Rate / Recall@k
    for k in k_list:
        metrics[f"hit_rate@{k}"] = 1.0 if ground_truth_id in retrieved_ids[:k] else 0.0
        
    # Reciprocal Rank (RR)
    rr = 0.0
    for idx, rid in enumerate(retrieved_ids):
        if rid == ground_truth_id:
            rr = 1.0 / (idx + 1)
            break
    metrics["rr"] = rr
    
    # NDCG@k (k=5)
    k_ndcg = 5
    dcg = 0.0
    for idx, rid in enumerate(retrieved_ids[:k_ndcg]):
        if rid == ground_truth_id:
            dcg = 1.0 / np.log2(idx + 2)
            break
    # Since there's only 1 ground truth document, ideal DCG is 1.0 / np.log2(0 + 2) = 1.0
    metrics["ndcg@5"] = dcg
    
    return metrics

def evaluate_setup(
    chunks: List[Document],
    embed_model_name: str,
    embed_fn: Embeddings,
    eval_cases: List[Dict[str, Any]],
    reranker: CrossEncoder = None,
    db_path_prefix: str = "chroma_eval"
) -> Dict[str, Any]:
    print(f"\n--- Evaluating Embedding Model: {embed_model_name} ---")
    
    # Setup temp database path
    temp_db_path = f"{db_path_prefix}_{embed_model_name.replace('/', '_')}"
    if os.path.exists(temp_db_path):
        shutil.rmtree(temp_db_path)
        
    # Index chunks
    print(f"Indexing {len(chunks)} chunks...")
    t0 = time.time()
    db = Chroma.from_documents(
        documents=chunks,
        embedding=embed_fn,
        persist_directory=temp_db_path,
        ids=[c.metadata["id"] for c in chunks]
    )
    indexing_time = time.time() - t0
    print(f"Indexing completed in {indexing_time:.2f} seconds.")
    
    # Run evaluation
    retrieval_latencies = []
    rerank_latencies = []
    
    raw_results = []
    reranked_results = []
    
    print(f"Running {len(eval_cases)} evaluation queries...")
    
    for case in eval_cases:
        query = case["query"]
        gt_id = case["id"]
        
        # 1. Raw Retrieval (fetch top 10 chunks to allow re-ranking)
        t_ret_start = time.time()
        results = db.similarity_search_with_score(query, k=10)
        ret_time = time.time() - t_ret_start
        retrieval_latencies.append(ret_time)
        
        raw_ids = [doc.metadata["id"] for doc, _score in results]
        raw_metrics = calculate_metrics(raw_ids, gt_id, k_list=[1, 3, 5])
        raw_results.append(raw_metrics)
        
        # 2. Re-ranking Layer
        if reranker:
            t_rerank_start = time.time()
            # Prepare pairs: (query, chunk_text)
            pairs = [[query, doc.page_content] for doc, _score in results]
            
            # Predict similarity scores
            scores = reranker.predict(pairs)
            
            # Sort by score descending
            ranked_indices = np.argsort(scores)[::-1]
            rerank_time = time.time() - t_rerank_start
            rerank_latencies.append(rerank_time)
            
            reranked_docs = [results[i] for i in ranked_indices]
            reranked_ids = [doc.metadata["id"] for doc, _score in reranked_docs]
            
            rerank_metrics = calculate_metrics(reranked_ids, gt_id, k_list=[1, 3, 5])
            reranked_results.append(rerank_metrics)
        else:
            rerank_latencies.append(0.0)
            
    # Cleanup database
    try:
        shutil.rmtree(temp_db_path)
    except Exception as e:
        print(f"Warning: failed to delete temp DB directory {temp_db_path}: {e}")
        
    # Aggregate raw metrics
    avg_raw_metrics = {}
    for key in ["hit_rate@1", "hit_rate@3", "hit_rate@5", "rr", "ndcg@5"]:
        avg_raw_metrics[key] = np.mean([res[key] for res in raw_results])
        
    avg_ret_latency = np.mean(retrieval_latencies) * 1000  # in ms
    
    summary = {
        "embedding_model": embed_model_name,
        "indexing_time_sec": indexing_time,
        "avg_retrieval_latency_ms": avg_ret_latency,
        "raw_metrics": avg_raw_metrics
    }
    
    if reranker:
        avg_rerank_metrics = {}
        for key in ["hit_rate@1", "hit_rate@3", "hit_rate@5", "rr", "ndcg@5"]:
            avg_rerank_metrics[key] = np.mean([res[key] for res in reranked_results])
            
        avg_rerank_latency = np.mean(rerank_latencies) * 1000  # in ms
        summary["avg_rerank_latency_ms"] = avg_rerank_latency
        summary["total_latency_ms"] = avg_ret_latency + avg_rerank_latency
        summary["rerank_metrics"] = avg_rerank_metrics
        
    return summary

def main():
    eval_file = "eval_dataset.json"
    if not os.path.exists(eval_file):
        print(f"Error: {eval_file} not found. Run generate_eval_dataset.py first.")
        sys.exit(1)
        
    eval_cases = load_eval_dataset(eval_file)
    chunks = get_original_chunks()
    
    # 1. Load Re-ranker model
    print("Loading CrossEncoder re-ranker (cross-encoder/ms-marco-MiniLM-L-6-v2)...")
    reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    
    # 2. Define embedding setups
    embedding_setups = [
        {
            "name": "nomic-embed-text (Ollama)",
            "fn": OllamaEmbeddings(model="nomic-embed-text")
        },
        {
            "name": "all-MiniLM-L6-v2 (SentenceTransformers)",
            "fn": LocalSentenceTransformerEmbeddings("all-MiniLM-L6-v2")
        },
        {
            "name": "bge-small-en-v1.5 (SentenceTransformers)",
            "fn": LocalSentenceTransformerEmbeddings("BAAI/bge-small-en-v1.5")
        }
    ]
    
    results = []
    
    for setup in embedding_setups:
        res = evaluate_setup(
            chunks=chunks,
            embed_model_name=setup["name"],
            embed_fn=setup["fn"],
            eval_cases=eval_cases,
            reranker=reranker
        )
        results.append(res)
        
    # Write JSON results
    with open("eval_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    # Print results in Markdown Table
    print("\n================ EVALUATION SUMMARY ================")
    print("| Configuration | Hit@1 | Hit@3 | Hit@5 | MRR | NDCG@5 | Latency (ms) | Indexing (s) |")
    print("|---|---|---|---|---|---|---|---|")
    
    for r in results:
        # Raw retrieval row
        cfg_raw = f"{r['embedding_model']} (Raw)"
        m_raw = r["raw_metrics"]
        print(f"| {cfg_raw:<40} | {m_raw['hit_rate@1']:.2f} | {m_raw['hit_rate@3']:.2f} | {m_raw['hit_rate@5']:.2f} | {m_raw['rr']:.2f} | {m_raw['ndcg@5']:.2f} | {r['avg_retrieval_latency_ms']:.1f}ms | {r['indexing_time_sec']:.1f}s |")
        
        # Re-ranked row
        cfg_rr = f"{r['embedding_model']} + Re-ranker"
        m_rr = r["rerank_metrics"]
        print(f"| {cfg_rr:<40} | {m_rr['hit_rate@1']:.2f} | {m_rr['hit_rate@3']:.2f} | {m_rr['hit_rate@5']:.2f} | {m_rr['rr']:.2f} | {m_rr['ndcg@5']:.2f} | {r['total_latency_ms']:.1f}ms | - |")
        
    print("====================================================")

if __name__ == "__main__":
    main()
