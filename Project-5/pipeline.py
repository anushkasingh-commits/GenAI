"""
pipeline.py

The steps that turn a PDF into something we can search:

    1. Read    - pull the text out of the PDF
    2. Upload  - save the PDF file on the server
    3. Clean   - remove junk (extra spaces, page numbers, broken words)
    4. Split   - split the text into sentences
    5. Chunk   - group sentences into small pieces (chunks)
    6. Embed   - turn each chunk into a list of numbers (a "vector")
    7. Store   - save the vectors in a vector database (ChromaDB)
"""

import io
import os
import re

UPLOAD_FOLDER = "uploads"
CHROMA_FOLDER = "chroma_db"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_MAX_CHARS = 600      # a chunk is about this long at most
CHUNK_OVERLAP_CHARS = 120  # chunks share a little text so no idea gets cut in half

# These are created the first time we need them, then reused.
_embedding_model = None
_chroma_client = None


# ---------- STEP 1: READ ----------
def read_pdf(pdf_bytes):
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(pdf_bytes))
    page_texts = []
    for page in reader.pages:
        page_texts.append(page.extract_text() or "")
    return "\n\n".join(page_texts)


# ---------- STEP 2: UPLOAD (save the file) ----------
def save_pdf(pdf_bytes, doc_id):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    path = os.path.join(UPLOAD_FOLDER, doc_id + ".pdf")
    with open(path, "wb") as file:
        file.write(pdf_bytes)
    return path


# ---------- STEP 3: CLEAN ----------
def clean_text(raw_text):
    text = raw_text.replace("\r", "\n")

    # Remove strange invisible characters, keep normal text and line breaks
    text = "".join(ch for ch in text if ch.isprintable() or ch == "\n")

    # Join words that were split with a hyphen at the end of a line ("infor-\nmation")
    text = re.sub(r"-\n(\w)", r"\1", text)

    # Remove lines that only contain a page number
    text = re.sub(r"\n[ \t]*\d+[ \t]*\n", "\n", text)

    # Squash extra spaces inside each paragraph, keep paragraph breaks
    paragraphs = []
    for block in re.split(r"\n\s*\n", text):
        cleaned = " ".join(block.split())
        if cleaned:
            paragraphs.append(cleaned)
    return "\n\n".join(paragraphs)


# ---------- STEP 4: SPLIT (into sentences) ----------
def split_into_sentences(text):
    sentences = []
    for paragraph in text.split("\n\n"):
        # A sentence ends with . ! or ? followed by a space
        parts = re.split(r"(?<=[.!?])\s+", paragraph)
        for part in parts:
            if part.strip() != "":
                sentences.append(part.strip())
    return sentences


# ---------- STEP 5: CHUNK (group sentences) ----------
def make_chunks(sentences):
    chunks = []
    current = []         # sentences in the chunk we are building
    current_length = 0

    for sentence in sentences:
        # If adding this sentence makes the chunk too long, save the chunk first
        if current and current_length + len(sentence) > CHUNK_MAX_CHARS:
            chunks.append(" ".join(current))

            # Keep the last few sentences so the next chunk starts with some overlap
            carry = []
            carry_length = 0
            for old_sentence in reversed(current):
                if carry_length + len(old_sentence) > CHUNK_OVERLAP_CHARS:
                    break
                carry.insert(0, old_sentence)
                carry_length += len(old_sentence)
            current = carry
            current_length = carry_length

        current.append(sentence)
        current_length += len(sentence)

    if current:
        chunks.append(" ".join(current))
    return chunks


# ---------- STEP 6: EMBED (text -> numbers) ----------
def embed_texts(texts):
    global _embedding_model
    if _embedding_model is None:
        # The first run downloads the model (about 90 MB)
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    vectors = _embedding_model.encode(texts)
    return vectors.tolist()


# ---------- STEP 7: STORE (vector database) ----------
def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        import chromadb
        _chroma_client = chromadb.PersistentClient(path=CHROMA_FOLDER)
    return _chroma_client


def store_chunks(doc_id, chunks, vectors):
    client = get_chroma_client()
    # Each uploaded PDF gets its own collection (like a table) named by its doc_id
    collection = client.get_or_create_collection(name=doc_id)
    ids = [doc_id + "_" + str(i) for i in range(len(chunks))]
    metadatas = [{"chunk_index": i} for i in range(len(chunks))]
    collection.add(ids=ids, documents=chunks, embeddings=vectors, metadatas=metadatas)


# ---------- ASKING: find the chunks closest to the question ----------
def find_relevant_chunks(doc_id, question, how_many=4):
    client = get_chroma_client()
    collection = client.get_collection(name=doc_id)
    question_vector = embed_texts([question])[0]
    results = collection.query(
        query_embeddings=[question_vector],
        n_results=min(how_many, collection.count()),
    )
    return results["documents"][0]


# ---------- RUN ALL STEPS ----------
def process_pdf(pdf_bytes, doc_id):
    steps = []

    raw_text = read_pdf(pdf_bytes)
    if raw_text.strip() == "":
        raise ValueError("No text was found in this PDF. It may be a scanned image.")
    steps.append({"name": "Read", "detail": "Found " + str(len(raw_text)) + " characters of text"})

    save_pdf(pdf_bytes, doc_id)
    steps.append({"name": "Upload", "detail": "Saved the PDF on the server"})

    clean = clean_text(raw_text)
    steps.append({"name": "Clean", "detail": "Cleaned text is " + str(len(clean)) + " characters"})

    sentences = split_into_sentences(clean)
    steps.append({"name": "Split", "detail": "Split into " + str(len(sentences)) + " sentences"})

    chunks = make_chunks(sentences)
    if not chunks:
        raise ValueError("The PDF did not contain readable sentences.")
    steps.append({"name": "Chunk", "detail": "Made " + str(len(chunks)) + " chunks"})

    vectors = embed_texts(chunks)
    steps.append({"name": "Embed", "detail": "Turned each chunk into a vector of numbers"})

    store_chunks(doc_id, chunks, vectors)
    steps.append({"name": "Vector database", "detail": "Stored all chunks in ChromaDB"})

    return {"doc_id": doc_id, "steps": steps}
