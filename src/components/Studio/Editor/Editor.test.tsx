import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Editor from './Editor'

describe('StudioEditor Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders editor with slides panel', () => {
    render(<Editor />)
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
    expect(screen.getByText('Slide 3')).toBeInTheDocument()
  })

  it('renders slide preview', () => {
    render(<Editor />)
    expect(screen.getByText('Слайд 1')).toBeInTheDocument()
  })

  it('renders AI avatar section', () => {
    render(<Editor />)
    expect(screen.getByText('ИИ-Аватар')).toBeInTheDocument()
  })

  it('renders script textarea', () => {
    render(<Editor />)
    expect(screen.getByPlaceholderText('Напишите здесь, что должен сказать аватар на этом слайде...')).toBeInTheDocument()
  })

  it('updates character count when typing', () => {
    render(<Editor />)
    const textarea = screen.getByPlaceholderText('Напишите здесь, что должен сказать аватар на этом слайде...')

    fireEvent.change(textarea, { target: { value: 'Hello' } })

    expect(screen.getByText('5 / 500')).toBeInTheDocument()
  })

  it('renders voice select', () => {
    render(<Editor />)
    expect(screen.getByText('Русский (Дмитрий, Спокойный)')).toBeInTheDocument()
    expect(screen.getByText('Английский (Alex, Professional)')).toBeInTheDocument()
  })

  it('renders generate video button', () => {
    render(<Editor />)
    expect(screen.getByText('Сгенерировать видео')).toBeInTheDocument()
  })

  it('switches active slide on click', () => {
    render(<Editor />)
    const slide2 = screen.getByText('Slide 2')
    fireEvent.click(slide2)

    expect(screen.getByText('Слайд 2')).toBeInTheDocument()
  })

  it('shows rendering state when generating', () => {
    render(<Editor />)
    fireEvent.click(screen.getByText('Сгенерировать видео'))

    expect(screen.getByText('Ваше видео генерируется...')).toBeInTheDocument()
    expect(screen.getByText(/ИИ-аватар произносит ваш текст/)).toBeInTheDocument()
  })

  it('renders add slide button', () => {
    render(<Editor />)
    const addBtn = document.querySelector('button[class*="addSlideBtn"]')
    expect(addBtn).toBeInTheDocument()
  })

  it('renders voice section', () => {
    render(<Editor />)
    expect(screen.getByText('Голос и язык')).toBeInTheDocument()
  })

  it('renders initial character count', () => {
    render(<Editor />)
    expect(screen.getByText('0 / 500')).toBeInTheDocument()
  })
})
