import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PresentationTemplate, MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates';
import { supabase } from './supabase';

interface TemplateState {
  templates: PresentationTemplate[];
  fetchTemplates: () => Promise<void>;
  addTemplate: (template: Omit<PresentationTemplate, 'id' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Omit<PresentationTemplate, 'id'>>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      isLoading: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      templates: MOCK_PRESENTATION_TEMPLATES,

      fetchTemplates: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('presentation_templates')
            .select('*')
            .order('order', { ascending: true });

          if (error) throw error;
          if (data && data.length > 0) {
            set({ templates: data as PresentationTemplate[] });
          }
        } catch (e) {
          console.error('Failed to fetch templates from Supabase', e);
          // Keep local persisted state
        } finally {
          set({ isLoading: false });
        }
      },

      addTemplate: async (template) => {
        const newTemplate: PresentationTemplate = {
          ...template,
          id: `tpl_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        // Optimistic update
        set((state) => ({ templates: [...state.templates, newTemplate] }));

        try {
          await supabase.from('presentation_templates').insert(newTemplate);
        } catch (e) {
          console.error('Failed to save template to Supabase', e);
        }
      },

      updateTemplate: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));

        try {
          await supabase
            .from('presentation_templates')
            .update(updates)
            .eq('id', id);
        } catch (e) {
          console.error('Failed to update template in Supabase', e);
        }
      },

      deleteTemplate: async (id) => {
        // Optimistic update
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));

        try {
          await supabase
            .from('presentation_templates')
            .delete()
            .eq('id', id);
        } catch (e) {
          console.error('Failed to delete template from Supabase', e);
        }
      },
    }),
    {
      name: 'pitch-avatar-templates-storage',
      partialize: (state) => ({
        templates: state.templates,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
);

// Auto-fetch on client side init to sync with Supabase
if (typeof window !== 'undefined') {
  useTemplateStore.getState().fetchTemplates();
}
