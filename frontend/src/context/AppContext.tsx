import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Source, ChatMessage, TabType } from '@/types';

interface AppContextType {
  // Session
  sessionId: string;
  
  // Sources
  sources: Source[];
  addSource: (source: Source) => void;
  removeSource: (id: string) => void;
  
  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  
  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState(() => generateSessionId());
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('sources');

  const addSource = useCallback((source: Source) => {
    setSources(prev => [...prev, source]);
  }, []);

  const removeSource = useCallback((id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        sessionId,
        sources,
        addSource,
        removeSource,
        messages,
        addMessage,
        clearMessages,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
