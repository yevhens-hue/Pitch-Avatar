import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import ChatPanel from './ChatPanel'
import { useSaraStore } from '../../store/useSaraStore'
import { captureSaraEvent } from '../../analytics/posthog'

// Mock analytics
jest.mock('../../analytics/posthog', () => ({
  captureSaraEvent: jest.fn(),
}))

// Mock hooks
const mockDispatchAction = jest.fn()
jest.mock('../../hooks/useSaraActions', () => ({
  useSaraActions: () => ({ dispatchAction: mockDispatchAction }),
}))

const mockExecuteSequence = jest.fn()
jest.mock('../../hooks/useSaraMultiActions', () => ({
  useSaraMultiActions: () => ({ executeSequence: mockExecuteSequence }),
}))

describe('ChatPanel Component', () => {
  let mockPush: jest.Mock
  let mockPathname: string

  beforeEach(() => {
    mockPush = mockDispatchAction
    mockPathname = '/chat-avatar/create'

    // Reset store state
    act(() => {
      useSaraStore.getState().clearMessages()
      useSaraStore.getState().setMuted(true)
      useSaraStore.getState().setLoading(false)
      useSaraStore.getState().setWizardStep(1)
    })

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Response from Sara AI', action: null }),
      })
    ) as jest.Mock
  })

  it.skip('renders dynamic context header based on route step', () => {
    render(<ChatPanel />)
    expect(screen.getByText('Chat Avatar Setup')).toBeInTheDocument()
  })

  it.skip('renders dynamic chips suggestions for active steps', () => {
    render(<ChatPanel />)
    expect(screen.getByText('How to name the avatar?')).toBeInTheDocument()
    expect(screen.getByText('Best voice for sales?')).toBeInTheDocument()
  })

  it('toggles audio mute state in store when mute button is clicked', () => {
    render(<ChatPanel />)
    const muteBtn = screen.getAllByRole('button', { name: /Unmute Sara/i })[0]
    fireEvent.click(muteBtn)

    expect(useSaraStore.getState().isMuted).toBe(false)
  })

  it.skip('toggles audio mute state in store when avatar section is clicked', () => {
    const { container } = render(<ChatPanel />)
    const avatarBtn = container.querySelector('[class*="avatarSection"]') as HTMLElement
    fireEvent.click(avatarBtn)

    expect(useSaraStore.getState().isMuted).toBe(false)
  })

  describe('Speech Synthesis', () => {
    let mockSpeak: jest.Mock
    let mockCancel: jest.Mock

    beforeEach(() => {
      mockSpeak = jest.fn()
      mockCancel = jest.fn()
      
      class MockSpeechSynthesisUtterance {
        text: string
        constructor(text: string) {
          this.text = text
        }
      }
      
      // @ts-ignore
      global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance

      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: mockSpeak,
          cancel: mockCancel,
          speaking: false,
        },
        configurable: true,
        writable: true,
      })
    })

    afterEach(() => {
      // @ts-ignore
      delete window.speechSynthesis
      // @ts-ignore
      delete global.SpeechSynthesisUtterance
    })

    it('filters out emojis/smilies from text before speaking', async () => {
      render(<ChatPanel />)

      act(() => {
        useSaraStore.getState().setMuted(false)
      })

      act(() => {
        useSaraStore.getState().addMessage({
          id: 12345,
          role: 'assistant',
          content: 'Hello, world! 👋😊 This is a test. **Important** text!',
          created_at: new Date().toISOString(),
        })
      })

      await waitFor(() => {
        expect(mockSpeak).toHaveBeenCalled()
      })

      const utterance = mockSpeak.mock.calls[0][0]
      expect(utterance.text).toBe('Hello, world! This is a test. Important text!')
    })

    it('cancels speech immediately when isMuted is changed to true', async () => {
      render(<ChatPanel />)

      act(() => {
        useSaraStore.getState().setMuted(true)
      })

      await waitFor(() => {
        expect(mockCancel).toHaveBeenCalled()
      })
    })
  })

  it.skip('submits suggestions when a chip is clicked', async () => {
    render(<ChatPanel />)
    const chip = screen.getByText('How to name the avatar?')
    fireEvent.click(chip)

    // Verify message added to store
    expect(useSaraStore.getState().messages[0].content).toBe('How to name the avatar?')

    await waitFor(() => {
      expect(captureSaraEvent).toHaveBeenCalledWith('sara_message_sent', expect.any(Object))
    })
  })

  it('allows user to enter custom message and click send button', async () => {
    render(<ChatPanel />)
    const input = screen.getByPlaceholderText('Send a message')
    fireEvent.change(input, { target: { value: 'How many slides are allowed?' } })
    const sendBtn = screen.getByLabelText('Send message')
    fireEvent.click(sendBtn)

    expect(useSaraStore.getState().messages[0].content).toBe('How many slides are allowed?')
  })

  it('parses interactive buttons using custom markdown layout syntax', async () => {
    // Add assistant reply with markdown interactive button
    act(() => {
      useSaraStore.getState().addMessage({
        id: 'msg-assist',
        role: 'assistant',
        content: 'You can go to dashboard using [Dashboard](action:navigate:/dashboard) or reply with [Hi](action:reply:Hi-Sara)'
      })
    })

    render(<ChatPanel />)

    // Assert buttons rendered
    const navBtn = screen.getByRole('button', { name: 'Dashboard' })
    const replyBtn = screen.getByRole('button', { name: 'Hi' })

    expect(navBtn).toBeInTheDocument()
    expect(replyBtn).toBeInTheDocument()

    // Test navigation action click
    fireEvent.click(navBtn)
    expect(mockPush).toHaveBeenCalledWith({ type: 'navigate', route: '/dashboard' })

    // Test reply action click
    fireEvent.click(replyBtn)
    expect(useSaraStore.getState().messages[1].content).toBe('Hi-Sara')
  })

  it('renders typing indicator bubble when loading state is true', () => {
    act(() => {
      useSaraStore.getState().setLoading(true)
    })

    const { container } = render(<ChatPanel />)
    const typingBubble = container.querySelector('[class*="typingBubble"]')
    expect(typingBubble).toBeInTheDocument()
  })
})
