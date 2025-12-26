import { useState } from 'react';
import { Youtube, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

export function YouTubeInput() {
  const { addSource, sessionId } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleProcess = async () => {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.processYouTube(url, sessionId);
      
      addSource({
        id: result.source.id,
        name: result.source.name,
        type: 'YouTube',
        chunks: result.source.chunks,
        uploadedAt: result.source.uploaded_at,
        url: result.source.url,
        videoId: result.source.video_id,
      });

      toast.success('YouTube video processed successfully');
      setUrl('');
      setIsExpanded(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Processing failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const videoId = extractVideoId(url);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Youtube className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">YouTube Video</h3>
            <p className="text-xs text-muted-foreground">Transcribe and process video content</p>
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
        isExpanded ? "max-h-[500px]" : "max-h-0"
      )}>
        <div className="p-4 pt-0 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleProcess}
              disabled={isLoading || !url.trim()}
              className="shrink-0 min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4 mr-2" />
                  Process Video
                </>
              )}
            </Button>
          </div>
          
          {videoId && (
            <div className="rounded-lg overflow-hidden aspect-video bg-secondary">
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
