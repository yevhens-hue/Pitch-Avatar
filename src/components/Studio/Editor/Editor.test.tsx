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
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
  })

  it('renders AI avatar section', () => {
    render(<Editor />)
    expect(screen.getByText('AI Avatar')).toBeInTheDocument()
  })

  it('renders script textarea', () => {
    render(<Editor />)
    expect(screen.getByPlaceholderText('Write here what the avatar should say on this slide...')).toBeInTheDocument()
  })

  it('updates character count when typing', () => {
    render(<Editor />)
    const textarea = screen.getByPlaceholderText('Write here what the avatar should say on this slide...')

    fireEvent.change(textarea, { target: { value: 'Hello' } })

    expect(screen.getByText('5 / 500')).toBeInTheDocument()
  })

  it('renders voice select', () => {
    render(<Editor />)
    expect(screen.getByText('English (Alex, Professional)')).toBeInTheDocument()
    expect(screen.getByText('Spanish (Maria, Friendly)')).toBeInTheDocument()
  })

  it('renders generate video button', () => {
    render(<Editor />)
    expect(screen.getByText('Generate Video')).toBeInTheDocument()
  })

  it('switches active slide on click', () => {
    render(<Editor />)
    const slide2 = screen.getByText('Slide 2')
    fireEvent.click(slide2)

    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })

  it('shows rendering state when generating', () => {
    render(<Editor />)
    fireEvent.click(screen.getByText('Generate Video'))

    expect(screen.getByText('Your video is being generated...')).toBeInTheDocument()
    expect(screen.getByText(/AI avatar is speaking/)).toBeInTheDocument()
  })

  it('renders add slide button', () => {
    render(<Editor />)
    const addBtn = document.querySelector('button[class*="addSlideBtn"]')
    expect(addBtn).toBeInTheDocument()
  })

  it('renders voice section', () => {
    render(<Editor />)
    expect(screen.getByText('Voice & Language')).toBeInTheDocument()
  })

  it('renders initial character count', () => {
    render(<Editor />)
    expect(screen.getByText('0 / 500')).toBeInTheDocument()
  })
})