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

jest.mock('../ProjectEditor/panels/CoachQASetPanel', () => function MockCoachQASetPanel() {
  return <div>1. Coach Q&A Set</div>
})
jest.mock('../ProjectEditor/panels/CoachSettingsPanel', () => function MockCoachSettingsPanel() {
  return <div>2. Coach Settings</div>
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
    expect(screen.getByText('4. Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('5. Coach')).toBeInTheDocument()
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

  it('renders default wizard steps including Knowledge Base and Coach', () => {
    render(<Wizard />)
    
    // Default steps check
    expect(screen.getByText('4. Knowledge Base')).toBeInTheDocument()
    expect(screen.getByText('5. Coach')).toBeInTheDocument()
    expect(screen.queryByText('4. Coach Q&A Set')).not.toBeInTheDocument()
    expect(screen.queryByText('5. Coach Settings')).not.toBeInTheDocument()
  })

  it('renders Coach Setup and sections on Coach step when enabled', () => {
    render(<Wizard />)
    
    // Navigate to step 5 (Coach)
    const nextBtn = screen.getByText('Next')
    fireEvent.click(nextBtn) // goes to step 2 (Avatar)
    fireEvent.click(nextBtn) // goes to step 3 (Role)
    fireEvent.click(nextBtn) // goes to step 4 (Knowledge Base)
    fireEvent.click(nextBtn) // goes to step 5 (Coach)

    expect(screen.getAllByText('Coach Mode').length).toBeGreaterThan(0)

    // Click Enable Coach Mode
    const coachToggle = screen.getByRole('checkbox', { name: /coach mode/i })
    fireEvent.click(coachToggle)

    // Coach sub-sections should now be visible
    expect(screen.getAllByText('1. Coach Q&A Set').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2. Coach Settings').length).toBeGreaterThan(0)
  })
})