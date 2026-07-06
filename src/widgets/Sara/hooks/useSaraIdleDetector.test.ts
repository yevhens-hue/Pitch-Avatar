import { renderHook } from '@testing-library/react';
import { useSaraIdleDetector } from './useSaraIdleDetector';
import { useSaraStore } from '../store/useSaraStore';
import { isGloballyMuted, isTriggerOnCooldown, setTriggerCooldown } from '../lib/cooldown';
import { PROACTIVE_SCENARIOS } from '../config/proactive';

// Mock dependencies
jest.mock('../store/useSaraStore');
jest.mock('../lib/cooldown');
jest.mock('../config/proactive', () => ({
  PROACTIVE_SCENARIOS: [
    {
      id: 'test-idle-scenario',
      triggerType: 'idle',
      routePattern: '.*',
      cooldownHours: 1,
      condition: { timeoutSeconds: 2 } // short timeout for testing
    }
  ]
}));

describe('useSaraIdleDetector', () => {
  let mockSetProactiveTrigger: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    mockSetProactiveTrigger = jest.fn();
    (useSaraStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        isOpen: false,
        proactiveTrigger: null,
        setProactiveTrigger: mockSetProactiveTrigger,
        hostContext: {}
      };
      return selector(state);
    });

    (isGloballyMuted as jest.Mock).mockReturnValue(false);
    (isTriggerOnCooldown as jest.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should trigger proactive scenario after timeout if idle', () => {
    renderHook(() => useSaraIdleDetector('/some-route'));

    // Fast forward until just before timeout
    jest.advanceTimersByTime(1900);
    expect(mockSetProactiveTrigger).not.toHaveBeenCalled();

    // Fast forward past timeout
    jest.advanceTimersByTime(200);
    expect(mockSetProactiveTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'test-idle-scenario' })
    );
  });

  it('should reset idle timer on user activity', () => {
    renderHook(() => useSaraIdleDetector('/some-route'));

    // Fast forward halfway
    jest.advanceTimersByTime(1000);

    // Simulate user activity
    window.dispatchEvent(new Event('mousemove'));

    // Fast forward another 1500ms (total 2500ms from start, but only 1500ms from activity)
    jest.advanceTimersByTime(1500);

    // Should not have triggered yet because activity reset the timer
    expect(mockSetProactiveTrigger).not.toHaveBeenCalled();

    // Fast forward enough to exceed 2000ms from the activity
    jest.advanceTimersByTime(600);
    expect(mockSetProactiveTrigger).toHaveBeenCalled();
  });

  it('should not start timer if chat is open', () => {
    (useSaraStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { isOpen: true, proactiveTrigger: null, setProactiveTrigger: mockSetProactiveTrigger, hostContext: {} };
      return selector(state);
    });

    renderHook(() => useSaraIdleDetector('/some-route'));
    
    jest.advanceTimersByTime(3000);
    expect(mockSetProactiveTrigger).not.toHaveBeenCalled();
  });
});
