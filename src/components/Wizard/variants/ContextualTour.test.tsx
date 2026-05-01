import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import ContextualTour from './ContextualTour'
import { useUIStore } from '@/lib/store'
import { act } from 'react-dom/test-utils'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: jest.fn(() => '/'),
}))

jest.mock('lucide-react', () => ({
  X: (props: object) => <span data-testid="x" {...props}>✕</span>,
  ArrowRight: (props: object) => <span data-testid="arrow-right" {...props}>→</span>,
  MousePointer2: (props: object) => <span data-testid="mouse-pointer" {...props}>👆</span>,
}))

describe('ContextualTour Component', () => {
  beforeEach(() => {
    useUIStore.setState({
      isTourActive: true,
      activeTourStep: 0,
    })
    
    const mockElement = document.createElement('div')
    mockElement.setAttribute('data-tour', 'quick-start')
    mockElement.scrollIntoView = jest.fn()
    Object.defineProperty(mockElement, 'getBoundingClientRect', {
      writable: true,
      value: jest.fn().mockReturnValue({ top: 100, left: 100, width: 200, height: 50, right: 300, bottom: 150, x: 100, y: 100, toJSON: () => '' }),
    })
    document.querySelector = jest.fn().mockReturnValue(mockElement)
    document.addEventListener = jest.fn()
    document.removeEventListener = jest.fn()
    window.requestAnimationFrame = jest.fn((cb) => { (cb as () => void)(); return 1; }) as typeof requestAnimationFrame
    
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders nothing when tour is not active', async () => {
    useUIStore.setState({ isTourActive: false })
    const { container } = render(<ContextualTour />)
    // Wait for any potential updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(container.firstChild).toBeNull()
  })

  it('renders step title when tour is active', async () => {
    render(<ContextualTour />)
    // Advance timers and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(200)
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Pick a Creation Method')).toBeInTheDocument()
    })
  })

  it('shows progress indicator', async () => {
    render(<ContextualTour />)
    // Advance timers and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(200)
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    await waitFor(() => {
      expect(screen.getByText('1 of 5')).toBeInTheDocument()
    })
  })

  it('renders navigation buttons', async () => {
    render(<ContextualTour />)
    // Advance timers and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(200)
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Skip')).toBeInTheDocument()
    })
  })

  it('renders Finish on last step', async () => {
    useUIStore.setState({ activeTourStep: 4 })
    
    const mockElement = document.createElement('div')
    mockElement.setAttribute('data-tour', 'share-link')
    mockElement.scrollIntoView = jest.fn()
    Object.defineProperty(mockElement, 'getBoundingClientRect', {
      writable: true,
      value: jest.fn().mockReturnValue({ top: 100, left: 100, width: 200, height: 50, right: 300, bottom: 150, x: 100, y: 100, toJSON: () => '' }),
    })
    document.querySelector = jest.fn().mockReturnValue(mockElement)

    render(<ContextualTour />)
    // Advance timers and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(200)
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Finish')).toBeInTheDocument()
    })
  })
})