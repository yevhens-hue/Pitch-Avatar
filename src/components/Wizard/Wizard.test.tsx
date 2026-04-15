import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Wizard from './Wizard'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('lucide-react', () => {
  const MockIcon = () => null
  return {
    Settings: MockIcon,
    User: MockIcon,
    Eye: MockIcon,
    Share2: MockIcon,
    ChevronRight: MockIcon,
    ChevronLeft: MockIcon,
    Check: MockIcon,
    Key: MockIcon,
    FileText: MockIcon,
    BookOpen: MockIcon,
    Sparkles: MockIcon,
    ArrowLeft: MockIcon,
    FileUp: MockIcon,
  }
})

describe('Wizard Component', () => {
  it('renders the wizard container', () => {
    render(<Wizard />)
    expect(document.querySelector('.wizardContainer')).toBeInTheDocument()
  })

  it('renders sidebar with step list', () => {
    render(<Wizard />)
    expect(screen.getByText('Creation Steps')).toBeInTheDocument()
  })

  it('renders all steps in sidebar', () => {
    render(<Wizard />)
    expect(screen.getByText('1. General Settings')).toBeInTheDocument()
    expect(screen.getByText('2. Avatar')).toBeInTheDocument()
    expect(screen.getByText('3. Role')).toBeInTheDocument()
    expect(screen.getByText('4. Instructions')).toBeInTheDocument()
    expect(screen.getByText('5. Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('6. Preview')).toBeInTheDocument()
    expect(screen.getByText('7. Share / Assign')).toBeInTheDocument()
  })

  it('renders step content for first step', () => {
    render(<Wizard />)
    expect(screen.getByText('General Settings')).toBeInTheDocument()
  })

  it('renders footer navigation buttons', () => {
    render(<Wizard />)
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('renders AI Assistant sidebar', () => {
    render(<Wizard />)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })
})