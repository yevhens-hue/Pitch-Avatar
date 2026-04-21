import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders message', () => {
    render(<Toast message="Test message" onClose={jest.fn()} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success icon', () => {
    render(<Toast message="Test message" type="success" onClose={jest.fn()} />);

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error icon', () => {
    render(<Toast message="Test message" type="error" onClose={jest.fn()} />);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders info icon', () => {
    render(<Toast message="Test message" type="info" onClose={jest.fn()} />);

    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('has close button', () => {
    render(<Toast message="Test message" onClose={jest.fn()} />);

    expect(screen.getByLabelText('Close notification')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close notification'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after 3 seconds', async () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" onClose={onClose} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has alert role', () => {
    render(<Toast message="Test message" onClose={jest.fn()} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});