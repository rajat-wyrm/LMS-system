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

    def add_documents(self, chunks: list[Document], notebook_id: str, course_id: str = None):
        """
        Adds document chunks to ChromaDB, tagging each chunk with notebook_id,
        course_id, filename, and composite chunk ID for strict retrieval isolation.
        Safely supports re-ingestion and document updates without deleting old
        chunks prematurely or duplicating chunks.
        """
        if not chunks:
            return False

        for chunk in chunks:
            chunk.metadata["notebook_id"] = notebook_id
            if course_id:
                chunk.metadata["course_id"] = course_id
            if "source" in chunk.metadata:
                chunk.metadata["source"] = os.path.basename(chunk.metadata["source"])
                chunk.metadata["filename"] = chunk.metadata["source"]
        
        db = self.get_db()
        chunks_with_ids = self._calculate_chunk_ids(chunks)
        new_ids = [c.metadata["id"] for c in chunks_with_ids]
        
        # Determine source names present in these chunks
        source_names = list({c.metadata.get("source") for c in chunks if c.metadata.get("source")})

        # Query existing chunks for these specific sources within this notebook
        existing_doc_chunk_ids = set()
        for src in source_names:
            existing = db.get(
                where={"$and": [{"notebook_id": notebook_id}, {"source": src}]},
                include=[]
            )
            if existing and existing.get("ids"):
                existing_doc_chunk_ids.update(existing["ids"])

        # Step 1: Add/upsert new chunks first to ensure no data loss
        # Note: db.add_documents with explicit IDs in Chroma performs an upsert / insert
        db.add_documents(chunks_with_ids, ids=new_ids)

        # Step 2: Now that replacement chunks are written and verified, remove any obsolete chunks
        # (e.g. if updated document has fewer chunks than before)
        new_id_set = set(new_ids)
        obsolete_ids = [cid for cid in existing_doc_chunk_ids if cid not in new_id_set]
        if obsolete_ids:
            db.delete(ids=obsolete_ids)

        return True

    def query(self, query_text: str, notebook_id: str = None, course_id: str = None, k=5, source_names: list[str] = None):
        """
        Queries ChromaDB enforcing notebook_id and/or course_id isolation filtering.
        """
        db = self.get_db()
        
        # Build filter list
        filters = []
        if notebook_id:
            filters.append({"notebook_id": notebook_id})
        if course_id:
            filters.append({"course_id": course_id})
            
        if not filters:
            raise ValueError("Query requires either notebook_id or course_id for isolation filtering.")
        
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
