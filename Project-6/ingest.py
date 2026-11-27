import os
import pickle
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

PDF_PATH = "Graphs-Complete-Course.pdf"
CHROMA_DIR = "./chroma_db"
CHUNKS_PATH = "./chunks.pkl"


def main():
    if not os.path.exists(PDF_PATH):
        raise FileNotFoundError(f"Could not find {PDF_PATH} in current directory.")

    print("1. Loading PDF...")
    loader = PyPDFLoader(PDF_PATH)
    pages = loader.load()
    print(f"   Loaded {len(pages)} pages.")

    print("2. Splitting into chunks...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    chunks = splitter.split_documents(pages)

    for idx, chunk in enumerate(chunks):
        # PyPDFLoader uses 0-indexed page numbers; display 1-indexed if present
        raw_page = chunk.metadata.get("page")
        page_num = raw_page + 1 if isinstance(raw_page, int) else "unknown"
        chunk.metadata["page_display"] = page_num
        chunk.metadata["chunk_id"] = idx

    print(f"   Created {len(chunks)} chunks.")

    print("3. Creating embeddings and saving Chroma DB...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
    )

    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump(chunks, f)

    print(f"Done! Vector store saved to '{CHROMA_DIR}' and chunks saved to '{CHUNKS_PATH}'.")


if __name__ == "__main__":
    main()