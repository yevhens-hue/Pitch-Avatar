import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProactiveBubble from './ProactiveBubble'
import { useSaraStore } from '../../store/useSaraStore'
import { setGlobalMute, setTriggerCooldown } from '../../lib/cooldown'
import { useSaraActions } from '../../hooks/useSaraActions'

// Mock cooldown lib
jest.mock('../../lib/cooldown', () => ({
  setGlobalMute: jest.fn(),
  setTriggerCooldown: jest.fn(),
}))

// Mock hooks
jest.mock('../../hooks/useSaraActions', () => ({
  useSaraActions: jest.fn(),
}))

describe('ProactiveBubble Component', () => {
  let startTourMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    startTourMock = jest.fn()
    ;(useSaraActions as jest.Mock).mockReturnValue({
      startTour: startTourMock,
    })

    act(() => {
      useSaraStore.getState().setProactiveTrigger(null)
      // reset toggleChat mock or just clear state
      if (useSaraStore.getState().isOpen) {
        useSaraStore.getState().toggleChat()
      }
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing when there is no proactiveTrigger', () => {
    const { container } = render(<ProactiveBubble />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders bubble when proactiveTrigger is set', () => {
    act(() => {
      useSaraStore.getState().setProactiveTrigger({
        id: 'test-trigger',
        triggerType: 'entry',
        routePattern: '.*',
        cooldownHours: 1,
        content: {
          message: 'Hello, need help?',
          ctaLabel: 'Yes',
          action: { type: 'open_chat' }
        }
      })
    })

    render(<ProactiveBubble />)
    expect(screen.getByText('Hello, need help?')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('auto-dismisses after 15 seconds', () => {
    act(() => {
      useSaraStore.getState().setProactiveTrigger({
        id: 'test-trigger',
        triggerType: 'entry',
        routePattern: '.*',
        cooldownHours: 1,
        content: {
          message: 'Hello, need help?',
          ctaLabel: 'Yes',
          action: { type: 'open_chat' }
        }
      })
    })

    render(<ProactiveBubble />)
    expect(screen.getByText('Hello, need help?')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(15000)
    })

    expect(useSaraStore.getState().proactiveTrigger).toBeNull()
  })

  it('calls setGlobalMute and dismisses when close button is clicked', () => {
    act(() => {
      useSaraStore.getState().setProactiveTrigger({
        id: 'test-trigger',
        triggerType: 'entry',
        routePattern: '.*',
        cooldownHours: 1,
        content: {
          message: 'Dismiss me',
          ctaLabel: 'Ok',
          action: { type: 'open_chat' }
        }
      })
    })

    render(<ProactiveBubble />)
    
    const dismissBtn = screen.getByLabelText('Dismiss')
    fireEvent.click(dismissBtn)

    expect(setGlobalMute).toHaveBeenCalledWith(1)
    expect(useSaraStore.getState().proactiveTrigger).toBeNull()
  })

  it('handles action click for open_chat', () => {
    act(() => {
      useSaraStore.getState().setProactiveTrigger({
        id: 'chat-trigger',
        triggerType: 'entry',
        routePattern: '.*',
        cooldownHours: 2,
        content: {
          message: 'Chat?',
          ctaLabel: 'Open',
          action: { type: 'open_chat', prefillMessage: 'I need help' }
        }
      })
    })

    render(<ProactiveBubble />)
    
    const ctaBtn = screen.getByText('Open')
    fireEvent.click(ctaBtn)

    expect(setTriggerCooldown).toHaveBeenCalledWith('chat-trigger', 2)
    expect(useSaraStore.getState().proactiveTrigger).toBeNull()
    expect(useSaraStore.getState().isOpen).toBe(true) // toggleChat was called
    expect(useSaraStore.getState().prefillMessage).toBe('I need help')
  })

  it('handles action click for start_tour', () => {
    act(() => {
      useSaraStore.getState().setProactiveTrigger({
        id: 'tour-trigger',
        triggerType: 'entry',
        routePattern: '.*',
        cooldownHours: 2,
        content: {
          message: 'Take a tour?',
          ctaLabel: 'Start Tour',
          action: { type: 'start_tour', tourId: 'tour_create_chat_avatar_1' }
        }
      })
    })

    render(<ProactiveBubble />)
    
    const ctaBtn = screen.getByText('Start Tour')
    fireEvent.click(ctaBtn)

    expect(startTourMock).toHaveBeenCalledWith('tour_create_chat_avatar_1')
    expect(useSaraStore.getState().isOpen).toBe(true) // toggleChat was called
  })
})
