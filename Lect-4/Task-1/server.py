import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import LangChain components
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

app = FastAPI(title="RAG + Memory API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG components once when the server starts
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview")
vectorstore = Chroma(persist_directory="./db", embedding_function=embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

llm = ChatGoogleGenerativeAI(model="gemini-3.8-flash", temperature=0.2)

template = """Answer the question based exclusively on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Build the LCEL chain
chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

@app.post("/ask", response_model=AskResponse)
def ask_endpoint(payload: AskRequest):
    try:
        user_question = payload.question
        print(f"\n[SERVER] Received question: {user_question}")
        
        if not user_question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty.")

        print("[SERVER] Invoking RAG chain...")
        answer = chain.invoke(user_question)
        print(f"[SERVER] Generated answer successfully: {answer[:50]}...")

        return AskResponse(answer=answer)

    except Exception as e:
        print(f"[SERVER ERROR] {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))