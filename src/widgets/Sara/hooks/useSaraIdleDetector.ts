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
    if (isOpen || proactiveTrigger) return;
    
    // Check if globally muted
    if (isGloballyMuted()) return;

    // Find applicable idle scenarios
    const applicableScenarios = PROACTIVE_SCENARIOS.filter((scenario) => {
      if (scenario.triggerType !== 'idle') return false;
      
      const routeRegex = new RegExp(scenario.routePattern);
      if (!routeRegex.test(pathname)) return false;

      if (scenario.condition?.main_goal && scenario.condition.main_goal !== mainGoal) return false;
      
      if (isTriggerOnCooldown(scenario.id)) return false;

      return true;
    });

    if (applicableScenarios.length === 0) return;

    // Pick the first applicable one (could prioritize if needed)
    const scenario = applicableScenarios[0];
    const timeoutSeconds = scenario.condition?.timeoutSeconds || 60;

    const startTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setProactiveTrigger(scenario);
        setTriggerCooldown(scenario.id, scenario.cooldownHours);
      }, timeoutSeconds * 1000);
    };

    const resetTimer = () => startTimer();

    // Start initially
    startTimer();

    // Listen to user activity to reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, mainGoal, isOpen, proactiveTrigger, setProactiveTrigger]);
}
