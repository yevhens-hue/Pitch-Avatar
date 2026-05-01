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
      isMuted: false,
      hasBeenOpened: false,

      openChat: () => set({ isOpen: true, hasBeenOpened: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen, hasBeenOpened: state.hasBeenOpened || !state.isOpen })),
      
      addMessage: (msg) => set((state) => ({
        messages: [...state.messages, {
          ...msg,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now()
        }]
      })),

      setMuted: (muted) => set({ isMuted: muted }),
      
      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'support-chat-storage', // local storage key
    }
  )
);
