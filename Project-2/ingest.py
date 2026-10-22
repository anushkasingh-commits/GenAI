import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ensure GOOGLE_API_KEY is available if GEMINI_API_KEY is provided
if not os.getenv("GOOGLE_API_KEY") and os.getenv("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma


def get_pdf_path():
    """Determine the PDF file path from CLI argument, default file, or directory search."""
    if len(sys.argv) > 1:
        return sys.argv[1]
    
    default_files = ["campus_placement_guide.pdf", "placement_guide.pdf"]
    for file_name in default_files:
        if os.path.exists(file_name):
            return file_name
            
    # Search for any PDF file in the current working directory
    pdf_files = [f for f in os.listdir(".") if f.lower().endswith(".pdf")]
    if pdf_files:
        return pdf_files[0]
        
    return "campus_placement_guide.pdf"


def ingest():
    pdf_path = get_pdf_path()
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        print("Please place your PDF in this folder or pass its path as an argument:")
        print("    python ingest.py <path_to_pdf>")
        return

    # 1. Load the PDF using LangChain's PyPDFLoader
    print(f"Loading PDF from: {pdf_path}...")
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()
    print(f"Successfully loaded {len(pages)} page(s).")

    # 2. Split into chunks of 600 characters with 60 characters overlap
    print("Splitting text into chunks of 600 characters with 60 characters overlap...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=60,
        length_function=len
    )
    chunks = text_splitter.split_documents(pages)

    # Print statement showing how many chunks were created
    print(f"Total chunks created: {len(chunks)}")

    # 3. Turn the chunks into embeddings
    print("Generating embeddings using Google Generative AI (gemini-embedding-2-preview)...")
    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")

    # 4. Store them into a local Chroma database folder named as 'placement_db'
    db_folder = "./placement_db"
    print(f"Storing vector embeddings into local Chroma database: '{db_folder}'...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=db_folder
    )

    print(f"Ingestion complete! Chroma vector database successfully created at '{db_folder}'.")


if __name__ == "__main__":
    ingest()
