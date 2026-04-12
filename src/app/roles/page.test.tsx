import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Roles from './page'

describe('Roles Page', () => {
  it('renders page title', () => {
    render(<Roles />)
    expect(screen.getByText('Роли ИИ-Аватара')).toBeInTheDocument()
  })

  it('renders create role button', () => {
    render(<Roles />)
    expect(screen.getByText('+ Создать Роль')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Roles />)
    expect(screen.getByText(/Назначайте ИИ-ассистентам роли/)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Roles />)
    expect(screen.getByText('Название роли')).toBeInTheDocument()
    expect(screen.getByText('Описание')).toBeInTheDocument()
    expect(screen.getByText('Дата создания')).toBeInTheDocument()
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })

  it('renders role rows', () => {
    render(<Roles />)
    expect(screen.getByText('Специалист по продажам (IT)')).toBeInTheDocument()
    expect(screen.getByText('HR Менеджер')).toBeInTheDocument()
    expect(screen.getByText('Служба поддержки')).toBeInTheDocument()
  })

  it('renders role descriptions', () => {
    render(<Roles />)
    expect(screen.getByText('Ассистент для продажи SaaS продуктов')).toBeInTheDocument()
    expect(screen.getByText('Отвечает на частые вопросы кандидатов')).toBeInTheDocument()
    expect(screen.getByText('Техническая помощь пользователям')).toBeInTheDocument()
  })

  it('renders settings buttons with aria-label', () => {
    render(<Roles />)
    const settingsBtns = screen.getAllByLabelText('Настройки роли')
    expect(settingsBtns.length).toBe(3)
  })

  it('renders delete buttons with aria-label', () => {
    render(<Roles />)
    const deleteBtns = screen.getAllByLabelText('Удалить роль')
    expect(deleteBtns.length).toBe(3)
  })
})
