import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface VoiceflowChatProps {
  onChatComplete: () => void;
}

declare global {
  interface Window {
    voiceflow?: {
      chat: {
        load: (config: {
          verify: { projectID: string };
          url?: string;
          versionID?: string;
          voice?: { url: string };
          assistant?: {
            extensions?: Array<{
              name: string;
              type: 'response' | 'effect';
              match: (params: { trace: { type: string; payload?: { name?: string } } }) => boolean;
              render?: (params: { trace: unknown; element: HTMLElement }) => void;
              effect?: (params: { trace: unknown }) => Promise<void> | void;
            }>;
          };
        }) => void;
        interact: (options: { type: string; payload?: unknown }) => void;
        onEnd?: (callback: () => void) => void;
      };
    };
  }
}

export function VoiceflowChat({ onChatComplete }: VoiceflowChatProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
    script.async = true;

    script.onload = () => {
      if (window.voiceflow?.chat) {
        window.voiceflow.chat.load({
          verify: { projectID: '6965131c801bdbafb7f40e5b' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          assistant: {
            extensions: [
              {
                name: 'ext_darkForm',
                type: 'response',
                match: ({ trace }) => {
                  // Log trace for debugging
                  console.log('🔍 Checking trace:', trace);
                  
                  // Check multiple possible trace formats based on Voiceflow documentation
                  // Format 1: trace.type === 'Custom_Form' or custom action name
                  // Format 2: trace.payload?.name === 'ext_darkForm'
                  // Format 3: trace.type === 'ext_darkForm'
                  const isMatch = 
                    trace.type === 'ext_darkForm' ||
                    trace.type === 'Custom_Form' ||
                    (trace.payload as any)?.name === 'ext_darkForm' ||
                    (trace.payload as any)?.name === 'Custom_Form';
                  
                  if (isMatch) {
                    console.log("✅ Form Match Confirmed", trace);
                  }
                  return isMatch;
                },
                render: ({ trace, element }) => {
                  console.log('🎨 Rendering form extension', { trace, element });
                  
                  // Prevent duplicate forms if the trace repeats
                  if (element.querySelector('.med-form')) {
                    console.log('⚠️ Form already exists, skipping render');
                    return;
                  }
                
                  const formContainer = document.createElement('div');
                  // Use inline styles to bypass any widget-level CSS hiding unknown elements
                  formContainer.style.cssText = "width: 100%; display: block !important; padding: 15px; background: #1a1a1a; border-radius: 10px; border: 1px solid #333;";
                
                  formContainer.innerHTML = `
                    <div class="med-form" style="display: flex; flex-direction: column; gap: 10px;">
                      <h3 style="color: #4dabf7; margin-bottom: 5px; font-size: 16px;">Patient Intake</h3>
                      <input type="text" id="n" placeholder="Name" required style="padding: 10px; background: #222; color: white; border: 1px solid #444; border-radius: 5px;">
                      <input type="email" id="e" placeholder="Email" required style="padding: 10px; background: #222; color: white; border: 1px solid #444; border-radius: 5px;">
                      <input type="tel" id="p" placeholder="Phone Number" required pattern="[0-9\\+\\-\\(\\)\\s]+" title="Please enter a valid phone number" style="padding: 10px; background: #222; color: white; border: 1px solid #444; border-radius: 5px;">
                      <textarea id="s" placeholder="Symptoms" style="padding: 10px; background: #222; color: white; border: 1px solid #444; border-radius: 5px; min-height: 60px;"></textarea>
                      <label style="font-size: 11px; color: #888;">Health Report (Optional)</label>
                      <input type="file" id="f" style="color: #888; font-size: 12px;">
                      <button id="sub" style="padding: 12px; background: #007bff; color: white; font-weight: bold; border: none; border-radius: 5px; cursor: pointer; margin-top: 5px;">Submit Information</button>
                    </div>
                  `;
                
                  formContainer.querySelector('#sub')?.addEventListener('click', async () => {
                    const nameInput = formContainer.querySelector('#n') as HTMLInputElement;
                    const emailInput = formContainer.querySelector('#e') as HTMLInputElement;
                    const phoneInput = formContainer.querySelector('#p') as HTMLInputElement;
                    const symptomsInput = formContainer.querySelector('#s') as HTMLTextAreaElement;
                    const fileInput = formContainer.querySelector('#f') as HTMLInputElement;
                    
                    // Validate required fields
                    if (!nameInput.value.trim()) {
                      nameInput.style.borderColor = '#ff4444';
                      return;
                    }
                    if (!emailInput.value.trim() || !emailInput.checkValidity()) {
                      emailInput.style.borderColor = '#ff4444';
                      return;
                    }
                    if (!phoneInput.value.trim() || !phoneInput.checkValidity()) {
                      phoneInput.style.borderColor = '#ff4444';
                      return;
                    }
                    
                    // Reset border colors
                    nameInput.style.borderColor = '#444';
                    emailInput.style.borderColor = '#444';
                    phoneInput.style.borderColor = '#444';
                    
                    let fileBase64 = null;
                
                    if (fileInput?.files?.[0]) {
                      fileBase64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(fileInput.files![0]);
                      });
                    }
                
                    // Send data back to Voiceflow variables
                    window.voiceflow?.chat.interact({
                      type: 'correct', // Ensure this matches your Voiceflow Path Name
                      payload: { 
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim(),
                        phone_number: phoneInput.value.trim(),
                        symptoms: symptomsInput.value.trim(),
                        reportFile: fileBase64 
                      }
                    });
                    
                    formContainer.innerHTML = "<p style='color: #4dabf7; text-align: center; padding: 20px;'>✓ Form Submitted Successfully</p>";
                  });
                
                  element.appendChild(formContainer);
                  console.log('✅ Form rendered successfully');
                },
              }
            ],
          },
        });

        // Listen for chat completion
        if (window.voiceflow.chat.onEnd) {
          window.voiceflow.chat.onEnd(() => {
            onChatComplete();
          });
        }
      }
    };

    document.head.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      // Cleanup: remove script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      scriptLoaded.current = false;
    };
  }, [onChatComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Welcome to HealthCare Dashboard
          </h1>
          <p className="text-muted-foreground">
            Please complete the chatbot conversation to access your appointments
          </p>
        </div>

        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8 shadow-lg">
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-6">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Voiceflow Chatbot
            </h2>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              The Voiceflow chat widget should appear here. 
              Complete the chatbot conversation to proceed.
            </p>
            
            {/* Temporary button for development - remove when Voiceflow is integrated */}
            <Button 
              onClick={onChatComplete}
              className="mt-4"
              size="lg"
            >
              Skip to Dashboard (Dev Only)
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your data is secure and protected under HIPAA guidelines
        </p>
      </div>
    </div>
  );
}
