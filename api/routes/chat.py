"""API route handlers for chat functionality."""

import logging
from fastapi import APIRouter, HTTPException

from api.models import ChatRequest, ChatResetRequest, ChatResponse, CitationResponse
from api.sessions import session_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process chat query with RAG."""
    session = session_manager.get(request.session_id)
    if not session:
        raise HTTPException(404, "Session not found. Please refresh and try again.")
    
    if not session.sources:
        raise HTTPException(400, "No sources available. Please add sources first.")
    
    try:
        result = session.rag_generator.generate_response(request.query)
        
        if session.memory:
            try:
                session.memory.save_conversation_turn(result)
            except Exception as e:
                logger.warning(f"Failed to save to memory: {e}")
        
        # Format citations
        citations = []
        for source in result.sources_used:
            citations.append(CitationResponse(
                reference=source.get("reference", ""),
                source_file=source.get("source_file", "Unknown"),
                page_number=source.get("page_number"),
                chunk_id=source.get("chunk_id", ""),
                content=source.get("content", "")[:500]  # Limit content length
            ))
        
        return ChatResponse(response=result.response, sources_used=citations)
        
    except Exception as e:
        logger.exception("Chat query failed")
        raise HTTPException(500, f"Failed to generate response: {str(e)}")


@router.post("/chat/reset")
async def reset_chat(request: ChatResetRequest):
    """Reset chat session."""
    session = session_manager.get(request.session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    
    if session.memory:
        try:
            session.memory.clear_session()
        except Exception as e:
            logger.warning(f"Could not clear memory: {e}")
    
    import uuid
    new_session_id = str(uuid.uuid4())
    
    return {"success": True, "new_session_id": new_session_id}
