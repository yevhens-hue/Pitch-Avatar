import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectsTable from './ProjectsTable';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('@/lib/stonly', () => ({
  trackActivationEvent: jest.fn(),
}));

jest.mock('@/app/actions/projects', () => ({
  deleteProject: jest.fn(),
}));

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({ isFutureVersion: true }),
}));

// Mock lucide-react to render identifiable elements for icons
jest.mock('lucide-react', () => {
  return {
    Dumbbell: () => <span data-testid="dumbbell-icon" />,
    Play: () => <span data-testid="play-icon" />,
    FileUp: () => <span data-testid="fileup-icon" />,
    Settings: () => <span data-testid="settings-icon" />,
    Trash2: () => <span data-testid="trash-icon" />,
    Edit2: () => <span data-testid="edit-icon" />,
    Eye: () => <span data-testid="eye-icon" />,
    MoreHorizontal: () => <span data-testid="more-icon" />,
    Link: () => <span data-testid="link-icon" />,
    Users: () => <span data-testid="users-icon" />,
    FolderInput: () => <span data-testid="folder-icon" />,
    Copy: () => <span data-testid="copy-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    GraduationCap: () => <span data-testid="grad-icon" />,
    Globe: () => <span data-testid="globe-icon" />,
    Download: () => <span data-testid="download-icon" />,
  };
});

describe('ProjectsTable', () => {
  const mockProjects = [
    {
      id: 'p1',
      title: 'Standard Project',
      type: 'presentation' as const,
      isCoachMode: false,
      createdAt: '2026-07-01',
    },
    {
      id: 'p2',
      title: 'Coach Mode Project',
      type: 'presentation' as const,
      isCoachMode: true,
      createdAt: '2026-07-02',
    },
  ];

  it('renders standard projects without coach icon', () => {
    render(<ProjectsTable projects={[mockProjects[0]]} />);
    expect(screen.getByText('Standard Project')).toBeInTheDocument();
    expect(screen.queryByTestId('dumbbell-icon')).not.toBeInTheDocument();
  });

  it('renders coach projects with dumbbell icon', () => {
    render(<ProjectsTable projects={[mockProjects[1]]} />);
    expect(screen.getByText('Coach Mode Project')).toBeInTheDocument();
    expect(screen.getByTestId('dumbbell-icon')).toBeInTheDocument();
  });

  it('filters by coach mode', () => {
    render(<ProjectsTable projects={mockProjects} />);
    
    // Check both are rendered initially
    expect(screen.getByText('Standard Project')).toBeInTheDocument();
    expect(screen.getByText('Coach Mode Project')).toBeInTheDocument();

    // Open filters
    const filtersBtn = screen.getByRole('button', { name: /Фильтры/i });
    fireEvent.click(filtersBtn);

    // Open Mode dropdown
    const modeDropdownBtn = screen.getByRole('button', { name: /Mode/i });
    fireEvent.click(modeDropdownBtn);

    // Select Coach
    const coachFilterBtn = screen.getByRole('button', { name: 'Coach' });
    fireEvent.click(coachFilterBtn);

    // Standard Project should be hidden
    expect(screen.queryByText('Standard Project')).not.toBeInTheDocument();
    expect(screen.getByText('Coach Mode Project')).toBeInTheDocument();
  });
});
