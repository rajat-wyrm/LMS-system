# Notebook-based Learning Platform - Backend API Documentation

This backend is built with **FastAPI**, **SQLModel**, and **LangChain**. It provides a robust RAG (Retrieval-Augmented Generation) system organized around the concept of "Notebooks".

## Base URL
`http://localhost:8000/api`

## Core Concepts

- **Notebook**: The primary workspace. All documents, chats, and quizzes belong to a specific notebook.
- **RAG (Retrieval-Augmented Generation)**: Questions are answered based *only* on the documents uploaded to the current notebook.
- **Filtering**: Even though all vectors are in one store, the backend uses `notebook_id` metadata filtering to ensure strict data isolation.

---

## 1. Notebooks

### Create Notebook
`POST /notebooks`

**Request Body:**
```json
{
  "title": "Machine Learning",
  "description": "Foundations of Neural Networks"
}
```

**Response:**
```json
{
  "id": "nb_a1b2c3d4",
  "title": "Machine Learning",
  "description": "Foundations of Neural Networks",
  "created_at": "2023-10-27T10:00:00"
}
```

### List All Notebooks
`GET /notebooks`

**Response:** Array of Notebook objects.

### Get Notebook Details
`GET /notebooks/{id}`

**Response:** Includes metadata and IDs for associated documents and chats.

---

## 2. Documents

### Upload Document
`POST /notebooks/{id}/documents`

**Form Data:**
- `file`: The PDF, TXT, or PPTX file.

**Flow:** The backend saves the file, extracts text, chunks it, generates embeddings, and stores them in ChromaDB with a `notebook_id` tag.

**Response:**
```json
{
  "id": "doc_z9y8x7",
  "name": "lecture1.pdf",
  "status": "indexed",
  "uploaded_at": "..."
}
```

### List Documents in Notebook
`GET /notebooks/{id}/documents`

### Delete Document
`DELETE /documents/{doc_id}`

---

## 3. Chat (RAG)

### Create a Chat
`POST /notebooks/{id}/chats`

**Request Body:**
```json
{
  "title": "Transformers Discussion"
}
```

### Ask a Question (The RAG Endpoint)
`POST /chats/{chat_id}/ask`

**Request Body:**
```json
{
  "question": "What is self-attention?"
}
```

**Response:**
```json
{
  "answer": "Self-attention is a mechanism that...",
  "sources": [
    {
      "document": "lecture1.pdf",
      "page": 12
    },
    {
      "document": "transformers_paper.pdf",
      "page": 3
    }
  ]
}
```

### Get Chat History
`GET /chats/{chat_id}/messages`

---

## 4. Quizzes

### Generate Quiz
`POST /notebooks/{id}/quiz/generate`

**Request Body:**
```json
{
  "topic": "Backpropagation",
  "num_questions": 5
}
```

**Response:** Returns a Quiz object containing an array of questions, options, and correct answers (for local grading or display).

### Submit Quiz
`POST /quizzes/{quiz_id}/submit`

**Request Body:**
```json
{
  "answers": [0, 2, 1, 3, 0]
}
```

**Response:**
```json
{
  "score": 4,
  "total": 5,
  "results": [
    {"question": "...", "correct": true},
    {"question": "...", "correct": false}
  ]
}
```

---

## 5. Assignment Evaluator

### Evaluate Answer
`POST /notebooks/{id}/evaluate`

**Request Body:**
```json
{
  "question": "Explain the difference between L1 and L2 regularization.",
  "student_answer": "L1 is lasso and L2 is ridge. L1 helps with feature selection."
}
```

**Response:**
```json
{
  "id": "eval_m5n6o7",
  "score": 8,
  "feedback": "Good understanding of the names and feature selection. However, you missed the mathematical difference regarding the penalty terms..."
}
```

---

## Frontend Integration Tips

1. **State Management**: When a user selects a notebook, store the `notebook_id` globally. Most routes depend on it.
2. **Polling for Status**: Document processing is currently synchronous but the schema includes a `status` field. If you upload large files, consider checking the status until it hits `indexed`.
3. **Markdown Rendering**: The `answer` from the Chat endpoint and the `feedback` from the Evaluator are in Markdown. Use a library like `react-markdown`.
4. **Error Handling**: 404 is returned if a Notebook/Chat ID doesn't exist. 500 is returned if the LLM fails to generate JSON (e.g. for quizzes).
