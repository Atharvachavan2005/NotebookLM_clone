import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

export function TextInput() {
  const { addSource, sessionId } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProcess = async () => {
    if (!content.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.processText(content, sessionId);
      
      addSource({
        id: result.source.id,
        name: result.source.name,
        type: 'Text',
        size: result.source.size,
        chunks: result.source.chunks,
        uploadedAt: result.source.uploaded_at,
      });

      toast.success('Text processed successfully');
      setContent('');
      setIsExpanded(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Processing failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <FileText className="w-5 h-5 text-warning" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Paste Text</h3>
            <p className="text-xs text-muted-foreground">Add content directly</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-80" : "max-h-0"
      )}>
        <div className="p-4 pt-0 space-y-3">
          <Textarea
            placeholder="Paste your text content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          
          <Button
            onClick={handleProcess}
            disabled={isLoading || !content.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Process Text
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
