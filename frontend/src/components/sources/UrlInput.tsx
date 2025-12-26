import { useState } from 'react';
import { Globe, ChevronDown, ChevronUp, Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

export function UrlInput() {
  const { addSource, sessionId } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [urls, setUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleScrape = async () => {
    const validUrls = urls.filter(url => url.trim());
    
    if (validUrls.length === 0) {
      toast.error('Please enter at least one URL');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.scrapeUrls(validUrls, sessionId);
      
      result.sources.forEach(source => {
        addSource({
          id: source.id,
          name: source.name,
          type: 'Website',
          chunks: source.chunks,
          uploadedAt: source.uploaded_at,
          url: source.url,
        });
      });

      toast.success(`Successfully scraped ${result.sources.length} URL(s)`);
      setUrls(['']);
      setIsExpanded(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Scraping failed';
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
          <div className="p-2 rounded-lg bg-accent/10">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground">Website URL</h3>
            <p className="text-xs text-muted-foreground">Scrape content from web pages</p>
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
        isExpanded ? "max-h-96" : "max-h-0"
      )}>
        <div className="p-4 pt-0 space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
              />
              {urls.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrlField(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={addUrlField}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add another URL
          </Button>
          
          <Button
            onClick={handleScrape}
            disabled={isLoading || urls.every(u => !u.trim())}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Scraping...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Scrape URLs
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
