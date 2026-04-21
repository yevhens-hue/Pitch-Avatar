import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Voices from './page'

describe('Voices Page', () => {
  it('renders page title', () => {
    render(<Voices />)
    expect(screen.getByText('My Voices')).toBeInTheDocument()
  })

  it('renders clone voice button', () => {
    render(<Voices />)
    expect(screen.getByText('Clone New Voice')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Voices />)
    expect(screen.getByText(/Create a digital clone of your voice/)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Voices />)
    expect(screen.getByText('Voice Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders voice rows', () => {
    render(<Voices />)
    expect(screen.getByText('John Doe Voice Clone')).toBeInTheDocument()
    expect(screen.getByText('Libby Professional')).toBeInTheDocument()
    expect(screen.getByText('Anna Friendly')).toBeInTheDocument()
  })

  it('renders voice types', () => {
    render(<Voices />)
    expect(screen.getAllByText('Cloned Voice').length).toBe(1)
    expect(screen.getAllByText('AI Library').length).toBe(2)
  })

  it('shows play/delete buttons only for cloned voices', () => {
    render(<Voices />)
    const playButtons = screen.getAllByLabelText('Listen to voice')
    const deleteButtons = screen.getAllByLabelText('Delete voice')
    expect(playButtons.length).toBe(1)
    expect(deleteButtons.length).toBe(1)
  })

  it('renders languages', () => {
    render(<Voices />)
    expect(screen.getByText('English / Russian')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Russian')).toBeInTheDocument()
  })
})