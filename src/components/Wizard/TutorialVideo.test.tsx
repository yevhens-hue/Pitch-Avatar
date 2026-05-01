import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TutorialVideo from './TutorialVideo';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('TutorialVideo', () => {
  it('renders video player', () => {
    render(<TutorialVideo />);
    expect(screen.getByText('Watch Tutorial')).toBeInTheDocument();
  });

  it('renders video title', () => {
    render(<TutorialVideo />);
    expect(screen.getByText('How to create your first presentation')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<TutorialVideo />);
    expect(screen.getByText('Back to Wizard')).toBeInTheDocument();
  });
});