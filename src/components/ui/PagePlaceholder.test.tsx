import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PagePlaceholder from './PagePlaceholder'

describe('PagePlaceholder Component', () => {
  it('renders title', () => {
    render(<PagePlaceholder title="Test Page" />)
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<PagePlaceholder title="Test Page" description="Some description" />)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<PagePlaceholder title="Test Page" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('renders "Скоро" badge', () => {
    render(<PagePlaceholder title="Test Page" />)
    expect(screen.getByText('Скоро')).toBeInTheDocument()
  })

  it('renders heading element', () => {
    render(<PagePlaceholder title="Test Page" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Test Page')
  })
})
