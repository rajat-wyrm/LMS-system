import sys
import os

print("Pre-downloading Hugging Face models...")
try:
    from sentence_transformers import SentenceTransformer, CrossEncoder
    
    # Ensure cache dirs are set up
    os.makedirs(os.path.expanduser("~/.cache/huggingface/hub"), exist_ok=True)
    
    print("Downloading all-MiniLM-L6-v2...")
    SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Downloading BAAI/bge-small-en-v1.5...")
    SentenceTransformer('BAAI/bge-small-en-v1.5')
    
    print("Downloading cross-encoder/ms-marco-MiniLM-L-6-v2...")
    CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
    
    print("All Hugging Face models downloaded successfully!")
except Exception as e:
    print(f"Warning/Error downloading Hugging Face models: {e}")

print("Pre-downloading NLTK data...")
try:
    import nltk
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('averaged_perceptron_tagger_eng', quiet=True)
    print("All NLTK data downloaded successfully!")
except Exception as e:
    print(f"Warning/Error downloading NLTK data: {e}")

print("Pre-downloading process finished.")
