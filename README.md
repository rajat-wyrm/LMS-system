# Independent AI Tutor (FastAPI + RAG)

This is a standalone project. It does not import or connect to an LMS.

## Requirements
- Python 3.10 or newer
- Ollama installed and running
- Internet access on first run to download the sentence-transformers embedding model

## Windows PowerShell setup

```powershell
cd path\to\AI-Tutor
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

In another terminal, download the local language model:

```powershell
ollama pull gemma3:1b
```

Start Ollama if it is not already running, then start the API:

```powershell
python -m uvicorn main:app --reload --port 8001
```

Open Swagger:

http://127.0.0.1:8001/docs

## Use the API
1. Open `POST /api/tutor/upload`.
2. Upload a PDF or TXT course document.
3. Open `POST /api/tutor/generate`.
4. Send:

```json
{
  "question": "Explain the main topic in the uploaded document."
}
```

The response contains `answer` and `sources` (filename and page).

## Notes
- The ChromaDB data is stored in `chroma_db/`.
- Uploaded files are stored in `documents/`.
- Scanned/image-only PDFs may need OCR before their text can be indexed.
- The retrieval similarity threshold in `rag_engine.py` is an initial value and should be evaluated against your course documents.
- Prompt instructions and retrieval thresholds reduce unsupported answers but cannot mathematically guarantee that a language model will never hallucinate. Verify outputs before relying on them.
- To use a different Ollama model, set the `OLLAMA_MODEL` environment variable before starting Uvicorn.
