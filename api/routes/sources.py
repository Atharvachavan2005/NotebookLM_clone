"""API route handlers for source ingestion."""

import os
import time
import logging
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from api.models import URLRequest, YouTubeRequest, TextRequest, SourceResponse
from api.sessions import session_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["sources"])


def create_source_response(name: str, source_type: str, size: str, chunks: int, **kwargs) -> dict:
    """Create a standardized source response."""
    import uuid
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "type": source_type,
        "size": size,
        "chunks": chunks,
        "uploaded_at": time.strftime("%Y-%m-%d %H:%M"),
        **kwargs
    }


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session_id: str = Form(None)
):
    """Upload and process a document or audio file."""
    session = session_manager.create(session_id)
    
    try:
        suffix = f".{file.filename.split('.')[-1]}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            temp_path = tmp_file.name
        
        # Determine file type and process
        is_audio = file.content_type and file.content_type.startswith('audio/')
        
        if is_audio:
            if not session.audio_transcriber:
                raise HTTPException(400, "Audio processing not available (missing ASSEMBLYAI_API_KEY)")
            chunks = session.audio_transcriber.transcribe_audio(temp_path)
            source_type = "Audio"
        else:
            chunks = session.doc_processor.process_document(temp_path)
            source_type = "Document"
        
        for chunk in chunks:
            chunk.source_file = file.filename
        
        embedded_chunks = session.embedding_generator.generate_embeddings(chunks)
        
        if len(session.sources) == 0:
            session.vector_db.create_index(use_binary_quantization=False)
        
        session.vector_db.insert_embeddings(embedded_chunks)
        
        source_info = create_source_response(
            name=file.filename,
            source_type=source_type,
            size=f"{len(content) / 1024:.1f} KB",
            chunks=len(chunks)
        )
        session.sources.append(source_info)
        
        os.unlink(temp_path)
        
        return {"success": True, "session_id": session.id, "source": source_info}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(500, str(e))


@router.post("/scrape")
async def scrape_urls(request: URLRequest, session_id: str = None):
    """Scrape and process web URLs."""
    session = session_manager.create(session_id)
    
    if not session.web_scraper:
        raise HTTPException(400, "Web scraping not available (missing FIRECRAWL_API_KEY)")
    
    processed = []
    
    for url in request.urls:
        try:
            chunks = session.web_scraper.scrape_url(url.strip())
            if not chunks:
                continue
            
            for chunk in chunks:
                chunk.source_file = url
            
            embedded_chunks = session.embedding_generator.generate_embeddings(chunks)
            
            if len(session.sources) == 0:
                session.vector_db.create_index(use_binary_quantization=False)
            
            session.vector_db.insert_embeddings(embedded_chunks)
            
            source_info = create_source_response(
                name=url,
                source_type="Website",
                size=f"{len(chunks)} chunks",
                chunks=len(chunks),
                url=url
            )
            session.sources.append(source_info)
            processed.append(source_info)
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
    
    return {"success": True, "session_id": session.id, "sources": processed}


@router.post("/youtube")
async def process_youtube(request: YouTubeRequest, session_id: str = None):
    """Process YouTube video."""
    session = session_manager.create(session_id)
    
    if not session.youtube_transcriber:
        raise HTTPException(400, "YouTube processing not available (missing ASSEMBLYAI_API_KEY)")
    
    try:
        transcriber = session.youtube_transcriber
        chunks = transcriber.transcribe_youtube_video(request.url, cleanup_audio=True)
        
        if not chunks:
            raise HTTPException(400, "No transcript extracted from video")
        
        video_id = transcriber.extract_video_id(request.url)
        video_name = f"YouTube Video {video_id}"
        
        for chunk in chunks:
            chunk.source_file = video_name
        
        embedded_chunks = session.embedding_generator.generate_embeddings(chunks)
        
        if len(session.sources) == 0:
            session.vector_db.create_index(use_binary_quantization=False)
        
        session.vector_db.insert_embeddings(embedded_chunks)
        
        source_info = create_source_response(
            name=video_name,
            source_type="YouTube",
            size=f"{len(chunks)} segments",
            chunks=len(chunks),
            url=request.url,
            video_id=video_id
        )
        session.sources.append(source_info)
        
        return {"success": True, "session_id": session.id, "source": source_info}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("YouTube processing failed")
        raise HTTPException(500, str(e))


@router.post("/text")
async def process_text(request: TextRequest, session_id: str = None):
    """Process pasted text."""
    session = session_manager.create(session_id)
    
    try:
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as tmp:
            tmp.write(request.content)
            temp_path = tmp.name
        
        chunks = session.doc_processor.process_document(temp_path)
        
        text_name = f"Text ({time.strftime('%H:%M')})"
        for chunk in chunks:
            chunk.source_file = text_name
        
        embedded_chunks = session.embedding_generator.generate_embeddings(chunks)
        
        if len(session.sources) == 0:
            session.vector_db.create_index(use_binary_quantization=False)
        
        session.vector_db.insert_embeddings(embedded_chunks)
        
        source_info = create_source_response(
            name=text_name,
            source_type="Text",
            size=f"{len(request.content)} chars",
            chunks=len(chunks)
        )
        session.sources.append(source_info)
        
        os.unlink(temp_path)
        
        return {"success": True, "session_id": session.id, "source": source_info}
        
    except Exception as e:
        logger.exception("Text processing failed")
        raise HTTPException(500, str(e))


@router.get("/sources")
async def get_sources(session_id: str):
    """Get all sources for a session."""
    session = session_manager.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    
    return {"sources": session.sources}


@router.delete("/sources/{source_name:path}")
async def delete_source(source_name: str, session_id: str):
    """Delete a source from session."""
    session = session_manager.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    
    original_count = len(session.sources)
    session.sources = [s for s in session.sources if s["name"] != source_name]
    
    if len(session.sources) == original_count:
        raise HTTPException(404, "Source not found")
    
    return {"success": True, "message": "Source removed"}
