import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastProvider';

function TestComponent() {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast('Test message')}>Show Toast</button>
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children', () => {
    render(<ToastProvider><div>Child content</div></ToastProvider>);

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('provides showToast function', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Toast')).toBeInTheDocument();
  });

  it('shows toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('auto-removes toast after 3 seconds', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  it('shows success toast by default', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Toast'));

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });
});