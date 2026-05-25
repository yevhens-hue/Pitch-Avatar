import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo', () => {
    render(<Sidebar />);
    expect(screen.getByText('Pitch Avatar')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Avatar Roles')).toBeInTheDocument();
  });

  it('renders upgrade button', () => {
    render(<Sidebar />);
    expect(screen.getByText('Schedule a demo')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<Sidebar />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('menuItemActive');
  });
});