import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, FileText, User, ChevronDown, ChevronUp, Hash, Clock, Volume2, VolumeX } from 'lucide-react';
import { Podcast } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PodcastPlayerProps {
  podcast: Podcast;
}

export function PodcastPlayer({ podcast }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScript, setShowScript] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Audio playback failed:', err);
        toast.error('Failed to play audio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownloadAudio = () => {
    if (podcast.audioUrl) {
      const a = document.createElement('a');
      a.href = podcast.audioUrl;
      a.download = `podcast-${podcast.id.slice(0, 8)}.wav`;
      a.click();
      toast.success('Audio download started');
    } else {
      toast.error('No audio available to download');
    }
  };

  const handleDownloadScript = () => {
    const data = JSON.stringify(podcast.script, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-script-${podcast.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Script downloaded');
  };

  return (
    <div className="glass-card-elevated overflow-hidden animate-slide-up">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold text-foreground">
            <Hash className="w-5 h-5 text-primary" />
            {podcast.totalLines}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Dialogue Lines</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold text-foreground">
            <Clock className="w-5 h-5 text-accent" />
            {podcast.estimatedDuration}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Duration</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-display font-bold text-foreground truncate px-2" title={podcast.sourceName}>
            {podcast.sourceName.slice(0, 15)}{podcast.sourceName.length > 15 && '...'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Source</p>
        </div>
      </div>

      {/* Audio Player */}
      <div className="p-6 space-y-4">
        {/* Hidden audio element */}
        {podcast.audioUrl && (
          <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />
        )}

        <div className="flex items-center gap-4">
          <Button
            size="icon"
            variant="success"
            className="w-14 h-14 rounded-full shrink-0"
            onClick={togglePlayPause}
            disabled={!podcast.audioUrl}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
          
          {/* Progress bar */}
          <div className="flex-1 space-y-1">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-accent"
              disabled={!podcast.audioUrl}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="shrink-0"
            disabled={!podcast.audioUrl}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          
          <Button variant="outline" onClick={handleDownloadAudio} disabled={!podcast.audioUrl}>
            <Download className="w-4 h-4 mr-2" />
            WAV
          </Button>
        </div>

        {/* Script Toggle */}
        <button
          onClick={() => setShowScript(!showScript)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="w-4 h-4" />
            Podcast Script
          </span>
          {showScript ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Script Viewer */}
        {showScript && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {podcast.script.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-xl animate-fade-in",
                  line.speaker === 'Speaker 1' ? "speaker-1-bubble" : "speaker-2-bubble"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{line.speaker}</span>
                </div>
                <p className="text-sm opacity-90">{line.text}</p>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDownloadScript}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Script (JSON)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
