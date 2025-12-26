"""Session management for the API."""

import uuid
import time
import logging
from typing import Any
from dataclasses import dataclass, field

from api.config import settings

logger = logging.getLogger(__name__)


@dataclass
class Session:
    """Represents an active user session with all initialized components."""
    
    id: str
    created_at: float = field(default_factory=time.time)
    sources: list[dict] = field(default_factory=list)
    last_podcast_audio: str | None = None
    
    # Components (initialized lazily)
    _doc_processor: Any = None
    _embedding_generator: Any = None
    _vector_db: Any = None
    _rag_generator: Any = None
    _audio_transcriber: Any = None
    _youtube_transcriber: Any = None
    _web_scraper: Any = None
    _podcast_script_generator: Any = None
    _podcast_tts_generator: Any = None
    _memory: Any = None
    _initialized: bool = False
    
    def initialize(self) -> None:
        """Initialize all session components."""
        if self._initialized:
            return
            
        from src.document_processing.doc_processor import DocumentProcessor
        from src.embeddings.embedding_generator import EmbeddingGenerator
        from src.vector_database.milvus_vector_db import MilvusVectorDB
        from src.generation.rag import RAGGenerator
        
        logger.info(f"Initializing session: {self.id}")
        
        self._doc_processor = DocumentProcessor()
        self._embedding_generator = EmbeddingGenerator()
        self._vector_db = MilvusVectorDB(
            db_path=f"./data/milvus_{self.id[:8]}.db",
            collection_name=f"collection_{self.id[:8]}"
        )
        
        self._rag_generator = RAGGenerator(
            embedding_generator=self._embedding_generator,
            vector_db=self._vector_db,
            gemini_api_key=settings.GEMINI_API_KEY
        )
        
        # Optional components
        if settings.has_audio_processing:
            from src.audio_processing.audio_transcriber import AudioTranscriber
            from src.audio_processing.youtube_transcriber import YouTubeTranscriber
            self._audio_transcriber = AudioTranscriber(settings.ASSEMBLYAI_API_KEY)
            self._youtube_transcriber = YouTubeTranscriber(settings.ASSEMBLYAI_API_KEY)
        
        if settings.has_web_scraping:
            from src.web_scraping.web_scraper import WebScraper
            self._web_scraper = WebScraper(settings.FIRECRAWL_API_KEY)
        
        if settings.GEMINI_API_KEY:
            from src.podcast.script_generator import PodcastScriptGenerator
            self._podcast_script_generator = PodcastScriptGenerator(settings.GEMINI_API_KEY)
            
            try:
                from src.podcast.text_to_speech import PodcastTTSGenerator
                self._podcast_tts_generator = PodcastTTSGenerator()
            except ImportError:
                logger.warning("TTS not available")
        
        if settings.has_memory:
            from src.memory.memory_layer import NotebookMemoryLayer
            self._memory = NotebookMemoryLayer(
                user_id="api_user",
                session_id=self.id,
                create_new_session=True
            )
        
        self._initialized = True
        logger.info(f"Session {self.id} initialized successfully")
    
    @property
    def doc_processor(self):
        if not self._initialized:
            self.initialize()
        return self._doc_processor
    
    @property
    def embedding_generator(self):
        if not self._initialized:
            self.initialize()
        return self._embedding_generator
    
    @property
    def vector_db(self):
        if not self._initialized:
            self.initialize()
        return self._vector_db
    
    @property
    def rag_generator(self):
        if not self._initialized:
            self.initialize()
        return self._rag_generator
    
    @property
    def audio_transcriber(self):
        if not self._initialized:
            self.initialize()
        return self._audio_transcriber
    
    @property
    def youtube_transcriber(self):
        if not self._initialized:
            self.initialize()
        return self._youtube_transcriber
    
    @property
    def web_scraper(self):
        if not self._initialized:
            self.initialize()
        return self._web_scraper
    
    @property
    def podcast_script_generator(self):
        if not self._initialized:
            self.initialize()
        return self._podcast_script_generator
    
    @property
    def podcast_tts_generator(self):
        if not self._initialized:
            self.initialize()
        return self._podcast_tts_generator
    
    @property
    def memory(self):
        if not self._initialized:
            self.initialize()
        return self._memory


class SessionManager:
    """Manages active sessions."""
    
    def __init__(self):
        self._sessions: dict[str, Session] = {}
    
    def create(self, session_id: str | None = None) -> Session:
        """Create a new session or return existing one."""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        if session_id not in self._sessions:
            self._sessions[session_id] = Session(id=session_id)
        
        return self._sessions[session_id]
    
    def get(self, session_id: str) -> Session | None:
        """Get an existing session."""
        return self._sessions.get(session_id)
    
    def delete(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False
    
    def cleanup_old_sessions(self, max_age_hours: int = 24) -> int:
        """Remove sessions older than max_age_hours."""
        cutoff = time.time() - (max_age_hours * 3600)
        old_sessions = [
            sid for sid, session in self._sessions.items()
            if session.created_at < cutoff
        ]
        for sid in old_sessions:
            del self._sessions[sid]
        return len(old_sessions)


# Global session manager
session_manager = SessionManager()
