import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ProactiveConfig } from '../config/proactive'

export interface SaraMessage {
  id: number | string
  role: 'user' | 'assistant' | 'system'
  content: string
  actions?: Array<{
    id: string
    tool: string
    label: string
    params: Record<string, unknown>
  }>
  created_at?: string
}

interface SaraState {
  isOpen: boolean
  isDismissed: boolean
  isMuted: boolean
  conversationId: string | null
  messages: SaraMessage[]
  proactiveTrigger: ProactiveConfig | null
  
  // Actions
  toggleChat: () => void
  setDismissed: (dismissed: boolean) => void
  setMuted: (muted: boolean) => void
  setConversationId: (id: string | null) => void
  addMessage: (message: SaraMessage) => void
  setMessages: (messages: SaraMessage[]) => void
  clearMessages: () => void
  setProactiveTrigger: (trigger: ProactiveConfig | null) => void
}

export const useSaraStore = create<SaraState>()(
  persist(
    (set) => ({
      isOpen: false,
      isDismissed: false,
      isMuted: false,
      conversationId: null,
      messages: [],
      proactiveTrigger: null,
      
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setDismissed: (dismissed) => set({ isDismissed: dismissed }),
      setMuted: (muted) => set({ isMuted: muted }),
      setConversationId: (id) => set({ conversationId: id }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      setMessages: (messages) => set({ messages }),
      
      clearMessages: () => set({ messages: [], conversationId: null }),
      setProactiveTrigger: (trigger) => set({ proactiveTrigger: trigger }),
    }),
    {
      name: 'sara-chat-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // using sessionStorage for chat history as a default fallback
      partialize: (state) => ({ 
        isDismissed: state.isDismissed,
        isMuted: state.isMuted,
        conversationId: state.conversationId,
        messages: state.messages
      }),
    }
  )
)
