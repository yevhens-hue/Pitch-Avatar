import { renderHook, act } from '@testing-library/react'
import { useSaraActions } from './useSaraActions'
import { useUIStore } from '@/lib/store'

// Mock the global UI store
jest.mock('@/lib/store', () => ({
  useUIStore: jest.fn(),
}))

describe('useSaraActions', () => {
  let openGuideMock: jest.Mock

  beforeEach(() => {
    openGuideMock = jest.fn()
    ;(useUIStore as unknown as jest.Mock).mockReturnValue({
      openGuide: openGuideMock,
    })
  })

  it('startTour should call openGuide from useUIStore', () => {
    const { result } = renderHook(() => useSaraActions())
    
    act(() => {
      result.current.startTour('create_video_tour' as any)
    })

    expect(openGuideMock).toHaveBeenCalledTimes(1)
  })
})
