import { create } from 'zustand';

interface UIState {
  isOnboardingOpen: boolean;
  isChecklistOpen: boolean;
  isTourActive: boolean;
  activeTourStep: number | null;
  currentChecklistStep: number;
  isChecklistMinimized: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  toggleChecklist: (val?: boolean) => void;
  setChecklistMinimized: (val: boolean) => void;
  setCurrentChecklistStep: (step: number) => void;
  completeOnboardingStep: (index: number) => void;
  startTour: (step: number) => void;
  endTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnboardingOpen: false,
  isChecklistOpen: false,
  isTourActive: false,
  activeTourStep: null,
  currentChecklistStep: 0,
  isChecklistMinimized: false,
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
  startTour: (step) => set({ isTourActive: true, activeTourStep: step, isChecklistMinimized: true }),
  endTour: () => set({ isTourActive: false, activeTourStep: null }),
  nextTourStep: () => set((state) => ({ 
    activeTourStep: state.activeTourStep !== null ? state.activeTourStep + 1 : null 
  })),
  prevTourStep: () => set((state) => ({ 
    activeTourStep: state.activeTourStep !== null ? Math.max(0, state.activeTourStep - 1) : null 
  })),
}));
