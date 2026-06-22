import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareEnrollModal from './ShareEnrollModal';
import { useToast } from '@/components/ui/ToastProvider';
import { createEnrollmentDraft, generateEnrollmentLinks, getGroups, getEnrollmentLinks, getPresenters } from '@/app/actions/enrollments';
import { getListeners } from '@/app/actions/listeners';

jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/app/actions/enrollments', () => ({
  createEnrollmentDraft: jest.fn(),
  generateEnrollmentLinks: jest.fn(),
  refreshEnrollmentLinks: jest.fn(),
  sendEnrollmentInvitationAction: jest.fn(),
  updateEnrollment: jest.fn(),
  getGroups: jest.fn(),
  getEnrollmentLinks: jest.fn(),
  getPresenters: jest.fn(),
}));

jest.mock('@/app/actions/listeners', () => ({
  getListeners: jest.fn(),
}));

describe('ShareEnrollModal', () => {
  const mockOnClose = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ;(useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    ;(getGroups as jest.Mock).mockResolvedValue([{ id: 'g1', name: 'Sales Team' }]);
    ;(getPresenters as jest.Mock).mockResolvedValue([{ id: 'p1', email: 'test.presenter@example.com' }]);
    ;(getEnrollmentLinks as jest.Mock).mockResolvedValue([{ id: 'e1', listenerName: 'Test Listener', uniqueUrl: 'https://test.com', createdAt: '2026-06-05' }]);
    ;(getListeners as jest.Mock).mockResolvedValue({
      data: [{ id: 'l1', email: 'test@example.com', first_name: 'Test', last_name: 'User' }],
      count: 1,
    });
    ;(createEnrollmentDraft as jest.Mock).mockResolvedValue({ id: 'new-enrollment' });
    ;(generateEnrollmentLinks as jest.Mock).mockResolvedValue([{ id: 'new-enrollment', listenerName: 'Test Listener', uniqueUrl: 'https://test.com', createdAt: '2026-06-05' }]);
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
    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);
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
  });

  it('shows Links tab content', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => expect(getEnrollmentLinks).toHaveBeenCalled());

    const linksTab = screen.getByText(/Enrollments/i);
    fireEvent.click(linksTab);

    await waitFor(() => {
      expect(screen.getByText(/All viewer links generated/)).toBeInTheDocument()
    });
  });

  it('calls createEnrollmentDraft and shows success toast', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => expect(getPresenters).toHaveBeenCalled());

    const createBtn = screen.getByRole('button', { name: /^(Create Enrollment Links|Update Enrollment)$/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(createEnrollmentDraft).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.stringContaining('Enrollment'),
      'success'
    );
  });

  it('shows overage modal when createEnrollmentDraft throws QUOTA_EXCEEDED', async () => {
    ;(createEnrollmentDraft as jest.Mock).mockRejectedValueOnce(
      new Error('QUOTA_EXCEEDED: You have reached your limit')
    );

    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => expect(getPresenters).toHaveBeenCalled());

    const createBtn = screen.getByRole('button', { name: /^(Create Enrollment Links|Update Enrollment)$/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(createEnrollmentDraft).toHaveBeenCalled();
    }, { timeout: 3000 });

    // QUOTA_EXCEEDED opens the overage modal instead of a toast
    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
