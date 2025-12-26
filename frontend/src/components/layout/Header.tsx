import { Sparkles, Podcast } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-800/30 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 via-violet-500/20 to-cyan-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10">
              <Podcast className="w-8 h-8 text-purple-400" />
            </div>
            <Sparkles className="w-4 h-4 text-cyan-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              KnowledgeCast
            </h1>
            <p className="text-xs text-slate-400">
              Transform documents into podcasts with AI ✨
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
