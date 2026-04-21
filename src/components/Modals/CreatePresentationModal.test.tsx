import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import CreatePresentationModal from './CreatePresentationModal'

describe('CreatePresentationModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<CreatePresentationModal {...defaultProps} isOpen={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders modal when isOpen is true', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Create New Presentation')).toBeInTheDocument()
  })

  it('renders presentation name input', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByPlaceholderText('Presentation Name')).toBeInTheDocument()
  })

  it('renders all tabs', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Upload File')).toBeInTheDocument()
    expect(screen.getByText('Upload Video')).toBeInTheDocument()
    expect(screen.getByText('Start from scratch')).toBeInTheDocument()
  })

  it('switches to video tab', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Upload Video'))

    expect(screen.getByPlaceholderText('YouTube Link')).toBeInTheDocument()
  })

  it('renders advanced settings toggle', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText(/Advanced Settings/)).toBeInTheDocument()
  })

  it('toggles advanced settings', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/Advanced Settings/))

    expect(screen.getByText('Presentation Goals')).toBeInTheDocument()
    expect(screen.getByText('Text Script Settings')).toBeInTheDocument()
    expect(screen.getByText('AI Video Avatar & Voice Settings')).toBeInTheDocument()
  })

  it('calls onClose when clicking close button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('✕'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking cancel button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('renders footer buttons', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('renders file dropzone with drag-and-drop support', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Drag & drop files here')).toBeInTheDocument()
    expect(screen.getByText('or click to choose')).toBeInTheDocument()
  })

  it('renders Google Drive option', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Google Drive')).toBeInTheDocument()
  })

  it('renders helper text for file upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText(/Upload .pdf, .ppt or .pptx/)).toBeInTheDocument()
  })

  it('renders helper text for video upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Upload Video'))
    expect(screen.getByText(/Upload .mp4 video/)).toBeInTheDocument()
  })

  it('sets default tab from props', () => {
    render(<CreatePresentationModal {...defaultProps} defaultTab="video" />)
    expect(screen.getByPlaceholderText('YouTube Link')).toBeInTheDocument()
  })

  it('renders avatar section in advanced settings', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/Advanced Settings/))

    expect(screen.getByText('AI Video Avatar & Voice Settings')).toBeInTheDocument()
    expect(screen.getByText('Add Your Own')).toBeInTheDocument()
  })

  it('renders voice settings in advanced', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/Advanced Settings/))

    expect(screen.getByText('Voice')).toBeInTheDocument()
    expect(screen.getByText('AI Library')).toBeInTheDocument()
    expect(screen.getByText('Cloned Voices')).toBeInTheDocument()
  })

  it('does not propagate click from modal to overlay', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const modal = screen.getByText('Create New Presentation').closest('div[class*="modal"]')
    if (modal) fireEvent.click(modal)
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('renders close button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const closeBtn = screen.getByText('✕')
    expect(closeBtn).toBeInTheDocument()
  })

  it('renders "Choose from" text for file upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Choose from')).toBeInTheDocument()
  })

  it('renders "Choose from" text for video upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Upload Video'))
    expect(screen.getByText('Choose from')).toBeInTheDocument()
  })

  it('renders disabled create button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const createBtn = screen.getByText('Create')
    expect(createBtn).toBeDisabled()
  })

  it('renders create button with correct class', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const createBtn = screen.getByText('Create')
    expect(createBtn.className).toContain('createBtn')
  })
})
