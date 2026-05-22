import { useCallback } from 'react';
import { TourId, STONLY_ID_MAP } from '../config/tours';

export function useSaraActions() {
  /**
   * Starts a Stonly guide based on the internal tour ID returned by the LLM.
   */
  const startTour = useCallback((tourId: TourId) => {
    let stonlyHash = STONLY_ID_MAP[tourId];
    
    // If it's a placeholder, fallback to the default tour guide for now
    if (!stonlyHash || stonlyHash === 'STONLY_HASH_PLACEHOLDER') {
      console.warn(`[Sara] No specific Stonly hash mapped for tourId: ${tourId}. Falling back to default guide.`);
      stonlyHash = 'NGxoMErklJ';
    }

    if (typeof window !== 'undefined') {
      // Assuming Stonly is globally available and has this method based on previous integration
      if ((window as any).StonlyWidget) {
        (window as any).StonlyWidget('openGuide', { guideId: stonlyHash });
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
