import logging
import os
import time
from typing import List,Dict,Any, Optional
from dataclasses import dataclass
from pathlib import Path
import json
import assemblyai as aai
from src.document_processing.doc_processor import DocumentChunk

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)

@dataclass
class SpeakerSegment:
    """Represents a speaker segment with timing and content"""
    speaker:str
    start_time:float
    end_time:float
    text:str
    confidence:float

    def get_timestamp_str(self)