// This hook now just dispatches events. 
// It simulates the Outbound Webhook behavior of the Universal Widget.

export function useSaraActions() {
  /**
   * Dispatches an OUTBOUND webhook/event to the Host App.
   * The Widget itself does not know HOW to start a tour or navigate,
   * it just tells the Host App what action the AI suggested.
   */
  const dispatchAction = (actionType: string, payload: any) => {
    if (typeof window !== 'undefined') {
      console.log(`[Widget Outbound] Emitting action: ${actionType}`, payload);
      window.dispatchEvent(
        new CustomEvent('sara:action', {
          detail: { type: actionType, payload },
        })
      );
    }
  };

  const startTour = (tourId: string) => {
    dispatchAction('start_tour', { tourId });
  };

  const navigateTo = (route: string) => {
    dispatchAction('navigate', { route });
  };

  return {
    startTour,
    navigateTo,
  };
}
