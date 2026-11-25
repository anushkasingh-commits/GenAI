"""
app.py

The web server. It has two jobs:
    /upload  - receive a PDF and run all the pipeline steps
    /ask     - receive a question and answer it using the stored PDF
"""

import os
import uuid

from flask import Flask, render_template, request, jsonify
from pipeline import process_pdf, find_relevant_chunks

app = Flask(__name__)


@app.route("/")
def home():
    # Shows the web page (templates/index.html)
    return render_template("index.html")


@app.route("/upload", methods=["POST"])
def upload():
    uploaded = request.files.get("pdf")
    if uploaded is None or not uploaded.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Please choose a .pdf file."}), 400

    doc_id = "doc_" + uuid.uuid4().hex
    pdf_bytes = uploaded.read()

    try:
        result = process_pdf(pdf_bytes, doc_id)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    return jsonify(result)


@app.route("/ask", methods=["POST"])
def ask():
    body = request.get_json()
    doc_id = body.get("doc_id", "")
    question = body.get("question", "").strip()

    if question == "":
        return jsonify({"error": "Please type a question."}), 400

    try:
        passages = find_relevant_chunks(doc_id, question)
    except Exception:
        return jsonify({"error": "Could not find that PDF. Please upload it again."}), 404

    answer = make_answer(question, passages)
    return jsonify({"answer": answer, "sources": passages})


def make_answer(question, passages):
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    # Without an API key we cannot write a full answer,
    # so we just show the most relevant parts of the PDF.
    if not api_key:
        return ("No ANTHROPIC_API_KEY is set, so I can't write a full answer yet. "
                "Below are the parts of your PDF that match your question best.")

    from anthropic import Anthropic
    client = Anthropic(api_key=api_key)

    passage_text = "\n\n".join("[Passage " + str(i + 1) + "]\n" + p for i, p in enumerate(passages))
    prompt = ("Answer the question using only the passages below. "
              "If the answer is not in the passages, say you don't know.\n\n"
              "Passages:\n" + passage_text + "\n\nQuestion: " + question)

    response = client.messages.create(
        model=os.environ.get("ANTHROPIC_MODEL", "claude-haiku-5-5"),
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


if __name__ == "__main__":
    app.run(debug=True)
