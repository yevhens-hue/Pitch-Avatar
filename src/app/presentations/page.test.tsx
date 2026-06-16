import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import PresentationsPage from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: () => null, toString: () => '' }),
  usePathname: () => '/presentations',
}));

jest.mock('@/app/actions/projects', () => ({
  getProjects: jest.fn(() => Promise.resolve([
    { id: 'p1', title: 'Q1 Marketing Campaign', type: 'slides', status: 'published', createdAt: '2026-03-20', updatedAt: '2026-03-21', views: 1200 },
  ])),
}));

jest.mock('@/components/Library/ProjectsTable', () => ({
  __esModule: true,
  default: ({ projects }: any) => (
    <div data-testid="presentations-table-mock">
      {projects.map((p: any) => <div key={p.id}>{p.title}</div>)}
    </div>
  ),
}));

describe('Presentations Page', () => {
  it('renders page title', async () => {
    render(<PresentationsPage />);
    expect(await screen.findByRole('heading', { name: 'My Presentations' })).toBeInTheDocument();
  });

  it('renders create button', async () => {
    render(<PresentationsPage />);
    expect(await screen.findByRole('button', { name: /Create Presentation/i })).toBeInTheDocument();
  });

  it('renders projects table with mocked data', async () => {
    render(<PresentationsPage />);
    expect(await screen.findByTestId('presentations-table-mock')).toBeInTheDocument();
    expect(screen.getByText('Q1 Marketing Campaign')).toBeInTheDocument();
  });
});
