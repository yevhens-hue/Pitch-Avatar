import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import UploadStep from './UploadStep'

describe('UploadStep Component', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page title', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Create New Presentation')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText(/Upload a file or choose a source/)).toBeInTheDocument()
  })

  it('renders dropzone area', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Upload PDF or PPTX')).toBeInTheDocument()
    expect(screen.getByText('or drag & drop file here')).toBeInTheDocument()
  })

  it('renders file input', () => {
    render(<UploadStep onNext={mockOnNext} />)
    const label = screen.getByText('Choose File')
    expect(label).toBeInTheDocument()
  })

  it('renders import source options', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Canva Import')).toBeInTheDocument()
    expect(screen.getByText('Google Slides')).toBeInTheDocument()
    expect(screen.getByText('Website / Prezi Import')).toBeInTheDocument()
  })

  it('renders create from scratch button', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Create from scratch')).toBeInTheDocument()
  })

  it('calls onNext when file is selected', () => {
    render(<UploadStep onNext={mockOnNext} />)
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    expect(mockOnNext).toHaveBeenCalledWith(file)
  })

  it('renders divider text', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('or')).toBeInTheDocument()
  })
})