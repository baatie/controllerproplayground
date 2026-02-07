import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { BusinessProfile } from '../types';
import { encode, decode, decodeAudioData } from '../services/geminiService';

interface LiveAssistantProps {
  businessContext: BusinessProfile;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ businessContext }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    // Fix: Always use process.env.API_KEY directly in the constructor
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live Assistant Connected');
            setIsConnecting(false);
            setIsActive(true);

            // Audio Stream Input
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Fix: Solely rely on sessionPromise resolves and then call session.sendRealtimeInput
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
              );
              
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              
              const now = outputAudioContext.currentTime;
              const startTime = Math.max(now, nextStartTimeRef.current);
              
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
              sourcesRef.current.add(source);
              
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are a financial assistant for a business controller. 
          The current business profile is ${businessContext.name}. 
          Help with questions about invoices, expenses, and budgets. Keep responses professional and concise.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live API:', err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      // Fix: Call close() on the session to terminate connection
      sessionRef.current.close?.();
    }
    setIsActive(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all shadow-md ${
          isActive 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        <span>{isActive ? 'Live (Listening...)' : isConnecting ? 'Connecting...' : 'Live Assistant'}</span>
      </button>
      
      {isActive && (
        <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-2xl p-4 border border-indigo-100 z-40">
           <div className="flex items-center space-x-2 mb-2">
             <div className="flex space-x-1">
               <div className="w-1 h-3 bg-indigo-400 animate-bounce"></div>
               <div className="w-1 h-5 bg-indigo-500 animate-bounce" style={{animationDelay: '0.1s'}}></div>
               <div className="w-1 h-4 bg-indigo-600 animate-bounce" style={{animationDelay: '0.2s'}}></div>
             </div>
             <span className="text-xs font-bold text-indigo-600 uppercase">Voice Active</span>
           </div>
           <p className="text-xs text-slate-500">Ask: "What's my net profit this month?" or "Review my AWS expenses."</p>
        </div>
      )}
    </div>
  );
};

export default LiveAssistant;