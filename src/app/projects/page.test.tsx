import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import Projects from './page'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: () => null, toString: () => '' }),
  usePathname: () => '/projects',
}))

jest.mock('@/app/actions/projects', () => ({
  getProjects: jest.fn(() => Promise.resolve([
    { id: 'p1', title: 'Q1 Marketing Campaign', type: 'slides', status: 'published', createdAt: '2026-03-20', updatedAt: '2026-03-21', views: 1200 },
  ])),
  getFolders: jest.fn(() => Promise.resolve([])),
}))

jest.mock('@/components/Library/ProjectsTable', () => ({
  __esModule: true,
  default: ({ projects }: any) => (
    <div data-testid="projects-table-mock">
      {projects.map((p: any) => <div key={p.id}>{p.title}</div>)}
    </div>
  ),
}))

describe('Projects Page', () => {
  it('renders page title', async () => {
    render(<Projects />);
    expect(await screen.findByRole('heading', { name: 'My Projects' })).toBeInTheDocument();
  });

  it('renders create project button', async () => {
    render(<Projects />);
    expect(await screen.findByRole('button', { name: /Create Project/i })).toBeInTheDocument();
  });

  it('renders project table component', async () => {
    render(<Projects />);
    expect(await screen.findByTestId('projects-table-mock')).toBeInTheDocument();
  })
});
