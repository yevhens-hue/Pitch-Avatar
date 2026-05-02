import { create } from 'zustand';

export type ChecklistType = 'video' | 'chat' | 'slides' | 'localization' | 'fallback' | null;

interface UIState {
  // Legacy fields (kept for backward compat)
  isOnboardingOpen: boolean;
  isChecklistOpen: boolean;
  isTourActive: boolean;
  isBuilderModeActive: boolean;
  activeTourStep: number | null;
  currentChecklistStep: number;
  isChecklistMinimized: boolean;
  isOnboardingCompleted: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  toggleChecklist: (val?: boolean) => void;
  setChecklistMinimized: (val: boolean) => void;
  setCurrentChecklistStep: (step: number) => void;
  completeOnboardingStep: (index: number) => void;
  setOnboardingCompleted: (val: boolean) => void;
  startTour: (step: number) => void;
  endTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  toggleBuilderMode: (val?: boolean) => void;

  // New unified OnboardingGuide fields
  isGuideOpen: boolean;
  isGuideMinimized: boolean;
  guideCompletedSteps: number[];
  currentGuideStep: number;
  spotlightStepIndex: number | null;
  activeChecklist: ChecklistType;
  openGuide: () => void;
  closeGuide: () => void;
  setGuideMinimized: (val: boolean) => void;
  setCurrentGuideStep: (step: number) => void;
  completeGuideStep: (index: number) => void;
  setSpotlightStep: (index: number | null) => void;
  setActiveChecklist: (type: ChecklistType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Legacy
  isOnboardingOpen: false,
  isChecklistOpen: false,
  isTourActive: false,
  isBuilderModeActive: false,
  activeTourStep: null,
  currentChecklistStep: 0,
  isChecklistMinimized: false,
  isOnboardingCompleted: false,
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
  toggleChecklist: (val) => set((state: UIState) => ({ 
    isChecklistOpen: val !== undefined ? val : !state.isChecklistOpen 
  })),
  setChecklistMinimized: (val) => set({ isChecklistMinimized: val }),
  setCurrentChecklistStep: (step) => set({ currentChecklistStep: step }),
  completeOnboardingStep: (index) => set((state) => ({
    currentChecklistStep: Math.max(state.currentChecklistStep, index + 1)
  })),
  setOnboardingCompleted: (val) => set({ isOnboardingCompleted: val }),
  startTour: (step) => set({ isTourActive: true, activeTourStep: step, isChecklistMinimized: true }),
  endTour: () => set({ isTourActive: false, activeTourStep: null }),
  nextTourStep: () => set((state) => ({ 
    activeTourStep: state.activeTourStep !== null ? state.activeTourStep + 1 : null 
  })),
  prevTourStep: () => set((state) => ({ 
    activeTourStep: state.activeTourStep !== null ? Math.max(0, state.activeTourStep - 1) : null 
  })),
  toggleBuilderMode: (val) => set((state) => ({
    isBuilderModeActive: val !== undefined ? val : !state.isBuilderModeActive
  })),

  // New unified OnboardingGuide
  isGuideOpen: false,
  isGuideMinimized: false,
  guideCompletedSteps: [],
  currentGuideStep: 0,
  spotlightStepIndex: null,
  activeChecklist: null,
  openGuide: () => set((state) => ({
    isGuideOpen: true,
    isGuideMinimized: false, // Start expanded by default for multi-branch
  })),
  closeGuide: () => set({ isGuideOpen: false, spotlightStepIndex: null }),
  setGuideMinimized: (val) => set({ isGuideMinimized: val }),
  setCurrentGuideStep: (step) => set({ currentGuideStep: step }),
  completeGuideStep: (index) => set((state) => ({
    guideCompletedSteps: state.guideCompletedSteps.includes(index)
      ? state.guideCompletedSteps
      : [...state.guideCompletedSteps, index],
  })),
  setSpotlightStep: (index) => set({ spotlightStepIndex: index }),
  setActiveChecklist: (type) => set({ activeChecklist: type, guideCompletedSteps: [], currentGuideStep: 0 }),
}));
