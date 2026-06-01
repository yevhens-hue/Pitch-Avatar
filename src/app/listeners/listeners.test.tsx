import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ListenersDashboard from './page'
import { getListeners, createListener, updateListener, deleteListener } from '@/app/actions/listeners'
import { useToast } from '@/components/ui/ToastProvider'

// Mock the server actions
jest.mock('@/app/actions/listeners', () => ({
  getListeners: jest.fn(),
  createListener: jest.fn(),
  updateListener: jest.fn(),
  deleteListener: jest.fn()
}))

// Mock useToast hook
jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(() => ({
    showToast: jest.fn()
  }))
}))

const mockListenersData = [
  {
    id: 'l-1',
    email: 'john.smith@acme.com',
    firstName: 'John',
    lastName: 'Smith',
    company: 'Acme Corp',
    industry: 'Software',
    position: 'QA Engineer',
    linkedin: '',
    country: 'USA',
    department: 'Engineering',
    language: 'en',
    documents: ['john_resume.pdf'],
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'l-2',
    email: 'maria.k@test.pl',
    firstName: 'Maria',
    lastName: 'Kowalski',
    company: 'Polska Trade',
    industry: 'Sales',
    position: 'Sales Manager',
    linkedin: '',
    country: 'Poland',
    department: 'Sales',
    language: 'pl',
    documents: [],
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

describe('Listeners & Groups CRM Dashboard UI', () => {
  const mockShowToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast
    })
    ;(getListeners as jest.Mock).mockResolvedValue({
      data: mockListenersData,
      total: 2
    })
  })

  it('renders page header and control elements', async () => {
    render(<ListenersDashboard />)

    expect(screen.getByRole('heading', { name: 'Listeners' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by name, email, position...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create new listener profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export listeners to CSV' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import listeners database' })).toBeInTheDocument()
  })

  it('loads and displays listener data on mount', async () => {
    render(<ListenersDashboard />)

    expect(getListeners).toHaveBeenCalledWith('', 1, 6)

    await waitFor(() => {
      expect(screen.getByText('john.smith@acme.com')).toBeInTheDocument()
      expect(screen.getByText('John Smith')).toBeInTheDocument()
      expect(screen.getByText('QA Engineer')).toBeInTheDocument()
      expect(screen.getByText('maria.k@test.pl')).toBeInTheDocument()
      expect(screen.getByText('Maria Kowalski')).toBeInTheDocument()
      expect(screen.getByText('Sales Manager')).toBeInTheDocument()
    })
  })

  it('queries database with search terms when typing in search input', async () => {
    render(<ListenersDashboard />)

    const searchInput = screen.getByPlaceholderText('Search by name, email, position...')
    fireEvent.change(searchInput, { target: { value: 'Maria' } })

    await waitFor(() => {
      expect(getListeners).toHaveBeenLastCalledWith('Maria', 1, 6)
    })
  })

  it('opens create sheet modal on "Add Listener" click', async () => {
    render(<ListenersDashboard />)

    const addButton = screen.getByRole('button', { name: 'Create new listener profile' })
    fireEvent.click(addButton)

    expect(screen.getByRole('heading', { name: 'Add New Listener' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument()
  })

  it('submits form to create a new listener', async () => {
    ;(createListener as jest.Mock).mockResolvedValue({ id: 'l-3' })

    render(<ListenersDashboard />)

    // Open sheet
    fireEvent.click(screen.getByRole('button', { name: 'Create new listener profile' }))

    // Fill fields
    fireEvent.change(screen.getByLabelText('Email Address *'), { target: { value: 'new.candidate@test.com' } })
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'New' } })
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Candidate' } })

    // Click submit
    const saveButton = screen.getByRole('button', { name: 'Save Profile' })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(createListener).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new.candidate@test.com',
        firstName: 'New',
        lastName: 'Candidate'
      }))
      expect(mockShowToast).toHaveBeenCalledWith('Listener created successfully', 'success')
    })
  })
})
