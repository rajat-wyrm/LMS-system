import os
import shutil
from langchain_chroma import Chroma
from langchain_core.documents import Document
from get_embedding_function import get_embedding_function

class ChromaStore:
    def __init__(self, chroma_path="chroma", model_name="nomic-embed-text"):
        self.base_chroma_path = chroma_path
        self.model_name = model_name or "nomic-embed-text"
        
        # Isolate database directories per model to prevent vector dimension mismatch
        sanitized_name = self.model_name.replace("/", "_")
        self.chroma_path = os.path.join(self.base_chroma_path, sanitized_name)
        
        self.embedding_function = get_embedding_function(self.model_name)
        if not os.path.exists(self.chroma_path):
            os.makedirs(self.chroma_path, exist_ok=True)

    def get_db(self):
        return Chroma(
            persist_directory=self.chroma_path,
            embedding_function=self.embedding_function
        )

    def add_documents(self, chunks: list[Document], notebook_id: str):
        # Add notebook_id and normalize source to filename
        for chunk in chunks:
            chunk.metadata["notebook_id"] = notebook_id
            if "source" in chunk.metadata:
                chunk.metadata["source"] = os.path.basename(chunk.metadata["source"])
        
        db = self.get_db()
        chunks_with_ids = self._calculate_chunk_ids(chunks)
        
        # We don't necessarily need to check existing IDs globally if we use notebook_id as filter
        # but let's keep the logic for deduplication
        existing_items = db.get(include=[])
        existing_ids = set(existing_items["ids"])
        new_chunks = [c for c in chunks_with_ids if c.metadata["id"] not in existing_ids]

        if new_chunks:
            db.add_documents(new_chunks, ids=[c.metadata["id"] for c in new_chunks])
            return True
        return False

    def query(self, query_text: str, notebook_id: str, k=5, source_names: list[str] = None):
        db = self.get_db()
        
        # Build filter list
        filters = [{"notebook_id": notebook_id}]
        
        if source_names and len(source_names) > 0:
            if len(source_names) == 1:
                filters.append({"source": source_names[0]})
            else:
                filters.append({"source": {"$in": source_names}})
        
        # Chroma requires explicit $and for multiple keys
        if len(filters) > 1:
            filter_dict = {"$and": filters}
        else:
            filter_dict = filters[0]
                
        search_kwargs = {
            "k": k,
            "filter": filter_dict
        }
        
        return db.similarity_search_with_score(query_text, **search_kwargs)

    def delete_notebook_data(self, notebook_id: str):
        db = self.get_db()
        data = db.get(where={"notebook_id": notebook_id}, include=[])
        if data['ids']:
            db.delete(ids=data['ids'])
            return True
        return False

    def delete_document_data(self, notebook_id: str, source_name: str):
        db = self.get_db()
        data = db.get(where={"$and": [{"notebook_id": notebook_id}, {"source": source_name}]}, include=[])
        if data['ids']:
            db.delete(ids=data['ids'])
            return True
        return False

    def _calculate_chunk_ids(self, chunks):
        last_page_id = None
        current_chunk_index = 0
        for chunk in chunks:
            source = chunk.metadata.get("source")
            page = chunk.metadata.get("page", 0)
            notebook_id = chunk.metadata.get("notebook_id")
            current_page_id = f"{notebook_id}:{source}:{page}"
            if current_page_id == last_page_id:
                current_chunk_index += 1
            else:
                current_chunk_index = 0
            chunk_id = f"{current_page_id}:{current_chunk_index}"
            last_page_id = current_page_id
            chunk.metadata["id"] = chunk_id
        return chunks
