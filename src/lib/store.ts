import { create } from 'zustand';

interface UIState {
  isOnboardingOpen: boolean;
  isChecklistOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  toggleChecklist: (val?: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOnboardingOpen: false,
  isChecklistOpen: false,
  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),
  toggleChecklist: (val) => set((state: UIState) => ({ 
    isChecklistOpen: val !== undefined ? val : !state.isChecklistOpen 
  })),
}));
