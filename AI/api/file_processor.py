import os
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredPowerPointLoader,
    TextLoader,
    DirectoryLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class FileProcessor:
    def __init__(self, chunk_size=500, chunk_overlap=100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )

    def load_pdf(self, file_path: str) -> list[Document]:
        loader = PyPDFLoader(file_path)
        return loader.load()

    def load_ppt(self, file_path: str) -> list[Document]:
        loader = UnstructuredPowerPointLoader(file_path, mode="elements", strategy="fast")
        return loader.load()

    def load_txt(self, file_path: str) -> list[Document]:
        try:
            loader = TextLoader(file_path, encoding="utf-8")
            return loader.load()
        except UnicodeDecodeError:
            loader = TextLoader(file_path, encoding="latin-1")
            return loader.load()

    def load_directory(self, dir_path: str) -> list[Document]:
        # This handles multiple types if configured
        documents = []
        for file in os.listdir(dir_path):
            file_path = os.path.join(dir_path, file)
            if file.endswith(".pdf"):
                documents.extend(self.load_pdf(file_path))
            elif file.endswith(".pptx") or file.endswith(".ppt"):
                documents.extend(self.load_ppt(file_path))
            elif file.endswith(".txt") or file.endswith(".md"):
                documents.extend(self.load_txt(file_path))
        return documents

    def split_documents(self, documents: list[Document]) -> list[Document]:
        for doc in documents:
            if "source" in doc.metadata:
                doc.metadata["source"] = os.path.basename(doc.metadata["source"])
        return self.text_splitter.split_documents(documents)
