import { useUIStore } from '@/lib/store';

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      isBuilderModeActive: false,
      isGuideOpen: false,
      isGuideMinimized: false,
      guideCompletedSteps: [],
      currentGuideStep: 0,
      spotlightStepIndex: null,
      isOnboardingCompleted: false,
    });
  });

  describe('isBuilderModeActive', () => {
    it('has default value of false', () => {
      expect(useUIStore.getState().isBuilderModeActive).toBe(false);
    });

    it('toggles builder mode', () => {
      useUIStore.getState().toggleBuilderMode();
      expect(useUIStore.getState().isBuilderModeActive).toBe(true);
    });

    it('sets builder mode to specific value', () => {
      useUIStore.getState().toggleBuilderMode(true);
      expect(useUIStore.getState().isBuilderModeActive).toBe(true);
    });
  });

  describe('OnboardingGuide', () => {
    it('opens guide', () => {
      useUIStore.getState().openGuide();
      expect(useUIStore.getState().isGuideOpen).toBe(true);
      expect(useUIStore.getState().isGuideMinimized).toBe(true);
    });

    it('closes guide', () => {
      useUIStore.setState({ isGuideOpen: true });
      useUIStore.getState().closeGuide();
      expect(useUIStore.getState().isGuideOpen).toBe(false);
    });

    it('minimizes guide', () => {
      useUIStore.getState().setGuideMinimized(true);
      expect(useUIStore.getState().isGuideMinimized).toBe(true);
    });

    it('sets current guide step', () => {
      useUIStore.getState().setCurrentGuideStep(2);
      expect(useUIStore.getState().currentGuideStep).toBe(2);
    });

    it('completes guide step', () => {
      useUIStore.getState().completeGuideStep(0);
      const steps = useUIStore.getState().guideCompletedSteps;
      expect(steps).toContain(0);
    });

    it('does not duplicate completed steps', () => {
      useUIStore.getState().completeGuideStep(0);
      useUIStore.getState().completeGuideStep(0);
      const steps = useUIStore.getState().guideCompletedSteps;
      expect(steps.filter(s => s === 0).length).toBe(1);
    });

    it('sets spotlight step', () => {
      useUIStore.getState().setSpotlightStep(1);
      expect(useUIStore.getState().spotlightStepIndex).toBe(1);
    });

    it('clears spotlight step with null', () => {
      useUIStore.setState({ spotlightStepIndex: 1 });
      useUIStore.getState().setSpotlightStep(null);
      expect(useUIStore.getState().spotlightStepIndex).toBe(null);
    });

    it('marks onboarding as completed', () => {
      useUIStore.getState().setOnboardingCompleted(true);
      expect(useUIStore.getState().isOnboardingCompleted).toBe(true);
    });
  });

  describe('legacy checklist', () => {
    it('toggles checklist', () => {
      useUIStore.getState().toggleChecklist();
      expect(useUIStore.getState().isChecklistOpen).toBe(true);
    });

    it('minimizes checklist', () => {
      useUIStore.getState().setChecklistMinimized(true);
      expect(useUIStore.getState().isChecklistMinimized).toBe(true);
    });

    it('sets checklist step', () => {
      useUIStore.getState().setCurrentChecklistStep(3);
      expect(useUIStore.getState().currentChecklistStep).toBe(3);
    });
  });
});