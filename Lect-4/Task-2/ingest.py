import os
from dotenv import load_dotenv
load_dotenv()
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

def ingest_pdf():
    pdf_path = "DSA Tree.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: The file '{pdf_path}' was not found in the current directory.")
        return

    print(f"Loading PDF: {pdf_path}...")
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()
    
    print("Splitting text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len
    )
    chunks = text_splitter.split_documents(pages)
    print(f"Total number of chunks created: {len(chunks)}")
    
    print("Generating embeddings and storing them in the Chroma vector database...")
    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")
    
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="./db"
    )
    
    print("Success! Vector database has been saved locally in the 'db' folder.")

if __name__ == "__main__":
    ingest_pdf()