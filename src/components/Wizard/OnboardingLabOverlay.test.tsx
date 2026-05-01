import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingLabOverlay from './OnboardingLabOverlay';

describe('OnboardingLabOverlay', () => {
  it('renders title when open', () => {
    render(<OnboardingLabOverlay isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Onboarding Lab')).toBeInTheDocument();
  });

  it('renders all variant cards', () => {
    render(<OnboardingLabOverlay isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('JTBD (Role-based)')).toBeInTheDocument();
    expect(screen.getByText('Magic Start')).toBeInTheDocument();
    expect(screen.getByText('Conversational')).toBeInTheDocument();
    expect(screen.getByText('Snov.io Style')).toBeInTheDocument();
    expect(screen.getByText('Interactive Video')).toBeInTheDocument();
    expect(screen.getByText('Guided Walkthrough')).toBeInTheDocument();
    expect(screen.getByText('Quick Start Checklist')).toBeInTheDocument();
  });

  it('shows variant title when selected', () => {
    render(<OnboardingLabOverlay isOpen={true} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText('JTBD (Role-based)'));
    expect(screen.getByText('JTBD (Role-based)')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<OnboardingLabOverlay isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns null when not open', () => {
    const { container } = render(<OnboardingLabOverlay isOpen={false} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});