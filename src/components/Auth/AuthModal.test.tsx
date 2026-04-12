import { render, screen, fireEvent } from '@testing-library/react';
import AuthModal from './AuthModal';

describe('AuthModal Component', () => {
  it('should render login form initially', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('should switch to sign up view when clicked', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText(/Create an account/i));
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
  });
});
