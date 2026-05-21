import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TutorialVideo from './TutorialVideo';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const defaultProps = {
  videoUrl: 'https://example.com/video.mp4',
  title: 'How to create your first presentation',
  stepLabel: 'Step 1',
  onClose: jest.fn(),
};

describe('TutorialVideo', () => {
  it('renders video player', () => {
    render(<TutorialVideo {...defaultProps} />);
    expect(screen.getByText('Watch Tutorial')).toBeInTheDocument();
  });

  it('renders video title', () => {
    render(<TutorialVideo {...defaultProps} />);
    expect(screen.getByText('How to create your first presentation')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<TutorialVideo {...defaultProps} />);
    expect(screen.getByText('Back to Wizard')).toBeInTheDocument();
  });
});