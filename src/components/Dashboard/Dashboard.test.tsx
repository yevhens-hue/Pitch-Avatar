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

describe('Dashboard Component', () => {
  it('renders welcome message', () => {
    render(<Dashboard />)
    expect(screen.getByText('Добро пожаловать в Pitch Avatar')).toBeInTheDocument()
  })

  it('renders trial days alert', () => {
    render(<Dashboard />)
    expect(screen.getByText(/оставшихся пробных дней/)).toBeInTheDocument()
  })

  it('renders action card subtitles', () => {
    render(<Dashboard />)
    expect(screen.getByText('Настроить многоязычного AI-ассистента')).toBeInTheDocument()
    expect(screen.getByText('Добавить лицо и голос слайдам')).toBeInTheDocument()
    expect(screen.getByText('Переведите и озвучьте своё видео')).toBeInTheDocument()
    expect(screen.getByText('Создать с нуля')).toBeInTheDocument()
  })

  it('renders video section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Как это работает?')).toBeInTheDocument()
  })

  it('renders card links', () => {
    render(<Dashboard />)
    expect(screen.getByText('Сгенерируйте Чат-аватара →')).toBeInTheDocument()
    expect(screen.getByText('Сделайте слайды интерактивными →')).toBeInTheDocument()
    expect(screen.getByText('Загрузите ваше видео →')).toBeInTheDocument()
    expect(screen.getByText('Начните с чистого слайда →')).toBeInTheDocument()
  })

  it('calls onOpenPresentationModal when clicking a modal tab card', () => {
    const mockOnOpen = jest.fn()
    render(<Dashboard onOpenPresentationModal={mockOnOpen} />)

    const slidesCard = screen.getByText('Сделайте слайды интерактивными →')
    fireEvent.click(slidesCard)

    expect(mockOnOpen).toHaveBeenCalledWith('file')
  })

  it('renders video placeholder', () => {
    render(<Dashboard />)
    expect(screen.getByText('▶')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Dashboard />)
    expect(screen.getByText('Выберите, что вам нужно')).toBeInTheDocument()
  })

  it('renders 4 action cards', () => {
    render(<Dashboard />)
    const icons = document.querySelectorAll('[class*="cardIcon"]')
    expect(icons.length).toBe(4)
  })

  it('renders plan links', () => {
    render(<Dashboard />)
    expect(screen.getByText('Выберите тарифный план')).toBeInTheDocument()
    expect(screen.getByText('Запишитесь на демо')).toBeInTheDocument()
  })
})
