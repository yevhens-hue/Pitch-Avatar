import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import VideoLibrary from './page'

describe('Video Page', () => {
  it('renders page title', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Мои Видео')).toBeInTheDocument()
  })

  it('renders upload button', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('+ Загрузить видео')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Название видео')).toBeInTheDocument()
    expect(screen.getByText('Длительность')).toBeInTheDocument()
    expect(screen.getByText('Переведено на')).toBeInTheDocument()
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })

  it('renders video rows', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Product Update Q1.mp4')).toBeInTheDocument()
    expect(screen.getByText('Onboarding Tutorial.mp4')).toBeInTheDocument()
  })

  it('renders video durations', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('03:45')).toBeInTheDocument()
    expect(screen.getByText('12:20')).toBeInTheDocument()
  })

  it('renders translation info', () => {
    render(<VideoLibrary />)
    expect(screen.getByText('Spanish, German')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('renders settings buttons with aria-label', () => {
    render(<VideoLibrary />)
    const settingsBtns = screen.getAllByLabelText('Настройки видео')
    expect(settingsBtns.length).toBe(2)
  })
})
