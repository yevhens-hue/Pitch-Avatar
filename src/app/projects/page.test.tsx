import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Projects from './page'

describe('Projects Page', () => {
  it('renders page title', () => {
    render(<Projects />)
    expect(screen.getByText('Мои проекты')).toBeInTheDocument()
  })

  it('renders create project button', () => {
    render(<Projects />)
    expect(screen.getByText('+ Создать проект')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Projects />)
    expect(screen.getByText('Название проекта')).toBeInTheDocument()
    expect(screen.getByText('Статус')).toBeInTheDocument()
    expect(screen.getByText('Дата создания')).toBeInTheDocument()
  })

  it('renders project rows', () => {
    render(<Projects />)
    expect(screen.getByText('Q1 Marketing Campaign')).toBeInTheDocument()
    expect(screen.getByText('Sales Enablement')).toBeInTheDocument()
    expect(screen.getByText('Internal Training')).toBeInTheDocument()
  })

  it('renders project statuses', () => {
    render(<Projects />)
    expect(screen.getByText('ready')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders project dates', () => {
    render(<Projects />)
    expect(screen.getByText('2026-03-20')).toBeInTheDocument()
    expect(screen.getByText('2026-02-15')).toBeInTheDocument()
    expect(screen.getByText('2026-01-10')).toBeInTheDocument()
  })
})
