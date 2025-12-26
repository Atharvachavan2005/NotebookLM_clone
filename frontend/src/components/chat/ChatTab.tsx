import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

export function ChatTab() {
  const { messages, addMessage, clearMessages, sources, sessionId } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (sources.length === 0) {
      toast.error('Please add at least one source first');
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const result = await api.chat(input, sessionId);
      
      const citations = result.sources_used.map(source => ({
        reference: source.reference,
        sourceFile: source.source_file,
        pageNumber: source.page_number,
        chunkId: source.chunk_id,
        content: source.content,
      }));

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toLocaleTimeString(),
        citations,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to get response';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetChat(sessionId);
      clearMessages();
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to reset chat');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col max-w-4xl">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">
                  Start a Conversation
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Ask questions about your uploaded sources. I'll provide answers with citations.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "animate-fade-in",
                  message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "glass-card"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.citations.map((citation, i) => (
                          <span
                            key={i}
                            className="citation-pill"
                            title={citation.content}
                          >
                            [{citation.reference}]
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <span className="text-xs opacity-50 mt-2 block">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="glass-card p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your sources..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
              {messages.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
