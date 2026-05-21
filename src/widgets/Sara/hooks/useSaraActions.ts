import { useCallback } from 'react';
import { TourId, STONLY_ID_MAP } from '../config/tours';

export function useSaraActions() {
  /**
   * Starts a Stonly guide based on the internal tour ID returned by the LLM.
   */
  const startTour = useCallback((tourId: TourId) => {
    const stonlyHash = STONLY_ID_MAP[tourId];
    
    if (!stonlyHash || stonlyHash === 'STONLY_HASH_PLACEHOLDER') {
      console.warn(`[Sara] Cannot start tour. No valid Stonly hash mapped for tourId: ${tourId}`);
      return;
    }

    if (typeof window !== 'undefined') {
      // Assuming Stonly is globally available and has this method based on previous integration
      if (window.StonlyWidget) {
        window.StonlyWidget('openGuide', { guideId: stonlyHash });
      } else if (typeof (window as any).openStonlyGuide === 'function') {
        (window as any).openStonlyGuide(stonlyHash);
      } else {
        console.error('[Sara] Stonly widget is not initialized on the page.');
      }
    }
  }, []);

  /**
   * Helper function to navigate the user to a specific route.
   */
  const navigateTo = useCallback((route: string) => {
    if (typeof window !== 'undefined') {
      // Handle Next.js navigation if needed, or fallback to window.location
      window.location.href = route;
    }
  }, []);

  return {
    startTour,
    navigateTo,
  };
}
