"""Pydantic models for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional


class URLRequest(BaseModel):
    """Request model for URL scraping."""
    urls: list[str] = Field(..., min_length=1)


class YouTubeRequest(BaseModel):
    """Request model for YouTube processing."""
    url: str = Field(..., pattern=r"^https?://.*youtube.*|^https?://youtu\.be/.*")


class TextRequest(BaseModel):
    """Request model for text processing."""
    content: str = Field(..., min_length=10)


class ChatRequest(BaseModel):
    """Request model for chat queries."""
    query: str = Field(..., min_length=1)
    session_id: str


class ChatResetRequest(BaseModel):
    """Request model for chat reset."""
    session_id: str


class PodcastRequest(BaseModel):
    """Request model for podcast generation."""
    source_name: str
    style: str = Field(default="conversational", pattern="^(conversational|interview|debate|educational)$")
    duration: str = Field(default="10 minutes")


class SourceResponse(BaseModel):
    """Response model for a single source."""
    id: str
    name: str
    type: str
    size: str
    chunks: int
    uploaded_at: str
    url: Optional[str] = None
    video_id: Optional[str] = None


class CitationResponse(BaseModel):
    """Response model for a citation."""
    reference: str
    source_file: str
    page_number: Optional[int] = None
    chunk_id: str
    content: str


class ChatResponse(BaseModel):
    """Response model for chat queries."""
    response: str
    sources_used: list[CitationResponse]


class PodcastScriptLine(BaseModel):
    """A single line in the podcast script."""
    speaker: str
    text: str


class PodcastResponse(BaseModel):
    """Response model for generated podcast."""
    id: str
    total_lines: int
    estimated_duration: str
    script: list[dict]
    audio_url: Optional[str] = None
    source_name: str
    style: str
