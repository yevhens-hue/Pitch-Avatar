import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Wizard from './Wizard'



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
    GraduationCap: MockIcon,
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
    expect(screen.getByText('7. Share / Enroll')).toBeInTheDocument()
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
    expect(screen.getByText('Onboarding Progress')).toBeInTheDocument()
  })

  it('renders Coach Setup toggle on Role step and dynamically updates steps when enabled', () => {
    render(<Wizard />)
    
    // Default steps
    expect(screen.getByText('4. Instructions')).toBeInTheDocument()
    expect(screen.queryByText('4. Coach Q&A Set')).not.toBeInTheDocument()
    expect(screen.queryByText('5. Coach Settings')).not.toBeInTheDocument()
    expect(screen.getByText('5. Knowledge Base')).toBeInTheDocument()

    // Navigate to step 3 (Role) where the CoachSetup is located
    const nextBtn = screen.getByText('Next')
    fireEvent.click(nextBtn) // goes to step 2
    fireEvent.click(nextBtn) // goes to step 3

    expect(screen.getByText('Job Title / Persona')).toBeInTheDocument()

    // Click Enable Coach Mode
    const coachToggle = screen.getByRole('checkbox', { name: /enable coach mode/i })
    fireEvent.click(coachToggle)

    // The steps should now be updated dynamically
    expect(screen.queryByText('4. Instructions')).not.toBeInTheDocument()
    expect(screen.getByText('4. Coach Q&A Set')).toBeInTheDocument()
    expect(screen.getByText('5. Coach Settings')).toBeInTheDocument()
    expect(screen.getByText('6. Knowledge Base')).toBeInTheDocument()
  })
})