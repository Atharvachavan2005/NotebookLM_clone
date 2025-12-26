import Snowfall from 'react-snowfall';
import { Header } from '@/components/layout/Header';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { Footer } from '@/components/layout/Footer';
import { SourcesTab } from '@/components/sources/SourcesTab';
import { ChatTab } from '@/components/chat/ChatTab';
import { StudioTab } from '@/components/studio/StudioTab';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Snowfall effect */}
      <Snowfall 
        snowflakeCount={150}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: 50,
          pointerEvents: 'none',
        }}
        color="rgba(255, 255, 255, 0.6)"
        radius={[0.5, 2.5]}
        speed={[0.5, 2]}
        wind={[-0.5, 1]}
      />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <TabNavigation />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'sources' && <SourcesTab />}
          {activeTab === 'chat' && <ChatTab />}
          {activeTab === 'studio' && <StudioTab />}
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
