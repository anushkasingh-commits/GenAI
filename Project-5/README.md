# PDF Question Answerer

Upload a PDF, then ask questions about it.

## What happens when you upload a PDF
1. **Read** - the text is pulled out of the PDF
2. **Upload** - the PDF is saved on the server
3. **Clean** - extra spaces, page numbers and broken words are fixed
4. **Split** - the text is split into sentences
5. **Chunk** - sentences are grouped into small pieces
6. **Embed** - each chunk becomes a list of numbers (a vector)
7. **Vector database** - the vectors are stored in ChromaDB

When you ask a question, it is turned into a vector too, and the closest chunks are found.

## Files
- `pipeline.py` - all the steps above
- `app.py` - the web server (`/upload` and `/ask`)
- `templates/index.html` - the web page
- `requirements.txt` - the libraries to install

## Run it
```bash
python -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Then open http://127.0.0.1:5000 in your browser.

The first upload downloads the embedding model (about 90 MB), so it is slow once.

## Optional: full answers from Claude
Without an API key, the site shows the most relevant parts of your PDF.
To get a written answer, set your key first:
```bash
export ANTHROPIC_API_KEY=your_key_here        # Windows: set ANTHROPIC_API_KEY=your_key_here
```
