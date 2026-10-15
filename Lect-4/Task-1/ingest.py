import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

def ingest_pdf():
    # Specify your PDF file name
    pdf_path = "DSA Tree.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"Error: The file '{pdf_path}' was not found in the current directory.")
        return

    # 1. Load the PDF file using PyPDFLoader
    print(f"Loading PDF: {pdf_path}...")
    loader = PyPDFLoader(pdf_path)
    pages = loader.load()
    
    # 2. Split the document into chunks of 500 characters with 50 characters of overlap
    print("Splitting text into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len
    )
    chunks = text_splitter.split_documents(pages)
    
    # Print statement showing how many chunks were created
    print(f"Total number of chunks created: {len(chunks)}")
    
    # 3. Create embeddings and store them in a local Chroma vector database folder called 'db'
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