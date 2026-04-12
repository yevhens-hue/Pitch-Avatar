import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Links from './page'

describe('Links Page', () => {
  it('renders page title', () => {
    render(<Links />)
    expect(screen.getByText('Мои Ссылки')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Links />)
    expect(screen.getByText('Ссылка / Презентация')).toBeInTheDocument()
    expect(screen.getByText('Клики')).toBeInTheDocument()
    expect(screen.getByText('Собранные лиды')).toBeInTheDocument()
    expect(screen.getByText('Дата создания')).toBeInTheDocument()
    expect(screen.getByText('Действия')).toBeInTheDocument()
  })

  it('renders link rows', () => {
    render(<Links />)
    expect(screen.getByText('pitch-avatar.com/v/x8K9m2')).toBeInTheDocument()
    expect(screen.getByText('pitch-avatar.com/v/12abCD')).toBeInTheDocument()
  })

  it('renders presentation names', () => {
    render(<Links />)
    expect(screen.getByText('Презентация: Product Demo - Q1')).toBeInTheDocument()
    expect(screen.getByText('Презентация: Sales Pitch April')).toBeInTheDocument()
  })

  it('renders copy button with aria-label', () => {
    render(<Links />)
    const copyBtns = screen.getAllByLabelText('Копировать ссылку')
    expect(copyBtns.length).toBe(2)
  })

  it('renders settings button with aria-label', () => {
    render(<Links />)
    const settingsBtns = screen.getAllByLabelText('Настройки ссылки')
    expect(settingsBtns.length).toBe(2)
  })

  it('renders click counts', () => {
    render(<Links />)
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('140')).toBeInTheDocument()
  })

  it('renders lead counts', () => {
    render(<Links />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })
})
