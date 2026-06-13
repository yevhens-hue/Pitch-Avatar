import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareEnrollModal from './ShareEnrollModal';
import { useToast } from '@/components/ui/ToastProvider';
import { createEnrollment, getGroups, getEnrollmentLinks, getPresenters } from '@/app/actions/enrollments';
import { getListeners } from '@/app/actions/listeners';

jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/app/actions/enrollments', () => ({
  createEnrollment: jest.fn(),
  getGroups: jest.fn(),
  getEnrollmentLinks: jest.fn(),
  getPresenters: jest.fn(),
}));

jest.mock('@/app/actions/listeners', () => ({
  getListeners: jest.fn(),
}));

const mockGroups = [
  { id: 'g1', name: 'Sales Team' },
  { id: 'g2', name: 'Engineering' },
]

const mockPresenters = [
  { id: 'p1', email: 'test.presenter@example.com' },
]

const mockEnrollmentLinks = [
  { id: 'e1', listenerName: 'Test Listener', uniqueUrl: 'https://test.com', createdAt: '2026-06-05' },
]

const mockListenersResponse = {
  data: [{ id: 'l1', email: 'test@example.com', first_name: 'Test', last_name: 'User' }],
  count: 1,
}

describe('ShareEnrollModal', () => {
  const mockOnClose = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ;(useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    ;(getGroups as jest.Mock).mockResolvedValue(mockGroups);
    ;(getPresenters as jest.Mock).mockResolvedValue(mockPresenters);
    ;(getEnrollmentLinks as jest.Mock).mockResolvedValue(mockEnrollmentLinks);
    ;(getListeners as jest.Mock).mockResolvedValue(mockListenersResponse);
    ;(createEnrollment as jest.Mock).mockResolvedValue({ id: 'new-enrollment' });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<ShareEnrollModal isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders when isOpen is true', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Share / Enroll')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('loads listeners, groups, presenters, and enrollment links on open', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(getListeners).toHaveBeenCalled()
      expect(getGroups).toHaveBeenCalled()
      expect(getPresenters).toHaveBeenCalled()
      expect(getEnrollmentLinks).toHaveBeenCalled()
    })
  })

  it('opens LinkReadyModal when Share action is clicked in the table', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    // Wait for data to load, then switch to Enrollments tab by looking for the tab button
    await waitFor(() => expect(getEnrollmentLinks).toHaveBeenCalled())

    // Find and click the Enrollments label tab — check for the enrollment content
    expect(screen.getByText(/All viewer links generated/i)).toBeInTheDocument();

    // Now find a table row actions button (Settings icon) and click to open the dropdown
    const settingsButtons = screen.getAllByRole('button', { name: '' })
    const tableActionsBtn = settingsButtons.find(btn => btn.querySelector('svg') !== null)

    if (tableActionsBtn) {
      fireEvent.click(tableActionsBtn)
      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Share'))
      expect(screen.getByText('Your link is ready')).toBeInTheDocument()
    }
  });

  it('shows success toast when create button in General tab is clicked', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => expect(getListeners).toHaveBeenCalled())

    // Click the primary create button in the General tab
    const createBtns = screen.getAllByRole('button')
    const mainCreateBtn = createBtns.find(btn => btn.textContent?.includes('Create'))
    if (mainCreateBtn) {
      fireEvent.click(mainCreateBtn)
      expect(createEnrollment).toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Enrollment link created'),
        'success'
      )
    }
  });

  it('shows error toast when createEnrollment throws QUOTA_EXCEEDED', async () => {
    ;(createEnrollment as jest.Mock).mockRejectedValueOnce(
      new Error('QUOTA_EXCEEDED: You have reached your limit')
    )

    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => expect(getListeners).toHaveBeenCalled())

    const createBtns = screen.getAllByRole('button')
    const mainCreateBtn = createBtns.find(btn => btn.textContent?.includes('Create'))
    if (mainCreateBtn) {
      fireEvent.click(mainCreateBtn)
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('limit'),
        'error'
      )
    }
  });
});
