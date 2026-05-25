import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Projects from './page'

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

describe('Projects Page', () => {
  it('renders page title', () => {
    render(<Projects />)
    expect(screen.getByText('My Projects')).toBeInTheDocument()
  })

  it('renders create project button', () => {
    render(<Projects />)
    expect(screen.getByText('+ Create Project')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Projects />)
    expect(screen.getByText('PROJECT')).toBeInTheDocument()
    expect(screen.getByText('PREVIEW')).toBeInTheDocument()
    expect(screen.getByText('CREATED')).toBeInTheDocument()
  })

  it('renders project rows', () => {
    render(<Projects />)
    expect(screen.getByText('Q1 Marketing Campaign')).toBeInTheDocument()
    expect(screen.getByText('Sales Enablement')).toBeInTheDocument()
    expect(screen.getByText('Internal Training')).toBeInTheDocument()
  })

  it('renders project dates', () => {
    render(<Projects />)
    expect(screen.getByText('2026-03-20')).toBeInTheDocument()
    expect(screen.getByText('2026-02-15')).toBeInTheDocument()
    expect(screen.getByText('2026-01-10')).toBeInTheDocument()
  })
})