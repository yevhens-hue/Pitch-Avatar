import { useSaraStore } from '../store/useSaraStore';
import { OutboundAction } from '../types/actions';

export function useSaraActions() {
  /**
   * Dispatches an OUTBOUND webhook/event to the Host App.
   * Universal implementation covering 3 integration methods:
   * 1. config.onAction callback
   * 2. window.parent.postMessage (for iframes)
   * 3. window.dispatchEvent (for script tags)
   */
  const dispatchAction = (action: OutboundAction) => {
    if (typeof window === 'undefined') return;

    console.log(`[Widget Outbound] Emitting action:`, action);
    const { config } = useSaraStore.getState();

    // 1. Callback
    if (config?.onAction) {
      config.onAction(action.type, action);
    }

    // 2. postMessage (Iframe)
    if (window.parent) {
      window.parent.postMessage({
        type: 'PITCH_AVATAR_ACTION',
        payload: { action: action.type, data: action }
      }, '*');
    }

    // 3. CustomEvent
    window.dispatchEvent(
      new CustomEvent('sara:action', {
        detail: action,
      })
    );
  };

  const startTour = (tourId: string) => {
    dispatchAction({ type: 'start_tour', tourId });
  };

  const navigateTo = (route: string) => {
    dispatchAction({ type: 'navigate', route });
  };

  return {
    dispatchAction,
    startTour,
    navigateTo,
  };
}
