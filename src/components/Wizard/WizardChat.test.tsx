import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import WizardChat from './WizardChat';

describe('WizardChat', () => {
  const defaultProps = {
    stepName: 'Upload Slides',
    stepNumber: 1,
    wizardTitle: 'Quick Wizard',
    hint: 'Upload your PDF or PPTX file to get started.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock speech synthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: jest.fn(), cancel: jest.fn(), getVoices: () => [] },
      writable: true,
    });
  });

  it('renders FAB initially', () => {
    render(<WizardChat {...defaultProps} />);
    expect(screen.getByLabelText('Open AI assistant')).toBeInTheDocument();
  });

  it('opens dialog when FAB clicked', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    expect(screen.getByPlaceholderText('Ask Sara anything…')).toBeInTheDocument();
  });

  it('displays hint message when opened', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    expect(screen.getByText('Upload your PDF or PPTX file to get started.')).toBeInTheDocument();
  });

  it('renders step indicator', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    expect(screen.getByText('Step 1: Upload Slides')).toBeInTheDocument();
  });

  it('renders suggestion chips', () => {
    render(<WizardChat {...defaultProps} />);
    expect(screen.getByText('What formats work?')).toBeInTheDocument();
  });

  it('sends message on enter', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    
    const input = screen.getByPlaceholderText('Ask Sara anything…');
    fireEvent.change(input, { target: { value: 'How do I upload?' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('How do I upload?')).toBeInTheDocument();
  });

  it('has voice recording button', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    expect(screen.getByLabelText('Ask with voice (mic)')).toBeInTheDocument();
  });

  it('has close button', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    expect(screen.getByLabelText('Close (dismiss Sara)')).toBeInTheDocument();
  });

  it('responds to user messages', async () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    
    const input = screen.getByPlaceholderText('Ask Sara anything…');
    fireEvent.change(input, { target: { value: 'How do I upload a file?' } });
    fireEvent.click(screen.getByLabelText('Send'));

    // User message should appear
    expect(screen.getByText('How do I upload a file?')).toBeInTheDocument();
  });

  it('shows overflow menu', () => {
    render(<WizardChat {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Open AI assistant'));
    fireEvent.click(screen.getByLabelText('More options'));
    expect(screen.getByText('Upload audio')).toBeInTheDocument();
    expect(screen.getByText('Clear conversation')).toBeInTheDocument();
  });
});