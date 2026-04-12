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
    expect(screen.getByText('Создать новую презентацию')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText(/Загрузите файл или выберите источник/)).toBeInTheDocument()
  })

  it('renders dropzone area', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Загрузить PDF или PPTX')).toBeInTheDocument()
    expect(screen.getByText('или перетащите файл сюда')).toBeInTheDocument()
  })

  it('renders file input', () => {
    render(<UploadStep onNext={mockOnNext} />)
    const label = screen.getByText('Выбрать файл')
    expect(label).toBeInTheDocument()
  })

  it('renders import source options', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Импорт из Canva')).toBeInTheDocument()
    expect(screen.getByText('Google Slides')).toBeInTheDocument()
    expect(screen.getByText('Импорт с сайта / Прези')).toBeInTheDocument()
  })

  it('renders create from scratch button', () => {
    render(<UploadStep onNext={mockOnNext} />)
    expect(screen.getByText('Создать с нуля')).toBeInTheDocument()
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
    expect(screen.getByText('или')).toBeInTheDocument()
  })
})
