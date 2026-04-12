import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card Component', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="my-card">Content</Card>)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with default padding', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with sm padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders with lg padding', () => {
    const { container } = render(<Card padding="lg">Content</Card>)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders multiple children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>,
    )
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })
})
