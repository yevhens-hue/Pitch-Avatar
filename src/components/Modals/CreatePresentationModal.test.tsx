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
    expect(screen.getByText('Создать новую презентацию')).toBeInTheDocument()
  })

  it('renders presentation name input', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByPlaceholderText('Название презентации')).toBeInTheDocument()
  })

  it('renders all tabs', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Загрузить файл')).toBeInTheDocument()
    expect(screen.getByText('Загрузить видео')).toBeInTheDocument()
    expect(screen.getByText('Начать с нуля')).toBeInTheDocument()
  })

  it('switches to video tab', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Загрузить видео'))

    expect(screen.getByPlaceholderText('Ссылка на YouTube')).toBeInTheDocument()
  })

  it('renders advanced settings toggle', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText(/Расширенные настройки/)).toBeInTheDocument()
  })

  it('toggles advanced settings', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/Расширенные настройки/))

    expect(screen.getByText('Цели презентации')).toBeInTheDocument()
    expect(screen.getByText('Настройки текст-скрипта')).toBeInTheDocument()
    expect(screen.getByText('Настройки видео аватара и голоса')).toBeInTheDocument()
  })

  it('calls onClose when clicking close button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('✕'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking cancel button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Отмена'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('renders footer buttons', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Отмена')).toBeInTheDocument()
    expect(screen.getByText('Создать')).toBeInTheDocument()
  })

  it('renders file dropzone with drag-and-drop support', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Перетащите файлы сюда')).toBeInTheDocument()
    expect(screen.getByText('или нажмите, чтобы выбрать')).toBeInTheDocument()
  })

  it('renders Google Drive option', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Google Drive')).toBeInTheDocument()
  })

  it('renders helper text for file upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText(/Загрузите файл .pdf, .ppt или .pptx/)).toBeInTheDocument()
  })

  it('renders helper text for video upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Загрузить видео'))
    expect(screen.getByText(/Загрузите видео .mp4/)).toBeInTheDocument()
  })

  it('sets default tab from props', () => {
    render(<CreatePresentationModal {...defaultProps} defaultTab="video" />)
    expect(screen.getByPlaceholderText('Ссылка на YouTube')).toBeInTheDocument()
  })

  it('renders avatar section in advanced settings', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/Расширенные настройки/))

    expect(screen.getByText('ИИ-аватар')).toBeInTheDocument()
    expect(screen.getByText('Добавить собственное')).toBeInTheDocument()
  })

  it('renders voice settings in advanced', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/Расширенные настройки/))

    expect(screen.getByText('Голос')).toBeInTheDocument()
    expect(screen.getByText('ИИ Библиотека')).toBeInTheDocument()
    expect(screen.getByText('Клонированные голоса')).toBeInTheDocument()
  })

  it('does not propagate click from modal to overlay', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const modal = screen.getByText('Создать новую презентацию').closest('div[class*="modal"]')
    if (modal) fireEvent.click(modal)
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('renders close button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const closeBtn = screen.getByText('✕')
    expect(closeBtn).toBeInTheDocument()
  })

  it('renders "Выберите из" text for file upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    expect(screen.getByText('Выберите из')).toBeInTheDocument()
  })

  it('renders "Выберите из" text for video upload', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Загрузить видео'))
    expect(screen.getByText('Выберите из')).toBeInTheDocument()
  })

  it('renders disabled create button', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const createBtn = screen.getByText('Создать')
    expect(createBtn).toBeDisabled()
  })

  it('renders create button with correct class', () => {
    render(<CreatePresentationModal {...defaultProps} />)
    const createBtn = screen.getByText('Создать')
    expect(createBtn.className).toContain('createBtn')
  })
})
