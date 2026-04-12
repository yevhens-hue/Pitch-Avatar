import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Analytics from './page'

describe('Analytics Page', () => {
  it('renders page title', () => {
    render(<Analytics />)
    expect(screen.getByText('Аналитика')).toBeInTheDocument()
  })

  it('renders total views stat', () => {
    render(<Analytics />)
    expect(screen.getByText('Общее число просмотров')).toBeInTheDocument()
    expect(screen.getByText('1,204')).toBeInTheDocument()
  })

  it('renders leads stat', () => {
    render(<Analytics />)
    expect(screen.getByText('Собранные лиды')).toBeInTheDocument()
    expect(screen.getByText('84')).toBeInTheDocument()
  })

  it('renders average view time stat', () => {
    render(<Analytics />)
    expect(screen.getByText('Среднее время просмотра')).toBeInTheDocument()
    expect(screen.getByText('02:45')).toBeInTheDocument()
  })

  it('renders chart placeholder', () => {
    render(<Analytics />)
    expect(screen.getByText(/Здесь будет отображаться график активности/)).toBeInTheDocument()
  })

  it('renders stat cards', () => {
    render(<Analytics />)
    const statCards = document.querySelectorAll('[class*="statCard"]')
    expect(statCards.length).toBe(3)
  })
})
