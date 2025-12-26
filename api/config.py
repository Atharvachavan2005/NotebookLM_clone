"""API configuration and settings."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment."""
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # API Keys
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    ASSEMBLYAI_API_KEY: str | None = os.getenv("ASSEMBLYAI_API_KEY")
    FIRECRAWL_API_KEY: str | None = os.getenv("FIRECRAWL_API_KEY")
    ZEP_API_KEY: str | None = os.getenv("ZEP_API_KEY")
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    OUTPUTS_DIR: Path = BASE_DIR / "outputs"
    
    @property
    def has_audio_processing(self) -> bool:
        return bool(self.ASSEMBLYAI_API_KEY)
    
    @property
    def has_web_scraping(self) -> bool:
        return bool(self.FIRECRAWL_API_KEY)
    
    @property
    def has_memory(self) -> bool:
        return bool(self.ZEP_API_KEY)


settings = Settings()
