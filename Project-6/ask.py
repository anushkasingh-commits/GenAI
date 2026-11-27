from collections import defaultdict
import os
import pickle
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

CHROMA_DIR = "./chroma_db"
CHUNKS_PATH = "./chunks.pkl"


def format_docs(docs):
    formatted = []
    for d in docs:
        page = d.metadata.get("page_display", d.metadata.get("page", "?"))
        formatted.append(f"[page {page}] {d.page_content}")
    return "\n\n".join(formatted)


def build_rag_chain():
    if not os.path.exists(CHROMA_DIR) or not os.path.exists(CHUNKS_PATH):
        raise FileNotFoundError(
            "Missing ./chroma_db or chunks.pkl. Run 'python ingest.py' first."
        )

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vector_store = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
    )
    vector_retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    with open(CHUNKS_PATH, "rb") as f:
        chunks = pickle.load(f)

    bm25_retriever = BM25Retriever.from_documents(chunks)
    bm25_retriever.k = 5

    def hybrid_retrieve(question: str, weights=(0.45, 0.55), rrf_k=60, top_n=6):
        bm25_docs = bm25_retriever.invoke(question)
        vec_docs = vector_retriever.invoke(question)

        scores = defaultdict(float)
        doc_by_key = {}

        for retriever_docs, w in [(bm25_docs, weights[0]), (vec_docs, weights[1])]:
            for rank, doc in enumerate(retriever_docs, start=1):
                key = doc.metadata.get("chunk_id", doc.page_content)
                doc_by_key[key] = doc
                scores[key] += w / (rrf_k + rank)

        ranked_keys = sorted(
            scores.keys(), key=lambda k: scores[k], reverse=True
        )
        return [doc_by_key[k] for k in ranked_keys[:top_n]]

    hybrid_retriever = RunnableLambda(hybrid_retrieve)

    model = ChatGoogleGenerativeAI(model="gemini-3.6-flash", temperature=0)

    rag_prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a helpful study assistant for Graph Algorithms and Competitive Programming. "
            "Answer using ONLY the provided context. Cite page numbers like [page 12]. "
            "If the context does not contain enough information to answer, say 'I do not know based on the provided notes.'",
        ),
        ("human", "Context:\n{context}\n\nQuestion: {question}"),
    ])

    rag_chain = (
        {
            "context": hybrid_retriever | format_docs,
            "question": RunnablePassthrough(),
        }
        | rag_prompt
        | model
        | StrOutputParser()
    )

    return rag_chain


def main():
    print("Initializing Hybrid RAG Graph Assistant...")
    chain = build_rag_chain()
    print("Ready! Ask a question about graphs (type 'exit' or 'quit' to stop).\n")

    while True:
        try:
            question = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

        if not question:
            continue
        if question.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break

        answer = chain.invoke(question)
        print(f"\nAssistant:\n{answer}\n")
        print("-" * 50)


if __name__ == "__main__":
    main()