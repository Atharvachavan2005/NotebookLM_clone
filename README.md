# 🧠 KnowledgeCast

Transform your documents into conversations. Turn your research into a show.

KnowledgeCast is an AI-powered knowledge management platform that ingests multiple data sources and enables intelligent Q&A with citations, plus automatic podcast generation.

## Features

- **Multi-source ingestion** — PDFs, websites, YouTube videos, audio files, text
- **RAG-powered chat** — Ask questions with cited, sourced answers
- **AI podcasts** — Generate multi-speaker discussions from your content
- **Memory layer** — Conversation history with knowledge graph support

## Tech Stack

| Component | Technology |
|-----------|------------|
| LLM | Google Gemini 2.5 Flash |
| Embeddings | FastEmbed |
| Vector DB | Milvus Lite |
| Transcription | AssemblyAI |
| Web Scraping | Firecrawl |
| TTS | EdgeTTS / Kokoro |
| Memory | Zep Cloud |
| Backend | FastAPI |
| Frontend | React + TypeScript + Tailwind |

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your API keys (at minimum GEMINI_API_KEY)
```

### 3. Run the API server

```bash
uvicorn api.main:app --reload --port 8000
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `ASSEMBLYAI_API_KEY` | No | For audio/video transcription |
| `FIRECRAWL_API_KEY` | No | For web scraping |
| `ZEP_API_KEY` | No | For conversation memory |

## Project Structure

```
├── api/                  # FastAPI backend
│   ├── main.py          # App entry point
│   ├── config.py        # Settings
│   ├── models.py        # Pydantic models
│   ├── sessions.py      # Session management
│   └── routes/          # API endpoints
├── src/                  # Core processing modules
│   ├── document_processing/
│   ├── embeddings/
│   ├── generation/
│   ├── podcast/
│   ├── vector_database/
│   └── ...
├── frontend/            # React frontend
└── app.py              # Streamlit app (alternative UI)
```

## API Endpoints

- `POST /api/upload` — Upload files
- `POST /api/scrape` — Scrape URLs
- `POST /api/youtube` — Process YouTube videos
- `POST /api/text` — Add text content
- `GET /api/sources` — List sources
- `POST /api/chat` — Ask questions
- `POST /api/podcast/generate` — Create podcast

Full API docs at `http://localhost:8000/docs`

## License

MIT
