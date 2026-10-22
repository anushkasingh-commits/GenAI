import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Ensure GOOGLE_API_KEY is available if GEMINI_API_KEY is provided
if not os.getenv("GOOGLE_API_KEY") and os.getenv("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma


def format_docs(docs):
    """Format retrieved document chunks into a single string."""
    return "\n\n".join(doc.page_content for doc in docs)


def main():
    if not os.environ.get("GOOGLE_API_KEY"):
        print("Error: GOOGLE_API_KEY (or GEMINI_API_KEY) is not set.")
        print("Please configure your API key in the .env file.")
        return

    db_dir = "./placement_db"
    if not os.path.exists(db_dir):
        print(f"Error: Vector database folder '{db_dir}' does not exist.")
        print("Please run `python ingest.py` first to create the database.")
        return

    # 1. Load Chroma database from the placement_db folder
    print(f"Loading Chroma database from '{db_dir}'...")
    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")
    vectorstore = Chroma(persist_directory=db_dir, embedding_function=embeddings)

    # 2. Create retriever that fetches the top 4 most relevant chunks
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    # 3. Initialize chat model with fallback
    primary_llm = ChatGoogleGenerativeAI(model="gemini-3.8-flash", temperature=0.2, max_retries=1)
    fallback_llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2)
    llm = primary_llm.with_fallbacks([fallback_llm])

    # 4. Define prompt template
    template = """Answer the question based only on the following context:

{context}

Question: {question}

Answer:"""
    prompt = ChatPromptTemplate.from_template(template)

    # 5. Build the LangChain LCEL chain
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    print("\n--- Placement RAG Assistant Ready ---")
    print("(Type 'exit' or 'q' to quit)\n")

    # If question passed via CLI argument, answer it directly
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:]).strip()
        print(f"Question: {question}")
        print("\nThinking...")
        answer = chain.invoke(question)
        print("\n--- Answer ---")
        print(answer)
        return

    # Interactive loop in terminal
    while True:
        try:
            question = input("Enter your question: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

        if not question:
            continue

        if question.lower() in ["exit", "quit", "q"]:
            print("Goodbye!")
            break

        print("\nSearching relevant chunks and generating answer...")
        answer = chain.invoke(question)
        print("\n--- Answer ---")
        print(answer)
        print("\n" + "-" * 40 + "\n")


if __name__ == "__main__":
    main()
