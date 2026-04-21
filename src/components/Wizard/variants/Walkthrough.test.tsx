import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Walkthrough from './Walkthrough';

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({
    closeOnboarding: jest.fn(),
  }),
}));

describe('Walkthrough', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders welcome step', () => {
    render(<Walkthrough />);
    expect(screen.getByText('Welcome to PitchAvatar')).toBeInTheDocument();
  });

  it('shows current step number', () => {
    render(<Walkthrough />);
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
  });

  it('renders skip button', () => {
    render(<Walkthrough />);
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('renders next button', () => {
    render(<Walkthrough />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('advances to next step on click', () => {
    render(<Walkthrough />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('1. Create New Project')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });

  it('closes walkthrough on skip', () => {
    render(<Walkthrough />);
    fireEvent.click(screen.getByText('Skip'));
    expect(screen.queryByText('Welcome to PitchAvatar')).not.toBeInTheDocument();
  });

  it('shows finish on last step', () => {
    render(<Walkthrough />);
    
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('Next'));
    }
    
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('closes on finish', () => {
    render(<Walkthrough />);
    
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('Next'));
    }
    
    fireEvent.click(screen.getByText('Finish'));
    expect(screen.queryByText('Welcome to PitchAvatar')).not.toBeInTheDocument();
  });
});