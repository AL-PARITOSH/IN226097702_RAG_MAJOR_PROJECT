# Dynamic RAG-Based Customer Support Assistant

A realistic AI customer support assistant powered by LangGraph, allowing users to upload specific PDFs dynamically at runtime and query them seamlessly using a context-aware Retrieval-Augmented Generation (RAG) system. No fixed local PDFs; everything is dynamic and workspace-isolated.

## Capabilities
- **Dynamic User Uploads**: Upload one or multiple PDFs at runtime.
- **Isolated Context Sessions**: Answers use only the currently active uploaded documents. ChromaDB collections are created dynamically per session ID.
- **LangGraph Orchestration**: Robust workflow routing (Input → Route/Intent → Retrieve Context → Evaluate → Generate/Clarify/Fallback/Escalate).
- **Trust-Aware Generation**: Fallback mechanisms prevent hallucinations outside of the uploaded contexts.
- **HITL Architecture**: Automated requests for clarification on vague inputs and structured escalation for complex/legal/billing issues. Features a mock Human Reviewer dashboard.
- **FastAPI + React GUI**: Fast backend APIs connected to a stunning modern React (Vite) interface with glassmorphism design.

## Folder Structure
```
project_root/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/ (FastAPI endpoints and models)
│   ├── graph/ (LangGraph Workflow logic)
│   ├── rag/ (Ingestor, Chunker, Vectors, Retrieval)
│   ├── llm/ (Generator, Prompts)
│   ├── hitl/ (Escalation simulation)
│   └── utils/
├── frontend/ (React Vite application)
├── uploads/
├── chroma_db/
├── .env.example
├── requirements.txt
└── README.md
```

## Setup & Run

1. **Install Backend Requirements:**
```bash
pip install -r requirements.txt
```

2. **Set Environment Variables:**
Copy `.env.example` to `.env` and assign your `GROQ_API_KEY` and `LANGCHAIN_API_KEY`:
```bash
cp .env.example .env
```

3. **Start the FastAPI Backend:**
```bash
python app/main.py
```
*(Runs on http://localhost:8000)*

4. **Start the React Frontend:**
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on http://localhost:5173)*

## BY A. PARITOSH
