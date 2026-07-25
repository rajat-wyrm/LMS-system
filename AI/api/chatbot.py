from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from vector_store import VectorStore

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

class CourseChatbot:
    def __init__(self, vector_store: VectorStore, model_name="mistral"):
        self.vector_store = vector_store
        self.llm = ChatOllama(model=model_name)
        self.chat_history = []
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful course assistant. Use the provided context to answer questions."),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", PROMPT_TEMPLATE),
        ])

    def get_response(self, query_text: str, filter_sources=None):
        results = self.vector_store.query(query_text, k=5, filter_sources=filter_sources)
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
        chain = self.prompt | self.llm
        response = chain.invoke({
            "context": context_text,
            "question": query_text,
            "chat_history": self.chat_history
        })
        response_text = response.content
        self.chat_history.append(HumanMessage(content=query_text))
        self.chat_history.append(AIMessage(content=response_text))
        if len(self.chat_history) > 20:
            self.chat_history = self.chat_history[-20:]
        sources = [doc.metadata.get("id", "Unknown") for doc, _score in results]
        return response_text, sources

    def generate_title(self, conversation):
        if not conversation: return "New Chat"
        # Combine the first few messages to get context
        content = "\n".join([f"{m.type}: {m.content[:200]}" for m in conversation[:2]])
        prompt = f"Based on this conversation, generate a short 2-4 word title. Respond ONLY with the title: \n\n{content}"
        try:
            res = self.llm.invoke(prompt)
            return res.content.strip().strip('"').strip("'")
        except:
            return "Untitled Chat"

    def clear_history(self):
        self.chat_history = []
