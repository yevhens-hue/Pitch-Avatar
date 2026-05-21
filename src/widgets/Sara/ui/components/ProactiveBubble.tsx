import React, { useEffect } from 'react';
import { useSaraStore } from '../../store/useSaraStore';
import { setGlobalMute } from '../../lib/cooldown';
import { X } from 'lucide-react';
import { useSaraActions } from '../../hooks/useSaraActions';

export default function ProactiveBubble() {
  const proactiveTrigger = useSaraStore((state) => state.proactiveTrigger);
  const setProactiveTrigger = useSaraStore((state) => state.setProactiveTrigger);
  const toggleChat = useSaraStore((state) => state.toggleChat);
  const { startTour } = useSaraActions();

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!proactiveTrigger) return;
    const timer = setTimeout(() => {
      setProactiveTrigger(null);
    }, 15000);
    return () => clearTimeout(timer);
  }, [proactiveTrigger, setProactiveTrigger]);

  if (!proactiveTrigger) return null;

  const handleDismiss = () => {
    setGlobalMute(1); // Mute for 1 hour on manual dismiss
    setProactiveTrigger(null);
  };

  const handleAction = () => {
    const action = proactiveTrigger?.content?.action;
    setProactiveTrigger(null);
    toggleChat();
    
    if (action?.type === 'start_tour' && action.tourId) {
      startTour(action.tourId);
    }
    // For 'open_chat', toggleChat is enough for now (prefill would be handled via store in a full implementation)
  };

  return (
    <div 
      className="absolute bottom-full right-0 mb-4 w-72 bg-white rounded-2xl shadow-xl border border-indigo-100 p-4 transform transition-all animate-in fade-in slide-in-from-bottom-4"
      style={{ zIndex: 50 }}
    >
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 font-bold text-sm">S</span>
        </div>
        <div>
          <p className="text-sm text-slate-700 leading-snug pr-4">
            {proactiveTrigger.content.message}
          </p>
          <button
            onClick={handleAction}
            className="mt-3 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full transition-colors"
          >
            {proactiveTrigger.content.ctaLabel}
          </button>
        </div>
      </div>
      
      {/* Small triangle pointer */}
      <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-indigo-100 transform rotate-45"></div>
    </div>
  );
}
