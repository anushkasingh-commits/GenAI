from collections import defaultdict
import os
import pickle
import warnings

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()
warnings.filterwarnings("ignore", category=DeprecationWarning)

CHROMA_DIR = "./chroma_db"
CHUNKS_PATH = "./chunks.pkl"


def hit_rate_at_k(retrieved_ids, relevant_ids, k=5):
    """
    Checks whether at least one relevant document
    appears in the top K retrieved documents.
    """
    top_k = retrieved_ids[:k]
    return int(any(doc_id in relevant_ids for doc_id in top_k))


def get_retriever(method="hybrid"):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings,
    )

    if method == "mmr":
        return vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 5, "fetch_k": 15, "lambda_mult": 0.6},
        )

    if method == "threshold":
        return vector_store.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"score_threshold": 0.35, "k": 5},
        )

    if method == "hybrid":
        with open(CHUNKS_PATH, "rb") as f:
            chunks = pickle.load(f)

        bm25 = BM25Retriever.from_documents(chunks)
        bm25.k = 5
        vec = vector_store.as_retriever(search_kwargs={"k": 5})

        def hybrid_search(question):
            bm25_docs = bm25.invoke(question)
            vec_docs = vec.invoke(question)
            scores = defaultdict(float)
            doc_by_key = {}

            for docs, w in [(bm25_docs, 0.45), (vec_docs, 0.55)]:
                for rank, d in enumerate(docs, start=1):
                    key = d.metadata.get("chunk_id", d.page_content)
                    doc_by_key[key] = d
                    scores[key] += w / (60 + rank)

            ranked = sorted(scores, key=lambda k: scores[k], reverse=True)
            return [doc_by_key[k] for k in ranked[:5]]

        return hybrid_search

    raise ValueError(f"Unknown method: {method}")


def retrieve_as_dicts(retriever, question):
    docs = retriever(question) if callable(retriever) else retriever.invoke(question)
    return [
        {
            "id": d.metadata.get("chunk_id"),
            "text": d.page_content,
        }
        for d in docs
    ]


if __name__ == "__main__":
    # Run one method at a time: "hybrid", then "mmr", then "threshold"
    method_to_test = "hybrid"
    retriever = get_retriever(method=method_to_test)

    question = "What are graphs?"
    relevant_doc_ids = [0, 1]  # Replace with your actual relevant chunk IDs

    retrieved_docs = retrieve_as_dicts(retriever, question)
    retrieved_ids = [d["id"] for d in retrieved_docs]

    print(f"Method: {method_to_test}")
    print(f"Retrieved IDs: {retrieved_ids}")
    print(f"Hit@1 - {hit_rate_at_k(retrieved_ids, relevant_doc_ids, k=1)}")
    print(f"Hit@2 - {hit_rate_at_k(retrieved_ids, relevant_doc_ids, k=2)}")
    print(f"Hit@3 - {hit_rate_at_k(retrieved_ids, relevant_doc_ids, k=3)}")