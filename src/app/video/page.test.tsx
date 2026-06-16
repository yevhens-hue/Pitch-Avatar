import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import VideoLibrary from './page'
import { getProjects } from '@/app/actions/projects'

jest.mock('@/app/actions/projects', () => ({
  getProjects: jest.fn(),
}))

describe('Video Library Page', () => {
  beforeEach(() => {
    ;(getProjects as jest.Mock).mockResolvedValue([
      {
        id: 'v1',
        title: 'Internal Training',
        type: 'video',
        status: 'published',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-11',
        views: 800,
      },
    ])
  })

  it('renders page heading', async () => {
    render(<VideoLibrary />)
    expect(await screen.findByRole('heading', { name: 'Video' })).toBeInTheDocument()
  });

  it('renders create button', async () => {
    render(<VideoLibrary />)
    expect(await screen.findByRole('button', { name: /Create Video/i })).toBeInTheDocument()
  });

  it('loads video projects', async () => {
    render(<VideoLibrary />)
    expect(getProjects).toHaveBeenCalledWith({ type: 'video' })
    await waitFor(() => expect(screen.getByText('Internal Training')).toBeInTheDocument())
  });
});
