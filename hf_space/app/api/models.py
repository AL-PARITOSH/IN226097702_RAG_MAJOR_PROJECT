from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    session_id: str
    query: str
    uploaded_files: List[str]

class ChatResponse(BaseModel):
    response: str
    intent: str
    route: str
    sources: List[str]
    context_sufficient: bool
    escalation_required: bool

class ResolveTicketRequest(BaseModel):
    ticket_id: str
    resolution: str
