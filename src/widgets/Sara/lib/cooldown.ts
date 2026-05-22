const GLOBAL_MUTE_KEY = 'sara_global_mute_until';
const TRIGGER_KEY_PREFIX = 'sara_trigger_';

/**
 * Mute proactive popups globally for a number of hours.
 */
export function setGlobalMute(hours: number = 1): void {
  const until = Date.now() + hours * 60 * 60 * 1000;
  localStorage.setItem(GLOBAL_MUTE_KEY, until.toString());
}

/**
 * Check if proactive popups are globally muted.
 */
export function isGloballyMuted(): boolean {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('sara_debug') === 'true' ||
      localStorage.getItem('sara_debug') === 'true' ||
      process.env.NODE_ENV === 'development'
    ) {
      return false;
    }
  }

  const untilStr = localStorage.getItem(GLOBAL_MUTE_KEY);
  if (!untilStr) return false;
  
  const until = parseInt(untilStr, 10);
  if (isNaN(until) || Date.now() > until) {
    localStorage.removeItem(GLOBAL_MUTE_KEY);
    return false;
  }
  return true;
}

/**
 * Set a cooldown for a specific trigger scenario.
 */
export function setTriggerCooldown(triggerId: string, hours: number): void {
  const until = Date.now() + hours * 60 * 60 * 1000;
  localStorage.setItem(`${TRIGGER_KEY_PREFIX}${triggerId}`, until.toString());
}

/**
 * Check if a specific trigger is currently on cooldown.
 */
export function isTriggerOnCooldown(triggerId: string): boolean {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('sara_debug') === 'true' ||
      localStorage.getItem('sara_debug') === 'true' ||
      process.env.NODE_ENV === 'development'
    ) {
      console.log(`[Sara] Cooldown bypassed for trigger: ${triggerId}`);
      return false;
    }
  }

  const untilStr = localStorage.getItem(`${TRIGGER_KEY_PREFIX}${triggerId}`);
  if (!untilStr) return false;
  
  const until = parseInt(untilStr, 10);
  if (isNaN(until) || Date.now() > until) {
    localStorage.removeItem(`${TRIGGER_KEY_PREFIX}${triggerId}`);
    return false;
  }
  return true;
}

/**
 * Clear all cooldowns (useful for testing/resetting state).
 */
export function clearAllCooldowns(): void {
  localStorage.removeItem(GLOBAL_MUTE_KEY);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(TRIGGER_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}
