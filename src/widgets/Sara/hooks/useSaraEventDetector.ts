import { useEffect } from 'react';
import { PROACTIVE_SCENARIOS } from '../config/proactive';
import { isGloballyMuted, isTriggerOnCooldown } from '../lib/cooldown';
import { useSaraStore } from '../store/useSaraStore';

export function useSaraEventDetector(pathname: string, mainGoal?: string) {
  const isOpen = useSaraStore((state) => state.isOpen);
  const proactiveTrigger = useSaraStore((state) => state.proactiveTrigger);
  const setProactiveTrigger = useSaraStore((state) => state.setProactiveTrigger);

  // Handle entry triggers
  useEffect(() => {
    if (pathname === '/' || isOpen || proactiveTrigger || isGloballyMuted()) return;

    const entryScenarios = PROACTIVE_SCENARIOS.filter((scenario) => {
      if (scenario.triggerType !== 'entry') return false;
      
      const routeRegex = new RegExp(scenario.routePattern);
      if (!routeRegex.test(pathname)) return false;

      if (scenario.condition?.main_goal && scenario.condition.main_goal !== mainGoal) return false;
      
      if (isTriggerOnCooldown(scenario.id)) return false;

      return true;
    });

    if (entryScenarios.length > 0) {
      const scenario = entryScenarios[0];
      // Slight delay for entry
      const timer = setTimeout(() => {
        setProactiveTrigger(scenario);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pathname, mainGoal, isOpen, proactiveTrigger, setProactiveTrigger]);

  // Handle global custom events for errors/success
  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      if (pathname === '/' || isOpen || proactiveTrigger || isGloballyMuted()) return;

      const customEvent = event as CustomEvent<{ type: string; payload?: any }>;
      const eventName = customEvent.detail?.type;

      if (!eventName) return;

      const matchedScenario = PROACTIVE_SCENARIOS.find((scenario) => {
        if (scenario.triggerType !== 'error' && scenario.triggerType !== 'success') return false;
        
        const routeRegex = new RegExp(scenario.routePattern);
        if (!routeRegex.test(pathname)) return false;

        if (scenario.condition?.main_goal && scenario.condition.main_goal !== mainGoal) return false;

        if (scenario.condition?.eventOrErrorMatch !== eventName) return false;

        if (isTriggerOnCooldown(scenario.id)) return false;

        return true;
      });

      if (matchedScenario) {
        setProactiveTrigger(matchedScenario);
      }
    };

    window.addEventListener('sara_custom_event', handleCustomEvent);
    return () => window.removeEventListener('sara_custom_event', handleCustomEvent);
  }, [pathname, mainGoal, isOpen, proactiveTrigger, setProactiveTrigger]);
}

// Utility to dispatch events from other parts of the app
export function dispatchSaraEvent(type: string, payload?: any) {
  window.dispatchEvent(new CustomEvent('sara_custom_event', { detail: { type, payload } }));
}
