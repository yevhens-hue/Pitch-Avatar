import { renderHook, act } from '@testing-library/react'
import { useSaraActions } from './useSaraActions'
import { useSaraStore } from '../store/useSaraStore'

describe('useSaraActions (Outbound API)', () => {
  let onActionMock: jest.Mock
  let dispatchEventSpy: jest.SpyInstance
  let postMessageSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    onActionMock = jest.fn()
    
    // Mock the Zustand store config to include the callback
    useSaraStore.setState({
      config: {
        onAction: onActionMock
      }
    })

    // Spy on window.dispatchEvent
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation()

    // Spy on window.parent.postMessage directly
    postMessageSpy = jest.spyOn(window.parent, 'postMessage').mockImplementation()
  })

  afterEach(() => {
    dispatchEventSpy.mockRestore()
    postMessageSpy.mockRestore()
  })

  it('should call config.onAction callback if provided', () => {
    const { result } = renderHook(() => useSaraActions())
    
    act(() => {
      result.current.startTour('tour_123')
    })

    expect(onActionMock).toHaveBeenCalledTimes(1)
    expect(onActionMock).toHaveBeenCalledWith('start_tour', { type: 'start_tour', tourId: 'tour_123' })
  })

  it('should call window.parent.postMessage for cross-origin iframe support', () => {
    const { result } = renderHook(() => useSaraActions())
    
    act(() => {
      result.current.navigateTo('/pricing')
    })

    expect(postMessageSpy).toHaveBeenCalledTimes(1)
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'PITCH_AVATAR_ACTION', payload: { action: 'navigate', data: { type: 'navigate', route: '/pricing' } } },
      '*'
    )
  })

  it('should dispatch CustomEvent for local script integration', () => {
    const { result } = renderHook(() => useSaraActions())
    
    act(() => {
      result.current.startTour('tour_123')
    })

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
    
    const dispatchedEvent = dispatchEventSpy.mock.calls[0][0] as CustomEvent
    expect(dispatchedEvent.type).toBe('sara:action')
    expect(dispatchedEvent.detail).toEqual({ type: 'start_tour', tourId: 'tour_123' })
  })
})
