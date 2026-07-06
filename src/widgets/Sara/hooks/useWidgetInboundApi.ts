import { useEffect } from 'react';
import { useSaraStore } from '../store/useSaraStore';
import { dispatchSaraEvent } from './useSaraEventDetector';

// Define the shape of the global window object
declare global {
  interface Window {
    PitchAvatar?: {
      triggerEvent: (eventName: string, payload?: any) => void;
      updateContext: (context: Record<string, unknown>) => void;
      setConfig: (config: Record<string, unknown>) => void;
    };
  }
}

export function useWidgetInboundApi() {
  const setHostContext = useSaraStore((state) => state.setHostContext);
  const setConfig = useSaraStore((state) => state.setConfig);

  useEffect(() => {
    // 1. Initialize Global Object API (window.PitchAvatar)
    if (typeof window !== 'undefined') {
      window.PitchAvatar = {
        triggerEvent: (eventName: string, payload?: any) => {
          console.log('[PitchAvatar Widget] Received global event:', eventName, payload);
          // Dispatch to the internal event detector
          dispatchSaraEvent(eventName, payload);
        },
        updateContext: (context: Record<string, unknown>) => {
          console.log('[PitchAvatar Widget] Updating host context:', context);
          setHostContext(context);
        },
        setConfig: (config: Record<string, unknown>) => {
          console.log('[PitchAvatar Widget] Updating config:', config);
          setConfig(config);
        }
      };
    }

    // 2. Initialize postMessage listener (for Iframe / Cross-origin)
    const handleMessage = (event: MessageEvent) => {
      // In production, you might want to verify event.origin here
      const data = event.data;
      if (data && data.type === 'PITCH_AVATAR_EVENT') {
        const payload = data.payload || {};
        const action = payload.action;

        console.log('[PitchAvatar Widget] Received postMessage:', action, payload);

        switch (action) {
          case 'triggerEvent':
            if (payload.eventName) {
              dispatchSaraEvent(payload.eventName, payload.data);
            }
            break;
          case 'updateContext':
            if (payload.context) {
              setHostContext(payload.context);
            }
            break;
          case 'setConfig':
            if (payload.config) {
              setConfig(payload.config);
            }
            break;
          default:
            console.warn('[PitchAvatar Widget] Unknown action via postMessage:', action);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (typeof window !== 'undefined') {
        delete window.PitchAvatar;
      }
    };
  }, [setHostContext, setConfig]);
}
