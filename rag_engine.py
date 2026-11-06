
import os
import re
from pypdf import PdfReader

# ==========================================
# MOCK RAG ENGINE - AI TUTOR
# ==========================================

# Store uploaded document information in memory
documents = []

# Common words ignored during keyword matching
STOP_WORDS = {
    "what", "is", "are", "was", "were", "the",
    "a", "an", "of", "in", "on", "to", "for",
    "and", "or", "how", "why", "when", "where",
    "who", "which", "with", "by", "from", "do",
    "does", "did", "explain", "describe", "tell",
    "me", "about", "define", "give", "show"
}


# ==========================================
# 1. READ PDF AND TXT DOCUMENTS
# ==========================================

def read_document(file_path):

    pages = []

    if not os.path.exists(file_path):
        raise FileNotFoundError("Document not found")

    if file_path.lower().endswith(".pdf"):

        reader = PdfReader(file_path)

        for page_number, page in enumerate(reader.pages, start=1):

            text = page.extract_text() or ""

            if text.strip():
                pages.append((text, page_number))

    elif file_path.lower().endswith(".txt"):

        with open(file_path, "r", encoding="utf-8") as file:

            text = file.read()

            if text.strip():
                pages.append((text, 1))

    else:
        raise ValueError("Only PDF and TXT files are supported")

    return pages


# ==========================================
# 2. CLEAN EXTRACTED TEXT
# ==========================================

def clean_text(text):

    text = text.replace("\x00", " ")
    text = re.sub(r"-\s*\n\s*", "", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# ==========================================
# 3. SPLIT TEXT INTO CHUNKS
# ==========================================

def split_text(text, chunk_size=800):

    text = clean_text(text)

    chunks = []

    for i in range(0, len(text), chunk_size):

        chunk = text[i:i + chunk_size].strip()

        if chunk:
            chunks.append(chunk)

    return chunks


# ==========================================
# 4. UPLOAD AND STORE DOCUMENT
# ==========================================

def add_document(file_path):

    pages = read_document(file_path)

    filename = os.path.basename(file_path)

    chunks_added = 0

    for page_text, page_number in pages:

        chunks = split_text(page_text)

        for chunk in chunks:

            documents.append({
                "content": chunk,
                "source": filename,
                "page": page_number
            })

            chunks_added += 1

    if chunks_added == 0:
        raise ValueError("No readable text found in document")

    return chunks_added


# ==========================================
# 5. EXTRACT QUESTION KEYWORDS
# ==========================================

def get_keywords(text):

    words = re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())

    keywords = {
        word for word in words
        if word not in STOP_WORDS and len(word) > 1
    }

    return keywords


# ==========================================
# 6. RETRIEVE RELEVANT DOCUMENT CHUNKS
# ==========================================

def retrieve_documents(question, top_k=5):

    question_keywords = get_keywords(question)

    if not question_keywords:
        return []

    results = []

    for document in documents:

        content = document["content"]

        content_keywords = get_keywords(content)

        matched_words = question_keywords.intersection(
            content_keywords
        )

        score = len(matched_words)

        if score > 0:

            # Give a small bonus for matching the full phrase
            if question.lower().strip() in content.lower():
                score += 2

            results.append({
                "score": score,
                "document": document
            })

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return [
        item["document"]
        for item in results[:top_k]
    ]


# ==========================================
# 7. EXTRACT RELEVANT SENTENCES
# ==========================================

def extract_relevant_sentences(question, retrieved):

    question_keywords = get_keywords(question)

    sentence_results = []

    for document in retrieved:

        content = document["content"]

        sentences = re.split(
            r'(?<=[.!?])\s+',
            content
        )

        for sentence in sentences:

            sentence = sentence.strip()

            if len(sentence) < 20:
                continue

            sentence_keywords = get_keywords(sentence)

            matched = question_keywords.intersection(
                sentence_keywords
            )

            score = len(matched)

            if score > 0:

                sentence_results.append({
                    "score": score,
                    "text": sentence,
                    "source": document["source"],
                    "page": document["page"]
                })

    sentence_results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # Remove duplicate sentences
    selected = []
    seen = set()

    for item in sentence_results:

        sentence_key = item["text"].lower()

        if sentence_key not in seen:

            seen.add(sentence_key)
            selected.append(item)

        if len(selected) >= 6:
            break

    return selected


# ==========================================
# 8. GENERATE MOCK RAG ANSWER
# ==========================================

def generate_answer(question):

    if not question or not question.strip():

        return {
            "answer": "Please enter a valid question.",
            "sources": []
        }

    if not documents:

        return {
            "answer": (
                "No documents have been uploaded yet. "
                "Please upload a PDF or TXT document first."
            ),
            "sources": []
        }

    # Retrieve relevant chunks
    retrieved = retrieve_documents(question)

    if not retrieved:

        return {
            "answer": (
                "Sorry, no relevant information was found "
                "in the uploaded documents. "
                "Please try another question."
            ),
            "sources": []
        }

    # Extract relevant sentences
    relevant_sentences = extract_relevant_sentences(
        question,
        retrieved
    )

    if not relevant_sentences:

        return {
            "answer": (
                "Relevant document sections were found, "
                "but no complete matching sentences could "
                "be extracted. Please try another question."
            ),
            "sources": []
        }

    # Format answer
    answer = (
        "MOCK RAG RESPONSE\n\n"
        "Based on the information retrieved from "
        "your uploaded documents:\n\n"
    )

    for index, item in enumerate(relevant_sentences, start=1):

        answer += f"{index}. {item['text']}\n\n"

    # Collect unique source references
    sources = []
    seen_sources = set()

    for item in relevant_sentences:

        source_key = (
            item["source"],
            item["page"]
        )

        if source_key not in seen_sources:

            seen_sources.add(source_key)

            sources.append({
                "source": item["source"],
                "page": item["page"]
            })

    return {
        "answer": answer.strip(),
        "sources": sources
    }


# ==========================================
# 9. CLEAR STORED DOCUMENTS
# ==========================================

def clear_documents():

    documents.clear()

    return {
        "message": "All uploaded documents cleared successfully"
    }
