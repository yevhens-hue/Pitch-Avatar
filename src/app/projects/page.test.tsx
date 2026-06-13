import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Projects from './page'
import { getProjects } from '@/app/actions/projects'

jest.mock('@/app/actions/projects', () => ({
  getProjects: jest.fn(),
  getFolders: jest.fn(),
}))

const mockProjects = [
  {
    id: 'p1',
    title: 'Q1 Marketing Campaign',
    type: 'slides',
    status: 'published',
    createdAt: '2026-03-20',
    updatedAt: '2026-03-21',
    views: 1200,
  },
  {
    id: 'p2',
    title: 'Sales Enablement',
    type: 'slides',
    status: 'draft',
    createdAt: '2026-02-15',
    updatedAt: '2026-02-16',
    views: 450,
  },
  {
    id: 'p3',
    title: 'Internal Training',
    type: 'video',
    status: 'published',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-11',
    views: 800,
  },
]

describe('Projects Page', () => {
  beforeEach(() => {
    ;(getProjects as jest.Mock).mockResolvedValue(mockProjects)
  })

  it('renders page title', async () => {
    render(<Projects />)
    expect(await screen.findByText('My Projects')).toBeInTheDocument()
  })

  it('renders create project button', async () => {
    render(<Projects />)
    expect(await screen.findByText('+ Create Project')).toBeInTheDocument()
  })

  it('renders table headers', async () => {
    render(<Projects />)
    expect(await screen.findByText('PROJECT')).toBeInTheDocument()
    expect(screen.getByText('PREVIEW')).toBeInTheDocument()
    expect(screen.getByText('CREATED')).toBeInTheDocument()
  })

  it('renders project rows', async () => {
    render(<Projects />)

    await waitFor(() => {
      expect(screen.getByText('Q1 Marketing Campaign')).toBeInTheDocument()
      expect(screen.getByText('Sales Enablement')).toBeInTheDocument()
    })
  })

  it('renders project dates', async () => {
    render(<Projects />)

    await waitFor(() => {
      expect(screen.getByText('2026-03-20')).toBeInTheDocument()
      expect(screen.getByText('2026-02-15')).toBeInTheDocument()
      expect(screen.getByText('2026-01-10')).toBeInTheDocument()
    })
  })
})