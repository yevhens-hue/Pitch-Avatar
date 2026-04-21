import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import KnowledgeBase from './page'

describe('Knowledge Page', () => {
  it('renders page title', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
  })

  it('renders create buttons', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('+ Text / Website')).toBeInTheDocument()
    expect(screen.getByText('+ Upload File')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText(/The Knowledge Base allows your AI assistants/)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('Document Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    expect(screen.getByText('Uploaded')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders knowledge items', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('Product Specifications 2026.pdf')).toBeInTheDocument()
    expect(screen.getByText('Company FAQ')).toBeInTheDocument()
  })

  it('renders document types', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Text / Web')).toBeInTheDocument()
  })

  it('renders document sizes', () => {
    render(<KnowledgeBase />)
    expect(screen.getByText('2.4 MB')).toBeInTheDocument()
    expect(screen.getByText('12 KB')).toBeInTheDocument()
  })

  it('renders delete buttons with aria-label', () => {
    render(<KnowledgeBase />)
    const deleteBtns = screen.getAllByLabelText('Delete document')
    expect(deleteBtns.length).toBe(2)
  })
})