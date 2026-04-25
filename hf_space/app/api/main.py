from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import tempfile
import json

from app.api.models import ChatRequest, ChatResponse, ResolveTicketRequest
from app.rag.pdf_ingestor import PDFIngestor
from app.rag.chunker import TextChunker
from app.rag.vector_store import VectorStoreManager
from app.graph.builder import compiled_graph
from app.hitl.escalation import ESCALATION_FILE
from app.hitl.reviewer import resolve_escalation

app = FastAPI(title="RAG Support Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chunker = TextChunker()
vsm = VectorStoreManager()

@app.post("/upload")
async def upload_files(
    session_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
        all_chunks = []
        file_names = []
        for file in files:
            if not file.filename.endswith(".pdf"):
                continue
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name
                
            try:
                pages_data = PDFIngestor.process_pdf(tmp_path, session_id, file.filename)
                doc_chunks = chunker.chunk_documents(pages_data)
                all_chunks.extend(doc_chunks)
                file_names.append(file.filename)
            finally:
                os.unlink(tmp_path)
                
        if all_chunks:
            vsm.ingest_chunks(session_id, all_chunks)
            
        return {"message": f"Successfully indexed {len(all_chunks)} chunks from {len(file_names)} files.", "uploaded_files": file_names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear")
async def clear_workspace(session_id: str = Form(...)):
    try:
        vsm.clear_session(session_id)
        return {"message": "Workspace reset!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        initial_state = {
            "session_id": request.session_id,
            "user_query": request.query,
            "uploaded_files": request.uploaded_files,
            "retrieved_chunks": [],
            "sources": []
        }
        
        result_state = compiled_graph.invoke(initial_state)
        
        return ChatResponse(
            response=result_state.get("final_response", "Error generating response."),
            intent=result_state.get("intent", "N/A"),
            route=result_state.get("route", "N/A"),
            sources=result_state.get("sources", []),
            context_sufficient=result_state.get("context_sufficient", False),
            escalation_required=result_state.get("escalation_required", False)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hitl/tickets")
async def get_tickets():
    if not os.path.exists(ESCALATION_FILE):
        return {"tickets": []}
    try:
        with open(ESCALATION_FILE, "r") as f:
            tickets = json.load(f)
            return {"tickets": [t for t in tickets if t["status"] == "pending"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/hitl/resolve")
async def resolve_ticket(request: ResolveTicketRequest):
    try:
        resolve_escalation(request.ticket_id, request.resolution)
        return {"message": "Ticket Resolved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
