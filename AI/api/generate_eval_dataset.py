import sys
import os
import json
import random
from langchain_ollama import ChatOllama

# Ensure we can import from app or vector_store
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.vectorstore.chroma_store import ChromaStore

def main():
    print("Initializing ChromaStore to fetch document chunks...")
    store = ChromaStore()
    db = store.get_db()
    
    # Fetch document content and metadata
    data = db.get(include=['documents', 'metadatas'])
    documents = data['documents']
    metadatas = data['metadatas']
    ids = data['ids']
    
    if not documents:
        print("Error: No documents found in ChromaDB. Please make sure documents are uploaded.")
        sys.exit(1)
        
    print(f"Found {len(documents)} chunks in ChromaDB.")
    
    # We will sample 12 chunks to generate 10 good queries (with some margin)
    sample_indices = random.sample(range(len(documents)), min(15, len(documents)))
    
    eval_dataset = []
    llm = ChatOllama(model="mistral", temperature=0.0)
    
    print("Generating questions using Ollama (mistral)...")
    for idx in sample_indices:
        chunk_text = documents[idx]
        meta = metadatas[idx]
        chunk_id = ids[idx]
        
        # Skip very short chunks
        if len(chunk_text.strip()) < 150:
            continue
            
        prompt = f"""You are a teacher creating a quiz based on course material.
Given the following document chunk, generate a single, highly specific and factual question that is answered directly and uniquely by the information in this chunk.
The question must be natural, self-contained, and must NOT contain meta-references (like "According to the text", "Based on the passage", "In this section", etc.).

Document Chunk:
\"\"\"
{chunk_text}
\"\"\"

Question:"""
        
        try:
            response = llm.invoke(prompt)
            question = response.content.strip().replace('"', '')
            if not question.endswith('?'):
                question += '?'
                
            eval_dataset.append({
                "id": chunk_id,
                "query": question,
                "ground_truth_passage": chunk_text,
                "ground_truth_source": meta.get("source", "Unknown"),
                "ground_truth_page": meta.get("page", 0),
                "ground_truth_notebook": meta.get("notebook_id", "default")
            })
            print(f"Generated Question {len(eval_dataset)}: {question}")
            
            if len(eval_dataset) >= 10:
                break
        except Exception as e:
            print(f"Error generating question for chunk {chunk_id}: {str(e)}")
            
    if not eval_dataset:
        print("Failed to generate any questions. Using fallback hardcoded questions.")
        # Fallback dataset based on standard topics
        eval_dataset = [
            {
                "id": "fallback_1",
                "query": "What is Python's list comprehension syntax?",
                "ground_truth_passage": "list comprehensions provide a concise way to create lists. They consist of brackets containing an expression followed by a for clause",
                "ground_truth_source": "Python Programming.pdf",
                "ground_truth_page": 1,
                "ground_truth_notebook": "default"
            }
        ]
        
    with open("eval_dataset.json", "w") as f:
        json.dump(eval_dataset, f, indent=2)
        
    print(f"Successfully saved {len(eval_dataset)} evaluation cases to eval_dataset.json")

if __name__ == "__main__":
    main()
