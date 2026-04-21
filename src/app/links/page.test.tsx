import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Links from './page'

describe('Links Page', () => {
  it('renders page title', () => {
    render(<Links />)
    expect(screen.getByText('My Links')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Links />)
    expect(screen.getByText('Link / Presentation')).toBeInTheDocument()
    expect(screen.getByText('Clicks')).toBeInTheDocument()
    expect(screen.getByText('Leads Collected')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders link rows', () => {
    render(<Links />)
    expect(screen.getByText('pitch-avatar.com/v/x8K9m2')).toBeInTheDocument()
    expect(screen.getByText('pitch-avatar.com/v/12abCD')).toBeInTheDocument()
  })

  it('renders presentation names', () => {
    render(<Links />)
    expect(screen.getByText('Presentation: Product Demo - Q1')).toBeInTheDocument()
    expect(screen.getByText('Presentation: Sales Pitch April')).toBeInTheDocument()
  })

  it('renders copy button with aria-label', () => {
    render(<Links />)
    const copyBtns = screen.getAllByLabelText('Copy link')
    expect(copyBtns.length).toBe(2)
  })

  it('renders settings button with aria-label', () => {
    render(<Links />)
    const settingsBtns = screen.getAllByLabelText('Link settings')
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