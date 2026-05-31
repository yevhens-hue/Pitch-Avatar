import { renderHook, act } from '@testing-library/react'
import { useSaraEventDetector, dispatchSaraEvent } from './useSaraEventDetector'
import { useSaraStore } from '../store/useSaraStore'
import { isGloballyMuted, isTriggerOnCooldown } from '../lib/cooldown'

// Mock dependencies
jest.mock('../lib/cooldown', () => ({
  isGloballyMuted: jest.fn(),
  isTriggerOnCooldown: jest.fn(),
}))

jest.mock('../config/proactive', () => ({
  PROACTIVE_SCENARIOS: [
    {
      id: 'test_entry',
      triggerType: 'entry',
      routePattern: '^/dashboard$',
      content: { message: 'Entry trigger', ctaLabel: 'Go', action: { type: 'open_chat' } },
      cooldownHours: 1
    },
    {
      id: 'test_success',
      triggerType: 'success',
      routePattern: '.*',
      condition: { eventOrErrorMatch: 'test_event' },
      content: { message: 'Success trigger', ctaLabel: 'Go', action: { type: 'open_chat' } },
      cooldownHours: 1
    }
  ]
}))

describe('useSaraEventDetector', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    act(() => {
      useSaraStore.getState().setProactiveTrigger(null)
      if (useSaraStore.getState().isOpen) {
        useSaraStore.getState().toggleChat()
      }
    })

    ;(isGloballyMuted as jest.Mock).mockReturnValue(false)
    ;(isTriggerOnCooldown as jest.Mock).mockReturnValue(false)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('ignores entry triggers if globally muted', () => {
    ;(isGloballyMuted as jest.Mock).mockReturnValue(true)
    renderHook(() => useSaraEventDetector('/dashboard'))

    act(() => {
      jest.advanceTimersByTime(3500)
    })

    expect(useSaraStore.getState().proactiveTrigger).toBeNull()
  })

  it('triggers entry scenario after 3s on matching route', () => {
    renderHook(() => useSaraEventDetector('/dashboard'))

    act(() => {
      jest.advanceTimersByTime(2900)
    })
    expect(useSaraStore.getState().proactiveTrigger).toBeNull()

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(useSaraStore.getState().proactiveTrigger?.id).toBe('test_entry')
  })

  it('ignores entry scenario if trigger is on cooldown', () => {
    ;(isTriggerOnCooldown as jest.Mock).mockReturnValue(true)
    renderHook(() => useSaraEventDetector('/dashboard'))

    act(() => {
      jest.advanceTimersByTime(3500)
    })

    expect(useSaraStore.getState().proactiveTrigger).toBeNull()
  })

  it('handles custom events correctly', () => {
    renderHook(() => useSaraEventDetector('/some-page'))

    act(() => {
      dispatchSaraEvent('test_event')
    })

    expect(useSaraStore.getState().proactiveTrigger?.id).toBe('test_success')
  })

  it('ignores custom events if chat is already open', () => {
    act(() => {
      useSaraStore.getState().toggleChat() // open chat
    })

    renderHook(() => useSaraEventDetector('/some-page'))

    act(() => {
      dispatchSaraEvent('test_event')
    })

    expect(useSaraStore.getState().proactiveTrigger).toBeNull()
  })
})
