import { act } from '@testing-library/react'
import { useSaraStore } from './useSaraStore'

describe('useSaraStore', () => {
  beforeEach(() => {
    act(() => {
      useSaraStore.getState().clearMessages()
      useSaraStore.getState().setDismissed(false)
      useSaraStore.getState().setMuted(true)
      useSaraStore.getState().setLoading(false)
      useSaraStore.getState().setPrefillMessage(null)
      useSaraStore.getState().setWizardStep(null)
      useSaraStore.getState().setProactiveTrigger(null)
    })
  })

  it('should initialize with correct default values', () => {
    const state = useSaraStore.getState()
    expect(state.isOpen).toBe(false)
    expect(state.isDismissed).toBe(false)
    expect(state.isMuted).toBe(true)
    expect(state.isLoading).toBe(false)
    expect(state.messages).toEqual([])
    expect(state.proactiveTrigger).toBeNull()
    expect(state.prefillMessage).toBeNull()
    expect(state.wizardStep).toBeNull()
  })

  it('should toggle chat panel open/close state', () => {
    act(() => {
      useSaraStore.getState().toggleChat()
    })
    expect(useSaraStore.getState().isOpen).toBe(true)

    act(() => {
      useSaraStore.getState().toggleChat()
    })
    expect(useSaraStore.getState().isOpen).toBe(false)
  })

  it('should mute and unmute voice audio state', () => {
    act(() => {
      useSaraStore.getState().setMuted(true)
    })
    expect(useSaraStore.getState().isMuted).toBe(true)

    act(() => {
      useSaraStore.getState().setMuted(false)
    })
    expect(useSaraStore.getState().isMuted).toBe(false)
  })

  it('should add message to conversation', () => {
    const testMsg = {
      id: 1,
      role: 'user' as const,
      content: 'Hello Sara',
      created_at: new Date().toISOString()
    }

    act(() => {
      useSaraStore.getState().addMessage(testMsg)
    })

    expect(useSaraStore.getState().messages).toHaveLength(1)
    expect(useSaraStore.getState().messages[0]).toEqual(testMsg)
  })

  it('should prefill prefillMessage and clear it', () => {
    act(() => {
      useSaraStore.getState().setPrefillMessage('Prefilled query')
    })
    expect(useSaraStore.getState().prefillMessage).toBe('Prefilled query')

    act(() => {
      useSaraStore.getState().setPrefillMessage(null)
    })
    expect(useSaraStore.getState().prefillMessage).toBeNull()
  })

  it('should handle wizardStep and proactiveTrigger changes', () => {
    const mockTrigger = {
      id: 'test-scenario',
      triggerType: 'idle' as const,
      routePattern: '.*',
      cooldownHours: 1,
      condition: { timeoutSeconds: 5 },
      content: {
        message: 'Test message',
        ctaLabel: 'Test CTA',
        action: { type: 'open_chat' as const },
      },
    }

    act(() => {
      useSaraStore.getState().setWizardStep(3)
      useSaraStore.getState().setProactiveTrigger(mockTrigger)
    })

    expect(useSaraStore.getState().wizardStep).toBe(3)
    expect(useSaraStore.getState().proactiveTrigger).toEqual(mockTrigger)
  })
})
