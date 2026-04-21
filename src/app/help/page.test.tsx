import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Help from './page'

describe('Help Page', () => {
  it('renders page title', () => {
    render(<Help />)
    expect(screen.getByText('Help & Support')).toBeInTheDocument()
  })

  it('renders contact agent button', () => {
    render(<Help />)
    expect(screen.getByText('Contact Support')).toBeInTheDocument()
  })

  it('renders FAQ section', () => {
    render(<Help />)
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
  })

  it('renders all FAQ items', () => {
    render(<Help />)
    expect(screen.getByText('How to upload videos larger than 500 MB?')).toBeInTheDocument()
    expect(screen.getByText('How long does AI script generation take?')).toBeInTheDocument()
    expect(screen.getByText('Can I embed the presentation on my website?')).toBeInTheDocument()
  })

  it('renders FAQ answers', () => {
    render(<Help />)
    expect(screen.getByText(/Contact our support/)).toBeInTheDocument()
    expect(screen.getByText(/Script generation usually takes/)).toBeInTheDocument()
    expect(screen.getByText(/set up the link/)).toBeInTheDocument()
  })

  it('renders documentation section', () => {
    render(<Help />)
    expect(screen.getByText('Documentation & Guides')).toBeInTheDocument()
  })

  it('renders documentation link', () => {
    render(<Help />)
    expect(screen.getByText('Read Documentation →')).toBeInTheDocument()
  })
})