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

export interface WidgetConfig {
  hideCallPresenter?: boolean;
  hideScheduleMeeting?: boolean;
  hideTextInput?: boolean;
  hideFab?: boolean;
  primaryColor?: string;
  position?: 'bottom-left' | 'bottom-right';
  logoUrl?: string;
  avatarName?: string;
  avatarImageUrl?: string;
  greetingMessage?: string;
  onAction?: (actionType: string, payload: any) => void;
  /** Current URL of the Host App page — updated automatically by SaraWidgetContainer on route change */
  currentUrl?: string;
  /** Human-readable label for the current page/section — derived from pathname via pageContext map */
  contextLabel?: string;
  /** Detailed text description of the current page — injected into LLM system prompt */
  pageDescription?: string;
  [key: string]: unknown;
}

interface SaraState {
  isOpen: boolean
  isDismissed: boolean
  isMuted: boolean
  isLoading: boolean
  conversationId: string | null
  messages: SaraMessage[]
  proactiveTrigger: ProactiveConfig | null
  prefillMessage: string | null
  wizardStep: number | null
  language: 'en' | 'ru'
  config: WidgetConfig
  hostContext: Record<string, unknown>
  tools: Record<string, any>[]

  // Actions
  toggleChat: () => void
  setDismissed: (dismissed: boolean) => void
  setMuted: (muted: boolean) => void
  setLoading: (loading: boolean) => void
  setConversationId: (id: string | null) => void
  addMessage: (message: SaraMessage) => void
  setMessages: (messages: SaraMessage[]) => void
  clearMessages: () => void
  setProactiveTrigger: (trigger: ProactiveConfig | null) => void
  setPrefillMessage: (message: string | null) => void
  setWizardStep: (step: number | null) => void
  setLanguage: (lang: 'en' | 'ru') => void
  setConfig: (config: Partial<WidgetConfig>) => void
  setHostContext: (context: Record<string, unknown>) => void
  setTools: (tools: Record<string, any>[]) => void
}

export const useSaraStore = create<SaraState>()(
  persist(
    (set) => ({
      isOpen: false,
      isDismissed: false,
      isMuted: true,
      isLoading: false,
      conversationId: null,
      messages: [],
      proactiveTrigger: null,
      prefillMessage: null,
      wizardStep: null,
      language: 'en',
      config: {},
      hostContext: {},
      tools: [],

      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
      setDismissed: (dismissed) => set({ isDismissed: dismissed }),
      setMuted: (muted) => set({ isMuted: muted }),
      setLoading: (loading) => set({ isLoading: loading }),
      setConversationId: (id) => set({ conversationId: id }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      setMessages: (messages) => set({ messages }),
      
      clearMessages: () => set({ messages: [], conversationId: null }),
      setProactiveTrigger: (trigger) => set({ proactiveTrigger: trigger }),
      setPrefillMessage: (message) => set({ prefillMessage: message }),
      setWizardStep: (step) => set({ wizardStep: step }),
      setLanguage: (lang) => set({ language: lang }),
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
      setHostContext: (context) => set((state) => ({ hostContext: { ...state.hostContext, ...context } })),
      setTools: (tools) => set({ tools }),
    }),
    {
      name: 'sara-chat-storage',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      migrate: (persistedState: unknown) => {
        // v0 → v1: remove legacy persisted `isMuted` so it always resets to default true
        const state = persistedState as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isMuted: _removed, ...rest } = state;
        return rest;
      },
      partialize: (state) => ({
        isDismissed: state.isDismissed,
        // isMuted intentionally NOT persisted → always starts muted (true) to prevent auto-audio on load
        conversationId: state.conversationId,
        messages: state.messages,
        language: state.language
      }),
    }
  )
)
