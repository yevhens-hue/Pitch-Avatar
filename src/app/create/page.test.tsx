import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CreatePage from './page';

describe('Create Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Redirecting to Dashboard message', () => {
    render(<CreatePage />);
    expect(screen.getByText('Redirecting to Dashboard...')).toBeInTheDocument();
    expect(screen.getByText('The new onboarding is now managed via Stonly.')).toBeInTheDocument();
  });

  it('sets window.location.href to root path', () => {
    render(<CreatePage />);
    expect(window.location.href).toBe('http://localhost/');
  });
});