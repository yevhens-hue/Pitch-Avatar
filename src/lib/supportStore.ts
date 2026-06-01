import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  source?: string;
  timestamp: number;
}

interface SupportChatState {
  isOpen: boolean;
  messages: Message[];
  isMuted: boolean;
  hasBeenOpened: boolean;

  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setMuted: (muted: boolean) => void;
  clearHistory: () => void;
}

export const useSupportChatStore = create<SupportChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      isMuted: true, // always start muted — not persisted
      hasBeenOpened: false,

      openChat: () => set({ isOpen: true, hasBeenOpened: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          hasBeenOpened: state.hasBeenOpened || !state.isOpen,
        })),

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...msg,
              id: Math.random().toString(36).substring(7),
              timestamp: Date.now(),
            },
          ],
        })),

      setMuted: (muted) => set({ isMuted: muted }),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'support-chat-storage',
      // Bump version to 1 — triggers migrate() for ALL existing users with old data
      version: 1,
      migrate: (persistedState: unknown) => {
        // v0 → v1: remove legacy persisted `isMuted` so it always resets to default true
        const state = persistedState as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isMuted: _removed, ...rest } = state;
        return rest;
      },
      partialize: (state) => ({
        isOpen: state.isOpen,
        messages: state.messages,
        hasBeenOpened: state.hasBeenOpened,
        // isMuted intentionally NOT persisted → always starts muted (true) to prevent auto-audio
      }),
    }
  )
);
