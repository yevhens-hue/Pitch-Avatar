import { create } from 'zustand';

interface UIState {
  isOnboardingOpen: boolean;
  isChecklistOpen: boolean;
  isTourActive: boolean;
  activeTourStep: number | null;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  toggleChecklist: (val?: boolean) => void;
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
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
  toggleChecklist: (val) => set((state: UIState) => ({ 
    isChecklistOpen: val !== undefined ? val : !state.isChecklistOpen 
  })),
  startTour: (step) => set({ isTourActive: true, activeTourStep: step }),
  endTour: () => set({ isTourActive: false, activeTourStep: null }),
  nextTourStep: () => set((state) => ({ 
    activeTourStep: state.activeTourStep !== null ? state.activeTourStep + 1 : null 
  })),
  prevTourStep: () => set((state) => ({ 
    activeTourStep: state.activeTourStep !== null ? Math.max(0, state.activeTourStep - 1) : null 
  })),
}));
