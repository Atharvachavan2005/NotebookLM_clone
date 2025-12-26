export interface Source {
  id: string;
  name: string;
  type: 'Document' | 'Website' | 'YouTube' | 'Audio' | 'Text';
  size?: string;
  chunks: number;
  uploadedAt: string;
  url?: string;
  videoId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface Citation {
  reference: string;
  sourceFile: string;
  pageNumber?: number;
  chunkId: string;
  content: string;
}

export interface PodcastScript {
  speaker: 'Speaker 1' | 'Speaker 2';
  text: string;
}

export interface Podcast {
  id: string;
  totalLines: number;
  estimatedDuration: string;
  script: PodcastScript[];
  audioUrl?: string;
  sourceName: string;
  style: PodcastStyle;
  createdAt: string;
}

export type PodcastStyle = 'conversational' | 'interview' | 'debate' | 'educational';

export type TabType = 'sources' | 'chat' | 'studio';
