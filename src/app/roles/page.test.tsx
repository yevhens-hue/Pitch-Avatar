import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Roles from './page'

describe('Roles Page', () => {
  it('renders page title', () => {
    render(<Roles />)
    expect(screen.getByText('AI Avatar Roles')).toBeInTheDocument()
  })

  it('renders create role button', () => {
    render(<Roles />)
    expect(screen.getByText('+ Create Role')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<Roles />)
    expect(screen.getByText(/Assign roles to AI assistants/)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Roles />)
    expect(screen.getByText('Role Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders role rows', () => {
    render(<Roles />)
    expect(screen.getByText('IT Sales Specialist')).toBeInTheDocument()
    expect(screen.getByText('HR Manager')).toBeInTheDocument()
    expect(screen.getByText('Support Service')).toBeInTheDocument()
  })

  it('renders role descriptions', () => {
    render(<Roles />)
    expect(screen.getByText('Assistant for SaaS product sales')).toBeInTheDocument()
    expect(screen.getByText('Answers frequent candidate questions')).toBeInTheDocument()
    expect(screen.getByText('Technical assistance for users')).toBeInTheDocument()
  })

  it('renders settings buttons with aria-label', () => {
    render(<Roles />)
    const settingsBtns = screen.getAllByLabelText('Role settings')
    expect(settingsBtns.length).toBe(3)
  })

  it('renders delete buttons with aria-label', () => {
    render(<Roles />)
    const deleteBtns = screen.getAllByLabelText('Delete role')
    expect(deleteBtns.length).toBe(3)
  })
})