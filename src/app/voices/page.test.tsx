import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Voices from './page'

describe('Voices Page', () => {
  it('renders page title', () => {
    render(<Voices />)
    expect(screen.getByText('Мои Голоса')).toBeInTheDocument()
  })

  it('renders clone voice button', () => {
    render(<Voices />)
    expect(screen.getByText('Клонировать новый голос')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Voices />)
    expect(screen.getByText(/Создавайте цифрового клона своего голоса/)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Voices />)
    expect(screen.getByText('Название голоса')).toBeInTheDocument()
    expect(screen.getByText('Тип')).toBeInTheDocument()
    expect(screen.getByText('Языки')).toBeInTheDocument()
    expect(screen.getByText('Дата создания')).toBeInTheDocument()
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })

  it('renders voice rows', () => {
    render(<Voices />)
    expect(screen.getByText('John Doe Voice Clone')).toBeInTheDocument()
    expect(screen.getByText('Libby Professional')).toBeInTheDocument()
    expect(screen.getByText('Anna Friendly')).toBeInTheDocument()
  })

  it('renders voice types', () => {
    render(<Voices />)
    expect(screen.getAllByText('Клонированный голос').length).toBe(1)
    expect(screen.getAllByText('Библиотека ИИ').length).toBe(2)
  })

  it('shows play/delete buttons only for cloned voices', () => {
    render(<Voices />)
    const playButtons = screen.getAllByLabelText('Прослушать голос')
    const deleteButtons = screen.getAllByLabelText('Удалить голос')
    expect(playButtons.length).toBe(1)
    expect(deleteButtons.length).toBe(1)
  })

  it('renders languages', () => {
    render(<Voices />)
    expect(screen.getByText('English / Russian')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Russian')).toBeInTheDocument()
  })
})
