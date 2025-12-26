const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, error.detail || error.message || 'Request failed');
  }
  return response.json();
}

export const api = {
  /**
   * Upload a file for processing
   */
  async uploadFile(file: File, sessionId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    return handleResponse<{
      success: boolean;
      session_id: string;
      source: {
        id: string;
        name: string;
        type: string;
        size: string;
        chunks: number;
        uploaded_at: string;
      };
    }>(response);
  },

  /**
   * Scrape URLs for content
   */
  async scrapeUrls(urls: string[], sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/scrape?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    return handleResponse<{
      success: boolean;
      session_id: string;
      sources: Array<{
        id: string;
        name: string;
        type: string;
        size: string;
        chunks: number;
        uploaded_at: string;
        url?: string;
      }>;
    }>(response);
  },

  /**
   * Process YouTube video
   */
  async processYouTube(url: string, sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/youtube?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    return handleResponse<{
      success: boolean;
      session_id: string;
      source: {
        id: string;
        name: string;
        type: string;
        size: string;
        chunks: number;
        uploaded_at: string;
        url?: string;
        video_id?: string;
      };
    }>(response);
  },

  /**
   * Process text content
   */
  async processText(content: string, sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/text?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    return handleResponse<{
      success: boolean;
      session_id: string;
      source: {
        id: string;
        name: string;
        type: string;
        size: string;
        chunks: number;
        uploaded_at: string;
      };
    }>(response);
  },

  /**
   * Get all sources for session
   */
  async getSources(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/sources?session_id=${sessionId}`);
    return handleResponse<{
      sources: Array<{
        id: string;
        name: string;
        type: string;
        size: string;
        chunks: number;
        uploaded_at: string;
        url?: string;
        video_id?: string;
      }>;
    }>(response);
  },

  /**
   * Delete a source
   */
  async deleteSource(sourceName: string, sessionId: string) {
    const response = await fetch(
      `${API_BASE_URL}/api/sources/${encodeURIComponent(sourceName)}?session_id=${sessionId}`,
      { method: 'DELETE' }
    );
    return handleResponse<{ success: boolean; message: string }>(response);
  },

  /**
   * Send chat message and get response
   */
  async chat(query: string, sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, session_id: sessionId }),
    });

    return handleResponse<{
      response: string;
      sources_used: Array<{
        reference: string;
        source_file: string;
        page_number?: number;
        chunk_id: string;
        content: string;
      }>;
    }>(response);
  },

  /**
   * Reset chat session
   */
  async resetChat(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/chat/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });

    return handleResponse<{ success: boolean; new_session_id: string }>(response);
  },

  /**
   * Generate podcast from source
   */
  async generatePodcast(sourceName: string, style: string, duration: string, sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/api/podcast/generate?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_name: sourceName,
        style,
        duration,
      }),
    });

    return handleResponse<{
      id: string;
      total_lines: number;
      estimated_duration: string;
      script: Array<{ [key: string]: string }>;
      audio_url?: string;
      source_name: string;
      style: string;
    }>(response);
  },

  /**
   * Get podcast audio URL
   */
  getPodcastAudioUrl(sessionId: string) {
    return `${API_BASE_URL}/api/podcast/audio/${sessionId}`;
  },

  /**
   * Health check
   */
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string }>(response);
  },
};

export { ApiError };
