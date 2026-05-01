import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KnowledgeBaseSettings, DEFAULT_SETTINGS } from './knowledge';

interface KnowledgeState {
  settings: KnowledgeBaseSettings;
  updateSettings: (settings: KnowledgeBaseSettings) => void;
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (settings) => set({ settings }),
    }),
    {
      name: 'pitch-avatar-knowledge-settings',
    }
  )
);
