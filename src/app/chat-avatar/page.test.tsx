import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import ChatAvatarPage from './page'
import { getProjects } from '@/app/actions/projects'

jest.mock('@/app/actions/projects', () => ({
  getProjects: jest.fn(),
}))

const mockProjects = [
  {
    id: 'a1',
    title: 'Customer Support Bot',
    type: 'chat-avatar',
    status: 'published' as const,
    createdAt: '2026-03-20',
    updatedAt: '2026-03-21',
    views: 1200,
  },
  {
    id: 'a2',
    title: 'Sales Assistant',
    type: 'assistant',
    status: 'draft' as const,
    createdAt: '2026-03-15',
    updatedAt: '2026-03-16',
    views: 450,
  },
]

describe('Chat Avatar Page', () => {
  beforeEach(() => {
    ;(getProjects as jest.Mock).mockResolvedValue(mockProjects)
  })

  it('renders page title', async () => {
    render(<ChatAvatarPage />)
    expect(await screen.findByText('AI Chat-avatars')).toBeInTheDocument()
  })

  it('renders create button', async () => {
    render(<ChatAvatarPage />)
    expect(await screen.findByText('+ Create Chat-avatar')).toBeInTheDocument()
  })

  it('renders table headers', async () => {
    render(<ChatAvatarPage />)
    expect(await screen.findByText('Проект')).toBeInTheDocument()
    expect(screen.getByText('Предварительный просмотр')).toBeInTheDocument()
    expect(screen.getByText('Дата')).toBeInTheDocument()
  })

  it('renders avatar rows', async () => {
    render(<ChatAvatarPage />)

    await waitFor(() => {
      expect(screen.getByText('Customer Support Bot')).toBeInTheDocument()
      expect(screen.getByText('Sales Assistant')).toBeInTheDocument()
    })
  })
})