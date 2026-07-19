# RAG-based Course Chatbot Architecture Report (Ollama Version)

## 1. Objective
The goal is to build a chatbot that answers questions based exclusively on uploaded course materials (PDF, PPT, TXT) using Retrieval-Augmented Generation (RAG), running entirely locally via Ollama.

## 2. Architecture Overview
The system follows the standard RAG architecture:
1.  **Ingestion Phase**: Documents are uploaded, partitioned, and split into manageable chunks.
2.  **Embedding Phase**: Chunks are converted into vector representations using a local embedding model (`nomic-embed-text` via Ollama).
3.  **Storage Phase**: Vectors are stored in a local vector database (ChromaDB).
4.  **Retrieval Phase**: User queries are embedded and used to search the vector database for relevant context.
5.  **Generation Phase**: An LLM (`mistral` via Ollama) generates an answer using the retrieved context and conversation history.

## 3. Workflow Diagram
```text
[User Uploads Files] -> [File Processor (LangChain)] -> [Text Splitter] 
                                                              |
                                                              v
[User Query] -> [Embedder (Ollama)] <-> [Vector Store (ChromaDB)]
      |                                              |
      v                                              v
[LLM (Ollama)] <--------------------------- [Retrieved Context]
      |
      v
[Final Answer + Sources]
```

## 4. Key Components
-   **`app.py`**: Streamlit-based user interface. Handles file uploads, chat history, and state management.
-   **`file_processor.py`**: Uses `PyPDFLoader` for PDFs and `UnstructuredPowerPointLoader` for PPT files. Implements `RecursiveCharacterTextSplitter`.
-   **`vector_store.py`**: Manages ChromaDB operations, including adding documents with persistent IDs and querying.
-   **`chatbot.py`**: Implements `ConversationalRetrievalChain` with `ConversationBufferMemory` to maintain context across multiple turns.
-   **`get_embedding_function.py`**: Provides a consistent interface for the Ollama embedding model.

## 5. Technology Stack
-   **Orchestration**: LangChain
-   **LLM & Embeddings**: Ollama (mistral / nomic-embed-text)
-   **Vector Database**: ChromaDB
-   **File Processing**: PyPDF, Unstructured
-   **UI**: Streamlit

## 6. Sample Test Cases
1.  **PDF Retrieval**: Upload a syllabus and ask "What is the grading policy?".
2.  **PPT Analysis**: Upload a lecture PPT and ask "What are the three main types of machine learning discussed?".
3.  **Contextual History**: Ask a question, then follow up with "Can you explain that in more detail?".
4.  **Source Attribution**: Verify that the chatbot lists the correct file and page/chunk ID for its answers.
