'use client'

import posthog from 'posthog-js'

/**
 * Tracks an activation event in the Pitch Avatar product.
 * Marks the corresponding Stonly checklist item as completed and sends the event to PostHog.
 * 
 * @param itemId The checklist item ID in Stonly (e.g., 'tour_write_script')
 * @param userId The ID of the current user (optional)
 * @param mainGoal The user's main goal (optional, defaults to 'other')
 */
export function trackActivationEvent(itemId: string, userId?: string | null, mainGoal?: string | null) {
  const goal = mainGoal || 'other';

  // 1. Send checklist item completed signal to Stonly Widget API
  if (typeof window !== 'undefined' && (window as any).StonlyWidget) {
    (window as any).StonlyWidget('Event', itemId);
  }

  // 2. Log in PostHog
  posthog.capture('checklist_item_completed', {
    item_id: itemId,
    user_id: userId || null,
    main_goal: goal
  });
}

/**
 * Registers a window message event listener to intercept Stonly's postMessage data
 * transmission events and relay them to PostHog.
 * 
 * @param getUserId Function returning the current user ID
 * @param getMainGoal Function returning the current user's main goal
 * @returns A cleanup function to remove the listener
 */
export function registerStonlyMessageListener(
  getUserId: () => string | undefined | null,
  getMainGoal: () => string | undefined | null
) {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (event: MessageEvent) => {
    // Stonly widget broadcasts transmission events under this source key
    if (event.data?.source === 'stonlyDataTransmission') {
      const { target, value } = event.data;
      const tourId = value?.guideId || value?.id || value?.guide_id || '';
      const step = value?.step || value?.stepNumber || 0;
      
      const userId = getUserId() || null;
      const mainGoal = getMainGoal() || 'other';

      if (target === 'St_event - guide_started') {
        posthog.capture('stonly_tour_started', {
          tour_id: tourId,
          user_id: userId,
          main_goal: mainGoal
        });
      } else if (target === 'St_event - guide_completed') {
        posthog.capture('stonly_tour_completed', {
          tour_id: tourId,
          user_id: userId,
          main_goal: mainGoal
        });
      } else if (target === 'St_event - guide_closed' || target === 'St_event - guide_dismissed') {
        posthog.capture('stonly_tour_dismissed', {
          tour_id: tourId,
          step: step,
          user_id: userId
        });
      }
    }
  };

  window.addEventListener('message', handleMessage);
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
