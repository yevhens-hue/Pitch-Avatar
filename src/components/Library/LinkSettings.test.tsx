import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import LinkSettings from './LinkSettings'

describe('LinkSettings Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    presentationName: 'Test Presentation',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<LinkSettings {...defaultProps} isOpen={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders modal when isOpen is true', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Link Settings')).toBeInTheDocument()
  })

  it('renders presentation name', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Test Presentation')).toBeInTheDocument()
  })

  it('renders all tabs', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Personalization')).toBeInTheDocument()
    expect(screen.getByText('Lead Form')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('renders basic settings by default', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Link Name')).toBeInTheDocument()
    expect(screen.getByText('Host Email')).toBeInTheDocument()
    expect(screen.getByText('Calendar Link')).toBeInTheDocument()
  })

  it('switches to lead form tab', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Lead Form'))

    expect(screen.getByText('On-demand Lead Form')).toBeInTheDocument()
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()
  })

  it('calls onClose when clicking close button', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('✕'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking overlay', () => {
    render(<LinkSettings {...defaultProps} />)
    const overlay = screen.getByText('✕').closest('div[class*="overlay"]')
    if (overlay) fireEvent.click(overlay)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('renders footer with copy link', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('renders notification toggle as button with aria-label', () => {
    render(<LinkSettings {...defaultProps} />)
    const toggle = screen.getByLabelText('Enable notifications when link is opened')
    expect(toggle).toBeInTheDocument()
    expect(toggle.tagName).toBe('BUTTON')
  })

  it('renders lead form toggle as button', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Lead Form'))
    const toggle = screen.getByLabelText('Enable lead form')
    expect(toggle).toBeInTheDocument()
    expect(toggle.tagName).toBe('BUTTON')
  })

  it('renders lead field toggles as buttons', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Lead Form'))

    const nameToggle = screen.getByLabelText('Enable field First Name')
    expect(nameToggle).toBeInTheDocument()
    expect(nameToggle.tagName).toBe('BUTTON')
    expect(nameToggle).toHaveAttribute('aria-pressed', 'false')
  })
})