"""
KnowledgeCast API Server

FastAPI backend for the KnowledgeCast knowledge management platform.
Run with: uvicorn api.main:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import settings
from api.routes import sources_router, chat_router, podcast_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting KnowledgeCast API...")
    logger.info(f"Audio processing: {'enabled' if settings.has_audio_processing else 'disabled'}")
    logger.info(f"Web scraping: {'enabled' if settings.has_web_scraping else 'disabled'}")
    logger.info(f"Memory layer: {'enabled' if settings.has_memory else 'disabled'}")
    yield
    logger.info("Shutting down KnowledgeCast API...")


app = FastAPI(
    title="KnowledgeCast API",
    description="AI-powered knowledge management and podcast generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(sources_router)
app.include_router(chat_router)
app.include_router(podcast_router)


@app.get("/")
async def root():
    """API health check and info."""
    return {
        "name": "KnowledgeCast API",
        "version": "1.0.0",
        "status": "healthy",
        "features": {
            "audio_processing": settings.has_audio_processing,
            "web_scraping": settings.has_web_scraping,
            "memory": settings.has_memory
        }
    }


@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}
