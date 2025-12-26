import { FolderPlus, MessageSquare, Mic } from 'lucide-react';
import { TabType } from '@/types';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'sources', label: 'Add Sources', icon: <FolderPlus className="w-4 h-4" /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'studio', label: 'Studio', icon: <Mic className="w-4 h-4" /> },
];

export function TabNavigation() {
  const { activeTab, setActiveTab, sources } = useApp();

  return (
    <nav className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 relative",
                "hover:text-slate-200",
                activeTab === tab.id
                  ? "text-purple-400"
                  : "text-slate-400"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'sources' && sources.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">
                  {sources.length}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
