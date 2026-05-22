import { useEffect, useRef } from 'react';
import { PROACTIVE_SCENARIOS, ProactiveConfig } from '../config/proactive';
import { isGloballyMuted, isTriggerOnCooldown, setTriggerCooldown } from '../lib/cooldown';
import { useSaraStore } from '../store/useSaraStore';

export function useSaraIdleDetector(pathname: string, mainGoal?: string) {
  const isOpen = useSaraStore((state) => state.isOpen);
  const proactiveTrigger = useSaraStore((state) => state.proactiveTrigger);
  const setProactiveTrigger = useSaraStore((state) => state.setProactiveTrigger);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If chat is open or there is already an active trigger, do nothing
    if (isOpen || proactiveTrigger) {
      if (idleTimerRef.current) {
        console.log(`[Sara Idle] Cleaning up timer because chat is open (${isOpen}) or proactive trigger is active (${!!proactiveTrigger})`);
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }
    
    // Check if globally muted
    if (isGloballyMuted()) {
      console.log('[Sara Idle] Globally muted. Idle detector paused.');
      return;
    }

    // Find applicable idle scenarios
    const applicableScenarios = PROACTIVE_SCENARIOS.filter((scenario) => {
      if (scenario.triggerType !== 'idle') return false;
      
      const routeRegex = new RegExp(scenario.routePattern);
      const routeMatched = routeRegex.test(pathname);
      
      const goalMatched = !scenario.condition?.main_goal || scenario.condition.main_goal === mainGoal;
      
      const cooldownActive = isTriggerOnCooldown(scenario.id);
      
      console.log(
        `[Sara Idle] Scenario: "${scenario.id}" matching details: ` +
        `routeMatch=${routeMatched} (pattern: "${scenario.routePattern}"), ` +
        `goalMatch=${goalMatched}, ` +
        `cooldownActive=${cooldownActive}`
      );

      return routeMatched && goalMatched && !cooldownActive;
    });

    if (applicableScenarios.length === 0) {
      console.log('[Sara Idle] No applicable idle scenarios found for current route/cooldown state.');
      return;
    }

    // Pick the first applicable one (could prioritize if needed)
    const scenario = applicableScenarios[0];
    const timeoutSeconds = scenario.condition?.timeoutSeconds || 30;

    console.log(`[Sara Idle] Selected active scenario: "${scenario.id}". Will trigger in ${timeoutSeconds}s of inactivity.`);

    const startTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        console.log(`[Sara Idle] User has been idle for ${timeoutSeconds}s! Triggering scenario: "${scenario.id}"`);
        setProactiveTrigger(scenario);
        setTriggerCooldown(scenario.id, scenario.cooldownHours);
      }, timeoutSeconds * 1000);
    };

    // Helper to log reset only if a certain time passed or just simple debug log
    let lastResetLog = 0;
    const resetTimer = (e?: Event) => {
      const now = Date.now();
      // Throttle logs for resetting to once every 3 seconds to avoid console spamming
      if (now - lastResetLog > 3000) {
        console.log(`[Sara Idle] Activity detected (${e?.type || 'initial'}). Resetting ${timeoutSeconds}s idle timer.`);
        lastResetLog = now;
      }
      startTimer();
    };

    // Start initially
    resetTimer();

    // Listen to user activity to reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (idleTimerRef.current) {
        console.log('[Sara Idle] Cleaning up active timer on effect unmount/rerun');
        clearTimeout(idleTimerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, mainGoal, isOpen, proactiveTrigger, setProactiveTrigger]);
}
