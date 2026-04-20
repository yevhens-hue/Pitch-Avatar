import { create } from 'zustand';

interface UIState {
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
}

export const useUIStore = create<UIState>((set) => ({
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
}));
