import { useCallback } from 'react';
import { TourId, STONLY_ID_MAP } from '../config/tours';
import { useUIStore } from '@/lib/store';

export function useSaraActions() {
  const { openGuide } = useUIStore();

  /**
   * Starts the Stonly guide if a valid hash is provided,
   * otherwise falls back to the internal custom guide.
   */
  const startTour = useCallback((tourId: TourId) => {
    const stonlyHash = STONLY_ID_MAP[tourId];
    
    // If we have a real Stonly hash, trigger the Stonly widget
    if (stonlyHash && stonlyHash !== 'STONLY_HASH_PLACEHOLDER') {
      if (typeof window !== 'undefined' && (window as any).openStonlyGuide) {
        (window as any).openStonlyGuide(stonlyHash);
        return;
      }
    }
    
    // Fallback to internal guide
    openGuide();
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
