import { useState } from 'react';
import { Mic, MessageSquare, Mic2, Scale, BookOpen, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { PodcastStyle, Podcast, PodcastScript } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';

const styles: { id: PodcastStyle; label: string; icon: React.ReactNode }[] = [
  { id: 'conversational', label: 'Conversational', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'interview', label: 'Interview', icon: <Mic2 className="w-4 h-4" /> },
  { id: 'debate', label: 'Debate', icon: <Scale className="w-4 h-4" /> },
  { id: 'educational', label: 'Educational', icon: <BookOpen className="w-4 h-4" /> },
];

const durations = ['5 minutes', '10 minutes', '15 minutes', '20 minutes'];

interface PodcastConfigProps {
  onGenerate: (podcast: Podcast) => void;
}

export function PodcastConfig({ onGenerate }: PodcastConfigProps) {
  const { sources, sessionId } = useApp();
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<PodcastStyle>('conversational');
  const [selectedDuration, setSelectedDuration] = useState('10 minutes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');

  const handleGenerate = async () => {
    if (!selectedSource) {
      toast.error('Please select a source');
      return;
    }

    const source = sources.find(s => s.id === selectedSource);
    if (!source) {
      toast.error('Source not found');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressStep('Generating podcast...');

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 90));
      }, 1000);

      const result = await api.generatePodcast(
        source.name,
        selectedStyle,
        selectedDuration,
        sessionId
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Parse script from API response
      const script: PodcastScript[] = result.script.map(line => {
        const [speaker, text] = Object.entries(line)[0];
        return {
          speaker: speaker as 'Speaker 1' | 'Speaker 2',
          text: text as string,
        };
      });

      const podcast: Podcast = {
        id: result.id,
        totalLines: result.total_lines,
        estimatedDuration: result.estimated_duration,
        sourceName: result.source_name,
        style: result.style as PodcastStyle,
        createdAt: new Date().toLocaleString(),
        script,
        audioUrl: result.audio_url ? api.getPodcastAudioUrl(sessionId) : undefined,
      };

      onGenerate(podcast);
      toast.success('Podcast generated successfully!');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to generate podcast';
      toast.error(message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setProgressStep('');
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          Podcast Configuration
        </h3>
      </div>

      {/* Source Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Select Source</label>
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          disabled={sources.length === 0}
        >
          <option value="">
            {sources.length === 0 ? 'No sources available' : 'Choose a source...'}
          </option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name} ({source.type})
            </option>
          ))}
        </select>
      </div>

      {/* Style Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Podcast Style</label>
        <div className="grid grid-cols-2 gap-2">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg border transition-all",
                selectedStyle === style.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {style.icon}
              <span className="text-sm">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Duration
        </label>
        <div className="flex gap-2 flex-wrap">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-all",
                selectedDuration === duration
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {duration}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !selectedSource}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            {progressStep || 'Generating...'}
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Generate Podcast
          </>
        )}
      </Button>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">{progress}%</p>
        </div>
      )}
    </div>
  );
}
