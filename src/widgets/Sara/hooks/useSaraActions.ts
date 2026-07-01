import { useCallback } from 'react';
import { TourId, STONLY_ID_MAP } from '../config/tours';
import { useUIStore } from '@/lib/store';

export function useSaraActions() {
  const { openGuide } = useUIStore();

  /**
   * Starts the Stonly guide if a valid hash is provided,
   * otherwise falls back to a default testing Stonly guide.
   */
  const startTour = useCallback((tourId: TourId) => {
    let stonlyHash = STONLY_ID_MAP[tourId];
    
    // If it's a placeholder, fallback to the default testing Stonly guide
    if (!stonlyHash || stonlyHash === 'STONLY_HASH_PLACEHOLDER') {
      console.warn(`[Sara] No specific Stonly hash mapped for tourId: ${tourId}. Falling back to default testing guide.`);
      stonlyHash = 'NGxoMErklJ';
    }

    if (typeof window !== 'undefined') {
      if ((window as any).StonlyWidget) {
        (window as any).StonlyWidget('openGuide', { guideId: stonlyHash });
      } else if (typeof (window as any).openStonlyGuide === 'function') {
        (window as any).openStonlyGuide(stonlyHash);
      } else {
        console.error('[Sara] Stonly widget is not initialized on the page.');
        // Final fallback if Stonly is entirely blocked/missing
        openGuide();
      }
    }
  }, [openGuide]);

  /**
   * Helper function to navigate the user to a specific route.
   */
  const navigateTo = useCallback((route: string) => {
    if (typeof window !== 'undefined') {
      // Handle Next.js navigation if needed, or fallback to window.location
      window.location.assign(route);
    }
  }, []);

  return {
    startTour,
    navigateTo,
  };
}
