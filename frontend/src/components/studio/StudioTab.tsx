import { useState } from 'react';
import { PodcastConfig } from './PodcastConfig';
import { PodcastPlayer } from './PodcastPlayer';
import { Podcast } from '@/types';
import { Mic } from 'lucide-react';

export function StudioTab() {
  const [podcast, setPodcast] = useState<Podcast | null>(null);

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Podcast Studio
          </h2>
          <p className="text-muted-foreground">
            Transform your sources into an engaging podcast conversation
          </p>
        </div>
        
        <div className="space-y-6">
          <PodcastConfig onGenerate={setPodcast} />
          
          {podcast && <PodcastPlayer podcast={podcast} />}
        </div>
      </div>
    </div>
  );
}
