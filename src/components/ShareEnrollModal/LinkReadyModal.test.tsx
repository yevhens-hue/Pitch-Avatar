import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LinkReadyModal from './LinkReadyModal';
import { useToast } from '@/components/ui/ToastProvider';

// Mock the useToast hook
jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(),
}));

// Mock qrcode.react to avoid HTMLCanvasElement context errors in JSDOM
jest.mock('qrcode.react', () => ({
  QRCodeCanvas: () => <div data-testid="qrcode-canvas">Mock QR Code</div>,
}));

describe('LinkReadyModal', () => {
  const mockOnClose = jest.fn();
  const mockShowToast = jest.fn();
  const testLink = "https://example.com/share/123";

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <LinkReadyModal isOpen={false} onClose={mockOnClose} linkUrl={testLink} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <LinkReadyModal isOpen={true} onClose={mockOnClose} linkUrl={testLink} />
    );
    
    // Check title
    expect(screen.getByText('Your link is ready')).toBeInTheDocument();
    
    // Check input value
    const input = screen.getByDisplayValue(testLink);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readOnly');
    
    // Check social buttons
    expect(screen.getByText('Embed html')).toBeInTheDocument();
    expect(screen.getByText('Embed script')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByText('Linkedin')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <LinkReadyModal isOpen={true} onClose={mockOnClose} linkUrl={testLink} />
    );
    
    // The close button has an X icon, but we can query by clicking the button containing the SVG
    // An easier way is to just grab the first button (which is the close button in our markup)
    // But let's find the button more robustly or rely on class name if needed.
    // In LinkReadyModal, closeBtn is the first button:
    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('copies link to clipboard and shows toast on Copy click', () => {
    render(
      <LinkReadyModal isOpen={true} onClose={mockOnClose} linkUrl={testLink} />
    );
    
    const copyBtn = screen.getByRole('button', { name: /Copy link/i });
    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testLink);
    expect(mockShowToast).toHaveBeenCalledWith("Link copied to clipboard", "success");
  });

  it('handles social sharing clicks and embed buttons correctly', () => {
    const originalOpen = window.open;
    window.open = jest.fn();

    render(
      <LinkReadyModal isOpen={true} onClose={mockOnClose} linkUrl={testLink} />
    );
    
    const emailBtn = screen.getByRole('button', { name: /Email/i });
    fireEvent.click(emailBtn);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('mailto:?subject='),
      '_self'
    );
    
    const fbBtn = screen.getByRole('button', { name: /Facebook/i });
    fireEvent.click(fbBtn);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer'),
      '_blank',
      expect.any(String)
    );

    window.open = originalOpen;
  });

  it('renders embed html overlay when embed html is clicked', () => {
    render(
      <LinkReadyModal isOpen={true} onClose={mockOnClose} linkUrl={testLink} />
    );
    
    expect(screen.queryByText('HTML Embed Code')).not.toBeInTheDocument();
    
    const embedHtmlBtn = screen.getByRole('button', { name: /Embed html/i });
    fireEvent.click(embedHtmlBtn);
    
    expect(screen.getByText('HTML Embed Code')).toBeInTheDocument();
    expect(screen.getByText('Copy Code')).toBeInTheDocument();
  });
});
