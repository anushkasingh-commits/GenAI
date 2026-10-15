# 🎓 Anushka's Personal AI Tutor

A lightweight, beginner-friendly personal AI learning assistant powered by the Google Gemini API. Built with vanilla HTML, CSS, and JavaScript.

---

## ✨ Features

- **Personalized for Anushka**: 
  - Knows your name and greets you naturally upon starting a conversation:
    > *"Hi, Anushka! 👋 How can I help you today?"*
  - Avoids repeating unnecessary greetings in subsequent messages.

- **Two Special Response Modes**:
  1. **⚡ One-Word / Very Short Mode**:
     - Keeps responses extremely concise when direct factual or yes/no questions are asked.
     - *Example:* User: `"Is C++ compiled?"` &rarr; Tutor: `"Yes"`
  2. **📊 JSON Mode**:
     - Returns strict, valid JSON objects without markdown backtick wrapping when requested.
     - *Example:*
       ```json
       {
         "answer": "Binary search works on sorted data.",
         "complexity": "O(log n)"
       }
       ```

- **Natural Chitchat & Everyday Conversations**:
  - Handles greetings, check-ins, jokes, and daily pleasantries naturally (`"Hi"`, `"How are you?"`, `"Tell me a joke"`, `"Thanks"`, `"Bye"`).

- **Student-Friendly Learning Focus**:
  - Covers Programming (Python, JavaScript, C++, etc.), DSA, Web Development, AI/ML, and Computer Science fundamentals.
  - Explanations are intuitive and simple with beginner-friendly analogies.

- **Client-Side Gemini API Key Management**:
  - Enter and save your Gemini API key securely in your browser's session/local storage.
  - Live **Test Connection** button to verify key validity.
  - No API keys are hard-coded in the source code.
  - Easily switch between models (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`).

- **Modern Glassmorphism UI**:
  - Dark & Light mode toggle with smooth transitions.
  - Quick-action suggestion chips for rapid testing.
  - Markdown formatting & syntax-highlighted code blocks with a **1-click Copy Code** button.
  - Responsive design that works on desktop, tablet, and mobile.

---

## 📁 Project Architecture

The project is intentionally designed with a simple, modular structure that is easy to understand, explain, and extend:

```text
Lect-3/
├── index.html         # Clean, accessible semantic HTML5 layout & modal dialog
├── css/
│   └── styles.css     # CSS design tokens, glassmorphism, responsive styles
├── js/
│   ├── storage.js     # Manages API key persistence and user preferences
│   ├── gemini.js      # Gemini REST API service & system instructions
│   └── app.js         # Chat UI interactions, markdown rendering, & event handlers
└── README.md          # Project documentation and guide
```

---

## 🚀 How to Run Locally

Because this project uses standard web technologies, there are no build steps or heavy dependencies required!

### Option 1: Python Built-in Server (Recommended)
Open your terminal in the project directory and run:

```bash
# Python 3
python3 -m http.server 8000
```
Then open your browser and navigate to:
[http://localhost:8000](http://localhost:8000)

### Option 2: Node / npx serve
```bash
npx -y serve .
```

### Option 3: VS Code / IDE Live Server
If using VS Code or Antigravity IDE, right-click `index.html` and select **"Open with Live Server"**.

---

## 🔑 Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key**.
4. In the AI Tutor UI, click the **🔑 API Key** button in the top right, paste your key, and click **Save & Start Learning**.

---

## 🧪 Testing the Tutor's Capabilities

| Test Case | Sample Prompt | Expected Output Behavior |
| :--- | :--- | :--- |
| **Greeting** | `"Hi!"` | Natural greeting recognizing Anushka |
| **Short Answer** | `"Is C++ compiled?"` | `"Yes"` |
| **JSON Mode** | `"Summarize Binary Search in JSON with answer and complexity"` | Raw parsable JSON object only |
| **Chitchat** | `"Tell me a programming joke"` | Short, funny programming joke |
| **Learning** | `"Explain recursion in simple terms"` | Student-friendly explanation with analogy |

---

## 💡 How the System Prompt Works

The system prompt in `js/gemini.js` encodes the core rules:
- Identifies the student as **Anushka**.
- Directs concise answers for yes/no and one-word questions.
- Instructs plain valid JSON output when JSON mode is triggered.
- Sets a supportive, student-friendly tone for computer science concepts.
