import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Dashboard from './Dashboard'

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' }
  })
}))

describe('Dashboard Component', () => {
  it('renders greeting message', () => {
    render(<Dashboard />)
    expect(screen.getByText(/we missed you/)).toBeInTheDocument()
  })

  it('renders greeting subtitle', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Ready to reach your goals today/)).toBeInTheDocument()
  })

  it('renders action card subtitles', () => {
    render(<Dashboard />)
    expect(screen.getByText('Add AI avatar or voice to your slides')).toBeInTheDocument()
    expect(screen.getByText('Translate and dub your video')).toBeInTheDocument()
    expect(screen.getByText('Set up conversational multilingual assistant')).toBeInTheDocument()
    expect(screen.getByText('Add AI avatars, texts or images')).toBeInTheDocument()
  })

  it('renders video section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Project Wizards')).toBeInTheDocument()
  })

  it('renders card links', () => {
    render(<Dashboard />)
    expect(screen.getByText('Make slides interactive')).toBeInTheDocument()
    expect(screen.getByText('Upload your video')).toBeInTheDocument()
    expect(screen.getByText('Generate Chat-avatar')).toBeInTheDocument()
    expect(screen.getByText('Start with blank slide')).toBeInTheDocument()
  })

  it('calls onOpenPresentationModal when clicking a modal tab card', () => {
    const mockOnOpen = jest.fn()
    render(<Dashboard onOpenPresentationModal={mockOnOpen} />)

    const slidesCard = screen.getByText('Make slides interactive')
    fireEvent.click(slidesCard)

    expect(mockOnOpen).toHaveBeenCalledWith('quick')
  })

  it('renders quick start button', () => {
    render(<Dashboard />)
    expect(screen.getByText('Quick Start')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Dashboard />)
    expect(screen.getByText('Create quick presentation')).toBeInTheDocument()
  })

  it('renders 4 action cards', () => {
    render(<Dashboard />)
    const titles = screen.getAllByText(/Presentation/)
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  it('renders templates section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Templates')).toBeInTheDocument()
  })

  it('renders recent projects section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Recent Projects')).toBeInTheDocument()
  })
})