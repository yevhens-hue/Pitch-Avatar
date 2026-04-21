import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VideoWizard from './VideoWizard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('VideoWizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step 1 by default', () => {
    render(<VideoWizard />);
    expect(screen.getByText('Upload Your Video')).toBeInTheDocument();
  });

  it('renders YouTube URL input', () => {
    render(<VideoWizard />);
    expect(screen.getByPlaceholderText('https://youtube.com/watch?v=...')).toBeInTheDocument();
  });

  it('renders import options', () => {
    render(<VideoWizard />);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Google Drive')).toBeInTheDocument();
  });

  it('renders step navigation', () => {
    render(<VideoWizard />);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('disables next button when no source', () => {
    render(<VideoWizard />);
    expect(screen.getByText('Next →')).toBeDisabled();
  });

  it('enables next button when YouTube URL is provided', async () => {
    render(<VideoWizard />);
    const input = screen.getByPlaceholderText('https://youtube.com/watch?v=...');
    fireEvent.change(input, { target: { value: 'https://youtube.com/watch?v=test' } });
    
    expect(screen.getByText('Next →')).not.toBeDisabled();
  });
});