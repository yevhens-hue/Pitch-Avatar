import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PresentationTemplate, MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates';

interface TemplateState {
  templates: PresentationTemplate[];
  setTemplates: (templates: PresentationTemplate[]) => void;
  addTemplate: (template: Omit<PresentationTemplate, 'id' | 'createdAt'>) => void;
  updateTemplate: (id: string, updates: Partial<PresentationTemplate>) => void;
  deleteTemplate: (id: string) => void;
  resetTemplates: () => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: MOCK_PRESENTATION_TEMPLATES,
      setTemplates: (templates) => set({ templates }),
      addTemplate: (template) => set((state) => {
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10);
        const timePart = now.toTimeString().slice(0, 5);
        const createdAt = `${datePart}, ${timePart}`;

        const newTemplate: PresentationTemplate = {
          ...template,
          id: String(Date.now()),
          createdAt,
        };
        return { templates: [...state.templates, newTemplate] };
      }),
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      })),
      resetTemplates: () => set({ templates: MOCK_PRESENTATION_TEMPLATES }),
    }),
    {
      name: 'pitch-avatar-templates-storage',
    }
  )
);
