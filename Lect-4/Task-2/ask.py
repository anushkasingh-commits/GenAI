import os
from dotenv import load_dotenv
load_dotenv()
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def main():
    # Ensure the API key environment variable is available
    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY environment variable is not set.")
        return

    # 1. Load the Chroma database from the 'db' folder using the same embedding model
    print("Loading Chroma vector database...")
    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")
    vectorstore = Chroma(persist_directory="./db", embedding_function=embeddings)

    # 2. Create a retriever that fetches the top 3 most relevant chunks
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    # 3. Initialize the Chat Model (Updated to gemini-3.8-flash)
    llm = ChatGoogleGenerativeAI(model="gemini-3.8-flash", temperature=0.2)

    # 4. Define the prompt template for context and question
    template = """Answer the question based exclusively on the following context:
{context}

Question: {question}
"""
    prompt = ChatPromptTemplate.from_template(template)

    # Helper function to format retrieved chunks into a single text block
    # Helper function to format retrieved chunks into a single text block
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # 5. Build the LangChain LCEL chain with explicit prompt passing
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # 6. Allow typing a question in the terminal
    print("\n--- RAG System Ready ---")
    question = input("Enter your question: ").strip()
    
    if not question:
        print("No question provided. Exiting.")
        return

    print("\nRetrieving relevant chunks and generating answer...")
    answer = chain.invoke(question)
    
    print("\n--- Answer ---")
    print(answer)

if __name__ == "__main__":
    main()