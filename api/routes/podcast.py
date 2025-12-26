"""API route handlers for podcast generation."""

import os
import uuid
import time
import logging
import tempfile
from pathlib import Path
from dataclasses import dataclass

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from api.models import PodcastRequest, PodcastResponse
from api.sessions import session_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["podcast"])


@dataclass
class ChunkLike:
    """Simple class to match expected chunk interface."""
    content: str


@router.post("/podcast/generate", response_model=PodcastResponse)
async def generate_podcast(request: PodcastRequest, session_id: str = None):
    """Generate podcast from source."""
    if not session_id:
        raise HTTPException(400, "Session ID is required")
    
    session = session_manager.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    
    if not session.podcast_script_generator:
        raise HTTPException(400, "Podcast generation not available (missing GEMINI_API_KEY)")
    
    # Find source
    source_info = next(
        (s for s in session.sources if s["name"] == request.source_name),
        None
    )
    if not source_info:
        raise HTTPException(404, f"Source '{request.source_name}' not found")
    
    try:
        # Retrieve content from vector DB
        query_embedding = session.embedding_generator.generate_query_embedding(
            f"content from {request.source_name}"
        )
        search_results = session.vector_db.search(
            query_embedding,
            limit=50,
            filter_expr=f'source_file == "{request.source_name}"'
        )
        
        if not search_results:
            raise HTTPException(400, "No content found for this source")
        
        search_results.sort(key=lambda x: x.get('chunk_index', 0))
        
        # Generate script
        script_gen = session.podcast_script_generator
        
        if source_info["type"] == "Website":
            chunks = [ChunkLike(content=r['content']) for r in search_results]
            podcast_script = script_gen.generate_script_from_website(
                website_chunks=chunks,
                source_url=request.source_name,
                podcast_style=request.style.lower(),
                target_duration=request.duration
            )
        else:
            combined = "\n\n".join([r['content'] for r in search_results])
            podcast_script = script_gen.generate_script_from_text(
                text_content=combined,
                source_name=request.source_name,
                podcast_style=request.style.lower(),
                target_duration=request.duration
            )
        
        # Generate audio if TTS available
        audio_url = None
        tts = session.podcast_tts_generator
        
        if tts:
            try:
                temp_dir = tempfile.mkdtemp(prefix="podcast_")
                audio_files = tts.generate_podcast_audio(
                    podcast_script=podcast_script,
                    output_dir=temp_dir,
                    combine_audio=True
                )
                
                for audio_file in audio_files:
                    if "complete_podcast" in Path(audio_file).name:
                        session.last_podcast_audio = audio_file
                        audio_url = f"/api/podcast/audio/{session.id}"
                        break
                        
            except Exception as e:
                logger.error(f"Audio generation failed: {e}")
        
        return PodcastResponse(
            id=str(uuid.uuid4()),
            total_lines=podcast_script.total_lines,
            estimated_duration=podcast_script.estimated_duration,
            script=podcast_script.script,
            audio_url=audio_url,
            source_name=request.source_name,
            style=request.style
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Podcast generation failed")
        raise HTTPException(500, str(e))


@router.get("/podcast/audio/{session_id}")
async def download_podcast_audio(session_id: str):
    """Download generated podcast audio."""
    session = session_manager.get(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    
    if not session.last_podcast_audio or not os.path.exists(session.last_podcast_audio):
        raise HTTPException(404, "Audio file not found. Generate a podcast first.")
    
    return FileResponse(
        session.last_podcast_audio,
        media_type="audio/wav",
        filename=f"podcast_{int(time.time())}.wav"
    )
