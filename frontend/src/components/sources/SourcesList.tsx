import { File, Globe, Youtube, FileText, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { Source } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const typeIcons: Record<Source['type'], React.ReactNode> = {
  Document: <File className="w-4 h-4" />,
  Website: <Globe className="w-4 h-4" />,
  YouTube: <Youtube className="w-4 h-4" />,
  Audio: <Music className="w-4 h-4" />,
  Text: <FileText className="w-4 h-4" />,
};

const typeColors: Record<Source['type'], string> = {
  Document: 'text-primary bg-primary/10',
  Website: 'text-accent bg-accent/10',
  YouTube: 'text-destructive bg-destructive/10',
  Audio: 'text-purple-400 bg-purple-400/10',
  Text: 'text-warning bg-warning/10',
};

export function SourcesList() {
  const { sources, removeSource, sessionId } = useApp();

  const handleDelete = async (source: Source) => {
    try {
      await api.deleteSource(source.name, sessionId);
      removeSource(source.id);
      toast.success('Source removed');
    } catch {
      toast.error('Failed to remove source');
    }
  };

  if (sources.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <File className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-semibold text-foreground mb-2">No sources yet</h3>
        <p className="text-sm text-muted-foreground">
          Add documents, URLs, or other content to build your knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">
          Your Sources
        </h2>
        <span className="text-sm text-muted-foreground">
          {sources.length} source{sources.length !== 1 && 's'}
        </span>
      </div>
      
      <div className="space-y-2">
        {sources.map((source, index) => (
          <div
            key={source.id}
            className={cn(
              "glass-card p-4 animate-fade-in",
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                typeColors[source.type]
              )}>
                {typeIcons[source.type]}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate" title={source.name}>
                  {source.name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{source.type}</span>
                  {source.size && <span>{source.size}</span>}
                  <span>{source.chunks} chunks</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(source)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
