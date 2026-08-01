from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from app.vectorstore.chroma_store import ChromaStore
import json

PROMPT_TEMPLATE = """
You are an Agentic Course Assistant. Use information from ALL retrieved documents.

Documents Context:
{context}

Instructions:
- Use ONLY the information present in the Documents Context.
- Do NOT use external knowledge.
- Do NOT guess.
- If the answer is not explicitly present in the Documents Context, reply exactly: "Not found in the uploaded documents."
- Answer using only the retrieved document content.
- Combine information from multiple documents when relevant.
- Give one clear and concise answer.
- For "What is..." questions, provide the definition first.
- Mention examples or applications only after the definition.
- Keep definition answers to 2-4 sentences.

Question: {question}
"""

class RAGService:
    def __init__(self, chroma_store: ChromaStore, model_name="mistral"):
        self.chroma_store = chroma_store
        self.llm = ChatOllama(model=model_name)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful course assistant. Use the provided context to answer questions."),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", PROMPT_TEMPLATE),
        ])

    def _rerank(self, query_text: str, results: list, k: int = 5):
        if not results:
            return []
            
        # Dynamically import sentence_transformers to save startup memory when reranking is off
        from sentence_transformers import CrossEncoder
        global _reranker_cache
        if '_reranker_cache' not in globals():
            global _reranker_cache
            _reranker_cache = {}
            
        reranker_model = "cross-encoder/ms-marco-MiniLM-L-6-v2"
        if reranker_model not in _reranker_cache:
            print(f"Loading CrossEncoder in memory: {reranker_model}...")
            _reranker_cache[reranker_model] = CrossEncoder(reranker_model)
            
        reranker = _reranker_cache[reranker_model]
        
        # Prepare inputs: pairs of [query, passage]
        pairs = [[query_text, doc.page_content] for doc, _score in results]
        
        # Predict similarity scores
        scores = reranker.predict(pairs)
        
        # Sort indices by score descending
        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        
        # Re-rank results (preserve (Document, score) tuple format)
        reranked_results = [(results[i][0], float(scores[i])) for i in ranked_indices]
        
        # Limit to top k
        return reranked_results[:k]

    def get_response(self, query_text: str, notebook_id: str, chat_history=None, source_names=None, use_reranking=False):
        if chat_history is None:
            chat_history = []
            
        k_query = 15 if use_reranking else 5
        results = self.chroma_store.query(query_text, notebook_id=notebook_id, k=k_query, source_names=source_names)
        
        if use_reranking:
            results = self._rerank(query_text, results, k=5)
            
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        
        # Convert chat_history list to langchain messages if they are just strings/dicts
        formatted_history = []
        for msg in chat_history:
            if msg["role"] == "user":
                formatted_history.append(HumanMessage(content=msg["content"]))
            else:
                formatted_history.append(AIMessage(content=msg["content"]))
                
        chain = self.prompt | self.llm
        response = chain.invoke({
            "context": context_text,
            "question": query_text,
            "chat_history": formatted_history
        })
        
        response_text = response.content
        sources = []
        for doc, _score in results:
            sources.append({
                "document": doc.metadata.get("source", "Unknown"),
                "page": doc.metadata.get("page", 0)
            })
            
        return response_text, sources

    def get_suggested_topics(self, notebook_id: str, source_names=None):
        # Optimized: query fewer results for faster topic extraction
        results = self.chroma_store.query("What are the main headings and topics?", notebook_id=notebook_id, k=10, source_names=source_names)
        
        if not results:
            return json.dumps(["Foundations", "Core Concepts", "Advanced Topics"])
            
        context_text = "\n\n".join([doc.page_content[:500] for doc, _score in results])
        
        prompt = f"""
        List 5 key topic names from this context.
        Return ONLY a JSON array of strings. No extra text.
        
        Context:
        {context_text}
        """
        
        try:
            res = self.llm.invoke(prompt)
            content = res.content.strip()
            # Fast extraction
            if "[" in content and "]" in content:
                content = content[content.find("["):content.rfind("]")+1]
            
            # Validate JSON
            parsed = json.loads(content)
            if isinstance(parsed, list):
                return json.dumps(parsed[:5])
            return content
        except Exception as e:
            return json.dumps(["Core Material", "Key Definitions", "Theoretical Framework", "Practical Applications", "Summary"])

    def generate_quiz(self, notebook_id: str, topic: str, num_questions: int = 5, source_names=None, use_reranking=False):
        # Retrieve context for the topic
        k_query = 30 if use_reranking else 15
        results = self.chroma_store.query(topic, notebook_id=notebook_id, k=k_query, source_names=source_names)
        
        if use_reranking:
            results = self._rerank(topic, results, k=15)
            
        if not results:
             return json.dumps([{
                "question_text": "No context found. Please upload more documents about this topic.",
                "options": ["Understood", "Okay", "Will do", "Got it"],
                "correct_option": 0,
                "explanation": "Please upload documents to build your knowledge base.",
                "explanations": [
                    "Please upload documents to begin learning.",
                    "Please upload documents to begin learning.",
                    "Please upload documents to begin learning.",
                    "Please upload documents to begin learning."
                ]
            }])

        context_text = "\n\n".join([doc.page_content for doc, _score in results])
        
        prompt = f"""
        Generate a {num_questions}-question multiple choice quiz about "{topic}".
        Return ONLY a JSON array of objects.
        
        Format per object:
        {{
            "question_text": "the question",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_option": 0,
            "explanation": "Detailed explanation of why the correct option is right.",
            "explanations": [
                "Detailed explanation of why option 1 (Option A) is correct or incorrect",
                "Detailed explanation of why option 2 (Option B) is correct or incorrect",
                "Detailed explanation of why option 3 (Option C) is correct or incorrect",
                "Detailed explanation of why option 4 (Option D) is correct or incorrect"
            ]
        }}

        Context:
        {context_text}
        """
        
        try:
            res = self.llm.invoke(prompt)
            content = res.content.strip()
            # Strict JSON extraction
            if "[" in content and "]" in content:
                content = content[content.find("["):content.rfind("]")+1]
            return content
        except Exception as e:
            print(f"Quiz Generation Error: {str(e)}")
            return json.dumps([{
                "question_text": f"Error generating quiz for {topic}.",
                "options": ["Retry", "Change Topic", "Check Material", "Wait"],
                "correct_option": 0,
                "explanation": "An error occurred during generation. Please try again.",
                "explanations": [
                    "Retry the generation",
                    "Change the quiz topic",
                    "Check the study material",
                    "Wait and try later"
                ]
            }])

    def evaluate_assignment(self, notebook_id: str, question: str, student_answer: str, source_names=None, use_reranking=False):
        # Retrieve context for the question
        k_query = 15 if use_reranking else 5
        results = self.chroma_store.query(question, notebook_id=notebook_id, k=k_query, source_names=source_names)
        
        if use_reranking:
            results = self._rerank(question, results, k=5)
            
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        
        prompt = f"""
        Evaluate the student's answer to the question based on the provided context.
        
        Question: {question}
        Student Answer: {student_answer}
        
        Context:
        {context_text}
        
        Provide feedback in JSON format:
        {{
            "score": int (0-10),
            "strengths": [str],
            "missing_concepts": [str],
            "feedback": str
        }}
        """
        
        try:
            res = self.llm.invoke(prompt)
            return res.content
        except Exception as e:
            return str(e)

    def generate_practice_question(self, notebook_id: str, topic: str = "general", source_names=None, use_reranking=False):
        k_query = 20 if use_reranking else 10
        results = self.chroma_store.query(topic, notebook_id=notebook_id, k=k_query, source_names=source_names)
        
        if use_reranking:
            results = self._rerank(topic, results, k=10)
            
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        
        prompt = f"""
        Based on the following context, generate ONE thought-provoking practice question for a student to answer.
        The question should be about "{topic}".
        Respond ONLY with the question text.

        Context:
        {context_text}
        """
        try:
            res = self.llm.invoke(prompt)
            return res.content.strip()
        except Exception as e:
            return "What is the main concept discussed in this material?"

    def generate_title(self, description: str):
        prompt = f"""
        Generate a concise, catchy, and professional title for a learning notebook with the following description:
        "{description}"
        
        Respond with ONLY the title text, nothing else.
        """
        try:
            res = self.llm.invoke(prompt)
            return res.content.strip().replace('"', '')
        except Exception as e:
            return "New Learning Workspace"

    def generate_description(self, notebook_id: str, source_names=None):
        results = self.chroma_store.query("What is this material about?", notebook_id=notebook_id, k=15, source_names=source_names)
        if not results:
            return "A new workspace for your learning materials."
            
        context_text = "\n\n".join([doc.page_content[:500] for doc, _score in results])
        
        prompt = f"""
        Summarize the main purpose and content of this material into a professional two-sentence description for a learning notebook.
        
        Context:
        {context_text}
        
        Respond with ONLY the description text.
        """
        try:
            res = self.llm.invoke(prompt)
            return res.content.strip()
        except Exception as e:
            return "A workspace containing study materials and research documents."
