import { useCallback } from 'react';
import { TourId } from '../config/tours';
import { useUIStore } from '@/lib/store';

export function useSaraActions() {
  const { openGuide } = useUIStore();

  /**
   * Starts the internal custom guide when the LLM asks to start a tour.
   */
  const startTour = useCallback((tourId: TourId) => {
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
