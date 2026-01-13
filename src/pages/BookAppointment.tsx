import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceflowChat } from '@/components/VoiceflowChat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [chatCompleted, setChatCompleted] = useState(false);

  const handleChatComplete = () => {
    setChatCompleted(true);
    // After chat is complete, redirect to appointments list
    setTimeout(() => {
      navigate('/appointments');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Chat Interface */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out',
          chatCompleted
            ? 'opacity-0 scale-95'
            : 'opacity-100 scale-100'
        )}
      >
        <VoiceflowChat onChatComplete={handleChatComplete} />
      </div>

      {/* Completion Message */}
      {chatCompleted && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center animate-fade-in">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Appointment Booked!</h2>
            <p className="text-muted-foreground">Redirecting to your appointments...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
