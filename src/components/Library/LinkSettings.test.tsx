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
    expect(screen.getByText('Настройки ссылки')).toBeInTheDocument()
  })

  it('renders presentation name', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Test Presentation')).toBeInTheDocument()
  })

  it('renders all tabs', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Основные')).toBeInTheDocument()
    expect(screen.getByText('Персонализация')).toBeInTheDocument()
    expect(screen.getByText('Лид-форма')).toBeInTheDocument()
    expect(screen.getByText('Расширенные')).toBeInTheDocument()
  })

  it('renders basic settings by default', () => {
    render(<LinkSettings {...defaultProps} />)
    expect(screen.getByText('Название ссылки')).toBeInTheDocument()
    expect(screen.getByText('Email ведущего')).toBeInTheDocument()
    expect(screen.getByText('Ссылка на календарь')).toBeInTheDocument()
  })

  it('switches to lead form tab', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Лид-форма'))

    expect(screen.getByText('Лид-форма по запросу')).toBeInTheDocument()
    expect(screen.getByText('Имя')).toBeInTheDocument()
    expect(screen.getByText('Фамилия')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Компания')).toBeInTheDocument()
    expect(screen.getByText('Страна')).toBeInTheDocument()
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
    expect(screen.getByText('Копировать')).toBeInTheDocument()
  })

  it('renders notification toggle as button with aria-label', () => {
    render(<LinkSettings {...defaultProps} />)
    const toggle = screen.getByLabelText('Включить уведомления при открытии ссылки')
    expect(toggle).toBeInTheDocument()
    expect(toggle.tagName).toBe('BUTTON')
  })

  it('renders lead form toggle as button', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Лид-форма'))
    const toggle = screen.getByLabelText('Включить лид-форму')
    expect(toggle).toBeInTheDocument()
    expect(toggle.tagName).toBe('BUTTON')
  })

  it('renders lead field toggles as buttons', () => {
    render(<LinkSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Лид-форма'))

    const nameToggle = screen.getByLabelText('Включить поле Имя')
    expect(nameToggle).toBeInTheDocument()
    expect(nameToggle.tagName).toBe('BUTTON')
    expect(nameToggle).toHaveAttribute('aria-pressed', 'false')
  })
})
