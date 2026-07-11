# 🔍 Researcher AI Agent

![Researcher AI Agent](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal)
![Next.js](https://img.shields.io/badge/Next.js-16+-black)

**Researcher AI Agent** is a full-stack, AI-powered application designed to automate deep web research, summarize complex information, and present it in a highly professional and readable format. The system is built with a highly responsive Next.js frontend and a robust LangGraph-powered FastAPI backend.

---

## ✨ Key Features

- **Automated Web Research:** Uses the Tavily Search API to dynamically scrape and fetch the most relevant data.
- **Intelligent Synthesis:** Leverages state-of-the-art LLMs via LangChain to compile search results into authoritative, 5-point executive summaries.
- **Advanced State Management:** Implements LangGraph to manage complex routing, tool-calling loops, and final responses.
- **Built-in Guardrails:** Automatically intercepts and validates user queries to ensure safe, on-topic interactions before invoking the LLM.
- **Premium UI/UX:** A stunning, dark-mode Next.js frontend featuring:
  - Persistent chat history (Local Storage integration).
  - Inline chat renaming and deletion.
  - Responsive sidebar and capsule-style inputs.
  - Markdown rendering and syntax highlighting.

---

## 🏗 Architecture

### Backend (`/`)
Built with **FastAPI** and **LangGraph**, the backend operates as a stateful graph:
1. **Guardrail Node:** Validates the prompt using predefined guardrails.
2. **LLM Node (Tool Calling):** Decides if a web search is needed.
3. **Tools Node:** Executes Tavily API searches.
4. **Final LLM Node:** Synthesizes raw search results into a clean, markdown-formatted report.

### Frontend (`/frontend`)
Built with **Next.js (React)** and **Tailwind CSS**, providing a sleek, zero-hydration-mismatch UI. It talks to the FastAPI server via standard REST `POST` requests and manages conversational state elegantly.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.13+)
- Tavily API Key

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AymanKhan2244/ResearcherAIAgent.git
   cd ResearcherAIAgent
   ```

2. **Set up the Python environment:**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Mac/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirement.txt
   ```

4. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at `http://127.0.0.1:8000`.*

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   *The UI will be available at `http://localhost:3000`.*

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, React Markdown
- **Backend:** FastAPI, Python, Uvicorn
- **AI/Agents:** LangChain, LangGraph
- **Search API:** Tavily
- **Data Validation:** Pydantic

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/AymanKhan2244/ResearcherAIAgent/issues).

## 📝 License
This project is open-source and available under the MIT License.
