import { create } from 'zustand'
import { CoachSettings, BuyerScenario, QuestionType } from '@/types/coach'

interface CoachState {
  isCoachMode: boolean
  traineeRole: string
  settings: CoachSettings | null
  scenarios: BuyerScenario[]
  
  setIsCoachMode: (mode: boolean) => void
  setTraineeRole: (role: string) => void
  setSettings: (settings: CoachSettings) => void
  setScenarios: (scenarios: BuyerScenario[]) => void
  addScenario: (scenario: BuyerScenario) => void
  updateScenario: (id: string, updates: Partial<BuyerScenario>) => void
  removeScenario: (id: string) => void
}

export const useCoachStore = create<CoachState>((set) => ({
  isCoachMode: false,
  traineeRole: 'buyer',
  settings: null,
  scenarios: [],
  
  setIsCoachMode: (mode) => set({ isCoachMode: mode }),
  setTraineeRole: (role) => set({ traineeRole: role }),
  setSettings: (settings) => set({ settings }),
  setScenarios: (scenarios) => set({ scenarios }),
  addScenario: (scenario) => set((state) => ({ scenarios: [...state.scenarios, scenario] })),
  updateScenario: (id, updates) => set((state) => ({
    scenarios: state.scenarios.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  removeScenario: (id) => set((state) => ({
    scenarios: state.scenarios.filter(s => s.id !== id)
  }))
}))
