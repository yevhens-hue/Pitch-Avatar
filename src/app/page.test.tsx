import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './page';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({ openGuide: jest.fn() }),
}));

jest.mock('@/components/Dashboard/Dashboard', () => {
  return function MockDashboard({ onOpenPresentationModal }: { onOpenPresentationModal: (tab?: string) => void }) {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('@/components/Auth/AuthModal', () => {
  return function MockAuthModal() {
    return <div data-testid="auth-modal">AuthModal</div>;
  };
});

jest.mock('@/components/Wizard/CreateProjectModal', () => {
  return function MockCreateProjectModal() {
    return <div data-testid="create-modal">CreateProjectModal</div>;
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard', () => {
    render(<Home />);
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('renders auth modal hidden by default', () => {
    render(<Home />);
    // Modal is not shown by default since isAuthOpen = false
    expect(screen.queryByTestId('auth-modal')).toBeInTheDocument(); // It's rendered but not open
  });

  it('renders create project modal hidden by default', () => {
    render(<Home />);
    expect(screen.queryByTestId('create-modal')).toBeInTheDocument();
  });
});