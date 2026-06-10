import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
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

describe('ShareEnrollModal', () => {
  const mockOnClose = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
    (getGroups as jest.Mock).mockResolvedValue([{ id: 'g1', name: 'Sales Team' }]);
    (getPresenters as jest.Mock).mockResolvedValue([{ id: 'p1', email: 'test.presenter@example.com' }]);
    (getEnrollmentLinks as jest.Mock).mockResolvedValue([{ id: 'e1', listenerName: 'Test Listener', uniqueUrl: 'https://test.com', createdAt: '2026-06-05' }]);
    (getListeners as jest.Mock).mockResolvedValue({
      data: [{ id: 'l1', email: 'test@example.com', first_name: 'Test', last_name: 'User' }],
      count: 1
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<ShareEnrollModal isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders and defaults to the General tab', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    // Check title
    expect(screen.getByText('Share / Enroll')).toBeInTheDocument();

    // Check that 'General' tab is active by verifying its content
    expect(screen.getByText('Target Type')).toBeInTheDocument();
    expect(screen.getByText('Link to calendar')).toBeInTheDocument();
  });

  it('displays listener dropdown when Target Type is Specific Listener', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    const targetTypeSelect = screen.getByRole('combobox', { name: /Target Type/i });
    fireEvent.change(targetTypeSelect, { target: { value: 'listener' } });

    await waitFor(() => {
      expect(screen.getByText('Specific Listener')).toBeInTheDocument();
      // Should show the listener option from mock
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('displays group dropdown when Target Type is Listener Group', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    const targetTypeSelect = screen.getByRole('combobox', { name: /Target Type/i });
    fireEvent.change(targetTypeSelect, { target: { value: 'group' } });

    await waitFor(() => {
      expect(screen.getByText('Listener Group')).toBeInTheDocument();
      // Should show the group option from mock
      expect(screen.getByText('Sales Team')).toBeInTheDocument();
    });
  });

  it('switches to the Enrollments tab when clicked', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    // Click on the Enrollments tab
    const enrollmentsTab = screen.getByRole('button', { name: /Enrollments/i });
    fireEvent.click(enrollmentsTab);

    // Verify Enrollments content is visible
    expect(screen.getByText('All viewer links generated for this project — across every listener and enrollment.')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Verify columns using getAllByText or getByRole to avoid ambiguity
    expect(screen.getByRole('columnheader', { name: 'Groups / Listeners' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Enrollments' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Date Created' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
  });

  it('opens LinkReadyModal when Share action is clicked in the table', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    // Go to Enrollments tab
    fireEvent.click(screen.getByRole('button', { name: /Enrollments/i }));
    
    const table = await screen.findByRole('table');
    const settingsButton = await within(table).findByRole('button', { name: 'Actions' });
    fireEvent.click(settingsButton);

    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();

    fireEvent.click(shareButton);

    expect(screen.getByText('Your link is ready')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Share/i, hidden: false })).not.toBeInTheDocument();
  });

  it('calls showToast when Update is clicked in the actions dropdown', async () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Enrollments/i }));
    
    const table = await screen.findByRole('table');
    const settingsButton = await within(table).findByRole('button', { name: 'Actions' });
    fireEvent.click(settingsButton);

    const updateButtons = screen.getAllByRole('button', { name: /Update/i });
    // In the DOM, we have the table Update button, the top right Update button, and the footer Update button.
    // The dropdown item is one of them. Let's just find the one that says exactly "Update" and has the actionMenuItem class
    const dropdownUpdateButton = updateButtons.find(btn => btn.className.includes('actionMenuItem')) || updateButtons[1];
    fireEvent.click(dropdownUpdateButton);

    expect(mockShowToast).toHaveBeenCalledWith("Link updated. The shared link now serves the latest project data.", "success");
  });

  it('calls createEnrollment and shows success toast when creating a new enrollment', async () => {
    (createEnrollment as jest.Mock).mockResolvedValueOnce([{ id: '123' }]);

    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    const createBtn = screen.getByRole('button', { name: /Create Enrollment Link/i });
    fireEvent.click(createBtn);

    expect(createEnrollment).toHaveBeenCalled();
    // Use findByText to wait for async state updates
    const successToast = await screen.findByRole('button', { name: /Enrollments/i });
    expect(mockShowToast).toHaveBeenCalledWith("Enrollment link created successfully.", "success");
    // Should switch to Enrollments tab (meaning the table is visible)
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows error toast when createEnrollment throws QUOTA_EXCEEDED error', async () => {
    (createEnrollment as jest.Mock).mockRejectedValueOnce(new Error('QUOTA_EXCEEDED: You have reached your limit'));

    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    const createBtn = screen.getByRole('button', { name: /Create Enrollment Link/i });
    fireEvent.click(createBtn);

    expect(createEnrollment).toHaveBeenCalled();
    // Wait for the async error handling
    await screen.findByRole('button', { name: /Create Enrollment Link/i }); // Just wait for re-render
    expect(mockShowToast).toHaveBeenCalledWith("You have reached your limit of active Listener Seats. Please upgrade your seat plan or archive active enrollments.", "error");
  });
});
