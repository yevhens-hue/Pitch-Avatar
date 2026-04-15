import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

describe('ErrorBoundary Component', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders fallback when error occurs', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Custom Fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
  })

  it('shows default error UI on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has try again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })
})