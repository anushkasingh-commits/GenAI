import os
import warnings
from dotenv import load_dotenv

# Suppress deprecation warnings
warnings.filterwarnings("ignore")

# Load environment variables
load_dotenv()

# Ensure GOOGLE_API_KEY is available if GEMINI_API_KEY is provided
if not os.getenv("GOOGLE_API_KEY") and os.getenv("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# LangChain components
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

try:
    from langchain_chroma import Chroma
except ImportError:
    from langchain_community.vectorstores import Chroma

# Initialize FastAPI app
app = FastAPI(
    title="Placement RAG API",
    description="FastAPI service wrapping LangChain RAG with conversation memory over placement_db",
    version="1.0.0"
)

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Initialize RAG & Memory Chain Components ---
db_dir = "./placement_db"
if not os.path.exists(db_dir):
    print(f"[WARNING] Database directory '{db_dir}' does not exist. Ensure ingest.py was run.")

embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")
vectorstore = Chroma(persist_directory=db_dir, embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# Chat Model with fallback
primary_llm = ChatGoogleGenerativeAI(model="gemini-3.8-flash", temperature=0.2, max_retries=1)
fallback_llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2)
llm = primary_llm.with_fallbacks([fallback_llm])

def format_docs(docs):
    """Format retrieved document chunks into a single text block."""
    return "\n\n".join(doc.page_content for doc in docs)

# Prompt with chat history placeholder for memory
prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer the question based only on the following context:\n\n{context}"),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

# RAG chain
rag_chain = (
    RunnablePassthrough.assign(
        context=lambda x: format_docs(retriever.invoke(x["question"]))
    )
    | prompt
    | llm
    | StrOutputParser()
)

# In-memory store for session histories
session_history_store = {}

def get_session_history(session_id: str):
    if session_id not in session_history_store:
        session_history_store[session_id] = InMemoryChatMessageHistory()
    return session_history_store[session_id]

# Chain wrapped with conversation memory
chain_with_memory = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="chat_history",
)


# --- Request and Response Schemas ---
class QueryRequest(BaseModel):
    question: Optional[str] = None
    query: Optional[str] = None
    session_id: Optional[str] = "default"


class QueryResponse(BaseModel):
    question: str
    answer: str
    session_id: str


# --- API Endpoints ---
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Placement RAG API",
        "endpoint": "/query"
    }


@app.post("/query", response_model=QueryResponse)
def query_endpoint(payload: QueryRequest):
    """
    Exposes an endpoint /query that takes a question,
    runs it through the existing RAG + memory chain, and returns a JSON response.
    """
    user_question = payload.question or payload.query
    if not user_question or not user_question.strip():
        raise HTTPException(status_code=400, detail="A 'question' or 'query' field is required.")

    session_id = payload.session_id or "default"

    try:
        print(f"\n[SERVER] Session '{session_id}' | Received question: {user_question}")
        answer = chain_with_memory.invoke(
            {"question": user_question.strip()},
            config={"configurable": {"session_id": session_id}}
        )
        print(f"[SERVER] Generated answer: {answer[:60]}...")

        return QueryResponse(
            question=user_question.strip(),
            answer=answer,
            session_id=session_id
        )

    except Exception as e:
        print(f"[SERVER ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Also support /ask as an alias
@app.post("/ask", response_model=QueryResponse)
def ask_alias(payload: QueryRequest):
    return query_endpoint(payload)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting server on http://localhost:{port}...")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
