import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
PERSIST_DIR = BASE_DIR / "chroma_db"
COLLECTION_NAME = "graphs_course_rag"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)


def get_vector_store(embeddings: HuggingFaceEmbeddings | None = None) -> Chroma:
    emb = embeddings or get_embeddings()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=emb,
        persist_directory=str(PERSIST_DIR),
    )


def upload_file(src_path: str | Path, upload_dir: Path = UPLOAD_DIR) -> Path:
    src = Path(src_path)
    if not src.is_file():
        raise FileNotFoundError(f"File not found: {src}")
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / src.name
    if src.resolve() != dest.resolve():
        shutil.copy2(src, dest)
    return dest


def load_file(file_path: Path) -> list[Document]:
    ext = file_path.suffix.lower()
    if ext == ".pdf":
        return PyPDFLoader(str(file_path)).load()
    if ext in {".txt", ".md"}:
        text = file_path.read_text(encoding="utf-8", errors="ignore")
        return [Document(page_content=text, metadata={"source": file_path.name})]
    raise ValueError(f"Unsupported file type: {ext}")


def clean_text(text: str) -> str:
    text = text.replace("\f", "\n\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def ingest_document(source_file: str | Path) -> dict:
    doc_id = str(uuid4())

    # 1. Upload
    saved_path = upload_file(source_file)

    # 2. Load
    raw_pages = load_file(saved_path)

    # 3 & 4. Clean + Chunk (RecursiveCharacterTextSplitter)
    splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ". ", " ", ""],
        chunk_size=900,
        chunk_overlap=150,
    )

    chunk_docs: list[Document] = []
    chunk_idx = 0
    uploaded_at = datetime.now(timezone.utc).isoformat()

    for page_doc in raw_pages:
        cleaned = clean_text(page_doc.page_content)
        if not cleaned:
            continue
        pieces = splitter.split_text(cleaned)
        for piece in pieces:
            meta = dict(page_doc.metadata)
            meta.update(
                {
                    "doc_id": doc_id,
                    "source": saved_path.name,
                    "chunk_index": chunk_idx,
                    "uploaded_at": uploaded_at,
                }
            )
            chunk_docs.append(Document(page_content=piece, metadata=meta))
            chunk_idx += 1

    if not chunk_docs:
        raise ValueError(f"No extractable text found in {saved_path.name}")

    # 5 & 6. Embed + Store in Chroma
    embeddings = get_embeddings()
    vector_store = get_vector_store(embeddings)
    ids = [f"{doc_id}_{i}" for i in range(len(chunk_docs))]
    vector_store.add_documents(documents=chunk_docs, ids=ids)

    return {
        "doc_id": doc_id,
        "source": saved_path.name,
        "pages_loaded": len(raw_pages),
        "chunks_stored": len(chunk_docs),
    }


def query_chunks(question: str, k: int = 3, vector_store: Chroma | None = None) -> list[Document]:
    store = vector_store or get_vector_store()
    return store.similarity_search(question, k=k)


if __name__ == "__main__":
    store = get_vector_store()
    print("Ready! Type your question about the PDF (or 'exit' to quit).")

    while True:
        q = input("\nAsk a question: ").strip()
        if not q:
            continue
        if q.lower() in {"exit", "quit", "q"}:
            break

        hits = query_chunks(q, k=3, vector_store=store)
        for rank, doc in enumerate(hits, 1):
            page = doc.metadata.get("page", "N/A")
            chunk_idx = doc.metadata.get("chunk_index", "N/A")
            print(f"\n[Hit {rank} | page={page} | chunk={chunk_idx}]")
            print(doc.page_content.strip())