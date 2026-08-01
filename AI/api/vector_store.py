import os
import shutil
from langchain_chroma import Chroma
from langchain_core.documents import Document
from get_embedding_function import get_embedding_function

class VectorStore:
    def __init__(self, chroma_path="chroma"):
        self.chroma_path = chroma_path
        self.embedding_function = get_embedding_function()
        if os.path.exists(self.chroma_path):
            self._ensure_permissions()

    def _ensure_permissions(self):
        try:
            os.chmod(self.chroma_path, 0o777)
        except: pass

    def get_db(self):
        return Chroma(
            persist_directory=self.chroma_path,
            embedding_function=self.embedding_function
        )

    def add_documents(self, chunks: list[Document]):
        db = self.get_db()
        chunks_with_ids = self._calculate_chunk_ids(chunks)
        existing_items = db.get(include=[])
        existing_ids = set(existing_items["ids"])
        new_chunks = [c for c in chunks_with_ids if c.metadata["id"] not in existing_ids]

        if new_chunks:
            db.add_documents(new_chunks, ids=[c.metadata["id"] for c in new_chunks])
            return True
        return False

    def query(self, query_text: str, k=5, filter_sources=None):
        db = self.get_db()
        search_kwargs = {"k": k}
        if filter_sources:
            search_kwargs["filter"] = {"source": {"$in": filter_sources}}
        return db.similarity_search_with_score(query_text, **search_kwargs)

    def list_sources(self):
        try:
            db = self.get_db()
            data = db.get(include=['metadatas'])
            sources = set()
            if data['metadatas']:
                for m in data['metadatas']:
                    if 'source' in m: sources.add(m['source'])
            return sorted(list(sources))
        except: return []

    def delete_source(self, source_name):
        db = self.get_db()
        data = db.get(where={"source": source_name}, include=[])
        if data['ids']:
            db.delete(ids=data['ids'])
            return True
        return False

    def clear_database(self):
        if os.path.exists(self.chroma_path):
            try:
                db = self.get_db()
                ids = db.get(include=[])['ids']
                if ids: db.delete(ids=ids)
            except:
                shutil.rmtree(self.chroma_path)

    def _calculate_chunk_ids(self, chunks):
        last_page_id = None
        current_chunk_index = 0
        for chunk in chunks:
            source = chunk.metadata.get("source")
            page = chunk.metadata.get("page", 0)
            current_page_id = f"{source}:{page}"
            if current_page_id == last_page_id:
                current_chunk_index += 1
            else:
                current_chunk_index = 0
            chunk_id = f"{current_page_id}:{current_chunk_index}"
            last_page_id = current_page_id
            chunk.metadata["id"] = chunk_id
        return chunks
