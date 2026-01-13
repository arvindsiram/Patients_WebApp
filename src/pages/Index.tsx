import { useState } from 'react';
import { VoiceflowChat } from '@/components/VoiceflowChat';
import { Dashboard } from '@/components/Dashboard';
import { cn } from '@/lib/utils';

type ViewState = 'chat' | 'dashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('chat');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChatComplete = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('dashboard');
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToChat = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('chat');
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="relative min-h-screen">
      {/* Chat View */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300 ease-in-out',
          currentView === 'chat' && !isTransitioning
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        )}
      >
        <VoiceflowChat onChatComplete={handleChatComplete} />
      </div>

      {/* Dashboard View */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-300 ease-in-out',
          currentView === 'dashboard' && !isTransitioning
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8 pointer-events-none'
        )}
      >
        <Dashboard onLogout={handleBackToChat} />
      </div>
    </div>
  );
};

export default Index;
