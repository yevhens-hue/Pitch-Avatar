import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Library from './Library'

describe('Library Component', () => {
  it('renders page title', () => {
    render(<Library />)
    expect(screen.getByText('Мои презентации')).toBeInTheDocument()
  })

  it('renders all presentation rows', () => {
    render(<Library />)
    expect(screen.getByText('Product Demo - Q1')).toBeInTheDocument()
    expect(screen.getByText('Sales Pitch April')).toBeInTheDocument()
    expect(screen.getByText('Company Overview')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Library />)
    expect(screen.getByText('Название')).toBeInTheDocument()
    expect(screen.getByText('Обновлено')).toBeInTheDocument()
    expect(screen.getByText('Слайды')).toBeInTheDocument()
    expect(screen.getByText('Просмотры')).toBeInTheDocument()
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })

  it('filters presentations by search', () => {
    render(<Library />)
    const searchInput = screen.getByPlaceholderText('Поиск по названию...')

    fireEvent.change(searchInput, { target: { value: 'Product' } })

    expect(screen.getByText('Product Demo - Q1')).toBeInTheDocument()
    expect(screen.queryByText('Sales Pitch April')).not.toBeInTheDocument()
  })

  it('filters presentations case-insensitively', () => {
    render(<Library />)
    const searchInput = screen.getByPlaceholderText('Поиск по названию...')

    fireEvent.change(searchInput, { target: { value: 'product' } })

    expect(screen.getByText('Product Demo - Q1')).toBeInTheDocument()
  })

  it('opens LinkSettings when clicking gear button', () => {
    render(<Library />)
    const gearButtons = screen.getAllByTitle('Настройки ссылки')

    fireEvent.click(gearButtons[0])

    expect(screen.getByText('Настройки ссылки')).toBeInTheDocument()
  })

  it('closes LinkSettings when clicking close', () => {
    render(<Library />)
    const gearButtons = screen.getAllByTitle('Настройки ссылки')

    fireEvent.click(gearButtons[0])
    const closeBtn = screen.getByText('✕')
    fireEvent.click(closeBtn)

    expect(screen.queryByText('Основные')).not.toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Library />)
    expect(screen.getByPlaceholderText('Поиск по названию...')).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<Library />)
    expect(screen.getByText('Создать презентацию')).toBeInTheDocument()
  })
})
