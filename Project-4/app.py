import glob 
import re
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_experimental.text_splitter import SemanticChunker

# STEP 1: UPLOAD (Load PDF)
def get_pdf_path() -> tuple[str, list[Document]]:
    pdf_files = glob.glob("*.pdf")
    if not pdf_files:
        raise FileNotFoundError("No pdf file found found in the current directory.")
    pdf_path = pdf_files[0]
    loader = PyPDFLoader(pdf_path)
    raw_pages = loader.load()
    print(f"[1/5 Upload] Loaded '{pdf_path}' ({len(raw_pages)} pages).")
    return pdf_path, raw_pages

# STEP 2: CLEAN (Normalize PDF Text)
def clean_documents(pages: list[Document]) ->list[Document]:
    cleaned_pages = []
    for doc in pages:
        text = doc.page_content

        text = re.sub(r"-\s*\n\s*", "", text)
        text = re.sub(r"\s+", " ", text).strip()

        if text:
            cleaned_pages.append(
                Document(page_content=text, metadata=doc.metadata)
            )
    print(f"[2/5 Clean] Cleaned {len(cleaned_pages)} non-empty pages.")
    return cleaned_pages

# STEP 3 & 4: EMBEDDING MODEL + SEMANTIC CHUNKING
def get_embedding_model() -> HuggingFaceEmbeddings:
    print("[3/5 Embedding] Loading HuggingFace SentenceTransformer model...")
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )   

def semantic_chunk(
    cleaned_pages: list[Document],
    embeddings: HuggingFaceEmbeddings,
) -> list[Document]:
    splitter = SemanticChunker(
        embeddings=embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=90,
    )
    chunks = splitter.split_documents(cleaned_pages)
    print(f"[4/5 Semantic Chunk] Created {len(chunks)} semantic chunks.")
    return chunks

# STEP 5: DATABASE (Store in ChromaDB)
def store_in_database(
    chunks: list[Document],
    embeddings: HuggingFaceEmbeddings,
    persist_dir: str = "./chroma_semantic_db",
) -> Chroma:
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name="rulebook_semantic",
        persist_directory=persist_dir,
    )
    print(f"[5/5 Database] Indexed {len(chunks)} chunks into '{persist_dir}'.")
    return vectorstore

# RUN PIPELINE + TEST RETRIEVAL
def main() -> None:
    _, raw_pages = get_pdf_path()
    cleaned_pages = clean_documents(raw_pages)
    embeddings = get_embedding_model()
    chunks = semantic_chunk(cleaned_pages, embeddings)
    vectorstore = store_in_database(chunks, embeddings)

    print("\nPipeline complete! Test semantic retrieval (type 'exit' to quit):\n")
    while True:
        query = input("Ask a question: ").strip()
        if query.lower() in {"exit", "quit"}:
            break
        if not query:
            continue

        results = vectorstore.similarity_search(query, k=3)
        for idx, doc in enumerate(results, start=1):
            page_num = doc.metadata.get("page", "N/A")
            print(f"\n[{idx}] (Page {page_num})\n{doc.page_content}")
        print("\n" + "-" * 50)


if __name__ == "__main__":
    main()