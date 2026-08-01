# RAG-based Course Chatbot

This is a RAG (Retrieval-Augmented Generation) chatbot designed for students and educators to query course materials directly. It runs entirely locally using Ollama.

## Model Downloads and Installation

First, set up the required local models.

### 1. Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com).

### 2. Download Ollama Models
Pull the default language and embedding models using the following commands:
```bash
ollama pull mistral
ollama pull nomic-embed-text
```

### 3. Pre-download Hugging Face and NLTK Models
These are used for alternative embedding options and text chunking:
- Sentence Transformer: all-MiniLM-L6-v2
- Sentence Transformer: BAAI/bge-small-en-v1.5
- Cross Encoder: cross-encoder/ms-marco-MiniLM-L-6-v2
- NLTK data: punkt, averaged_perceptron_tagger, averaged_perceptron_tagger_eng

You can run the pre-download script after setting up the environment:
```bash
python3 download_models.py
```

## Environment Setup

### 1. Create a Virtual Environment
Run the following command to create a Python virtual environment:
```bash
python3 -m venv .venv
```

### 2. Activate the Virtual Environment
Activate the environment based on your operating system:

On Linux or macOS:
```bash
source .venv/bin/activate
```

On Windows:
```cmd
.venv\Scripts\activate
```

### 3. Install Dependencies
After activating the virtual environment, install the required packages:
```bash
pip install -r requirements.txt
```

### 4. Pre-download Hugging Face and NLTK Models
Execute the download script to fetch the dependencies:
```bash
python3 download_models.py
```

## Running the Application

### 1. Run the Backend API Server
Start the FastAPI server using Uvicorn:
```bash
uvicorn app.main:app --reload --port 8000
```
Alternatively, you can run it via Python module:
```bash
python3 -m uvicorn app.main:app --reload --port 8000
```
The API server will run at http://localhost:8000 and interactive documentation (Swagger UI) is available at http://localhost:8000/docs.

### 2. Run the Interactive Command-Line Chatbot
To query files directly or run the interactive terminal interface:
- Run interactive CLI mode:
  ```bash
  python3 main.py
  ```
- Upload files:
  ```bash
  python3 main.py --upload /path/to/document.pdf
  ```
- Query with a single question:
  ```bash
  python3 main.py --query "What is self-attention?"
  ```
- Reset vector database:
  ```bash
  python3 main.py --reset
  ```

## API Endpoints

The backend exposes the following REST endpoints. The base URL is http://localhost:8000/api.

### Notebooks
- `POST /notebooks` - Create a new notebook workspace.
- `GET /notebooks` - List all notebooks.
- `GET /notebooks/{id}` - Retrieve details of a specific notebook.

### Documents
- `POST /notebooks/{id}/documents` - Upload a document (PDF, TXT, or PPTX) to a notebook.
- `GET /notebooks/{id}/documents` - List all documents in a notebook.
- `DELETE /documents/{doc_id}` - Delete a specific document.

### Chat (RAG)
- `POST /notebooks/{id}/chats` - Create a new chat session in a notebook.
- `POST /chats/{chat_id}/ask` - Ask a question using RAG (queries matching notebook files).
- `GET /chats/{chat_id}/messages` - Get the message history of a chat.

### Quizzes
- `POST /notebooks/{id}/quiz/generate` - Generate a quiz based on notebook materials.
- `POST /quizzes/{quiz_id}/submit` - Submit answers for a quiz and get scores.

### Assignment Evaluator
- `POST /notebooks/{id}/evaluate` - Evaluate a student's answer against course documents.

## Project Structure

```text
.
├── app/
│   ├── api/                  # Endpoint routers (notebooks, documents, chats, quizzes, assignments)
│   ├── db/                   # Database session management and SQLModel schemas
│   ├── services/             # Orchestration logic for RAG querying and response generation
│   ├── vectorstore/          # Chroma vector store management
│   └── main.py               # FastAPI application entry point
├── data/
│   └── uploads/              # Directory for uploaded documents
├── ARCHITECTURE.md           # Technical report detailing the RAG workflow
├── backend.md                # Detailed API specifications
├── chatbot.py                # Command-line interface and history helpers
├── download_models.py        # Script to pre-download models
├── file_processor.py         # Text extraction and document chunking utilities
├── get_embedding_function.py # Embedding function loaders
├── main.py                   # CLI entry point for local file uploading and interactive chat
├── requirements.txt          # Python dependencies list
└── vector_store.py           # Standalone vector store interface
```

## Testing
To run the test suite, execute:
```bash
pytest
```
