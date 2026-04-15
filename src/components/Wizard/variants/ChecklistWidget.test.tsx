import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ChecklistWidget from './ChecklistWidget'
import { useUIStore } from '@/lib/store'
import * as navigationModule from 'next/navigation'

const mockUsePathname = navigationModule.usePathname as jest.Mock

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: jest.fn(() => '/'),
}))

jest.mock('lucide-react', () => ({
  Check: (props: object) => <span data-testid="check" {...props}>✓</span>,
  ChevronDown: (props: object) => <span data-testid="chevron-down" {...props}>▼</span>,
  Play: (props: object) => <span data-testid="play" {...props}>▶</span>,
  FileText: (props: object) => <span data-testid="file-text" {...props}>📄</span>,
  UserCircle: (props: object) => <span data-testid="user-circle" {...props}>👤</span>,
  BookOpen: (props: object) => <span data-testid="book-open" {...props}>📖</span>,
  Share2: (props: object) => <span data-testid="share-2" {...props}>🔗</span>,
  Gift: (props: object) => <span data-testid="gift" {...props}>🎁</span>,
  HelpCircle: (props: object) => <span data-testid="help-circle" {...props}>❓</span>,
  ArrowRight: (props: object) => <span data-testid="arrow-right" {...props}>→</span>,
}))

const renderWidget = () => render(<ChecklistWidget />)

describe('ChecklistWidget Component', () => {
  beforeEach(() => {
    useUIStore.setState({
      isChecklistOpen: true,
      currentChecklistStep: 0,
      isChecklistMinimized: false,
      isTourActive: false,
    })
  })

  it('renders the widget header', () => {
    renderWidget()
    expect(screen.getByText('Launch Checklist')).toBeInTheDocument()
  })

  it('shows step count', () => {
    renderWidget()
    expect(screen.getByText('1/5')).toBeInTheDocument()
  })

  it('shows reward badge', () => {
    renderWidget()
    expect(screen.getByText('+5 AI min reward')).toBeInTheDocument()
  })

  it('renders all onboarding steps', () => {
    renderWidget()
    expect(screen.getByText('Pick a Creation Method')).toBeInTheDocument()
    expect(screen.getByText('Pick a Persona')).toBeInTheDocument()
    expect(screen.getByText('Feed the AI')).toBeInTheDocument()
    expect(screen.getByText('Final Polish')).toBeInTheDocument()
    expect(screen.getByText('Broadcast your Avatar')).toBeInTheDocument()
  })

  it('highlights active step with correct styling', () => {
    useUIStore.setState({ currentChecklistStep: 1 })
    renderWidget()
    const stepElement = screen.getByText('Pick a Persona')
    expect(stepElement).toBeInTheDocument()
  })

  it('renders progress circle in minimized state', () => {
    useUIStore.setState({ isChecklistMinimized: true })
    renderWidget()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})