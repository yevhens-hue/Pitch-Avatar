import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Analytics from './page'

describe('Analytics Page', () => {
  it('renders page title', () => {
    render(<Analytics />)
    expect(screen.getByRole('heading', { name: 'Project Analytics' })).toBeInTheDocument()
  })

  it('renders total sessions stat', () => {
    render(<Analytics />)
    expect(screen.getByText('Total Sessions')).toBeInTheDocument()
    expect(screen.getByText('1,402')).toBeInTheDocument()
  })

  it('renders average view time stat', () => {
    render(<Analytics />)
    expect(screen.getByText('Avg. View Time')).toBeInTheDocument()
    expect(screen.getByText('04:12')).toBeInTheDocument()
  })

  it('renders interactions stat', () => {
    render(<Analytics />)
    expect(screen.getByText('Interactions')).toBeInTheDocument()
    expect(screen.getByText('853')).toBeInTheDocument()
  })

  it('renders chart bars', () => {
    render(<Analytics />)
    const chartBars = document.querySelectorAll('[class*="chartBar"]')
    expect(chartBars.length).toBe(12)
  })

  it('renders metric cards', () => {
    render(<Analytics />)
    const metricCards = document.querySelectorAll('[class*="metricCard"]')
    expect(metricCards.length).toBe(3)
  })
})