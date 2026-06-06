import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareEnrollModal from './ShareEnrollModal';
import { useToast } from '@/components/ui/ToastProvider';

jest.mock('@/components/ui/ToastProvider', () => ({
  useToast: jest.fn(),
}));

describe('ShareEnrollModal', () => {
  const mockOnClose = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
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

  it('switches to the Enrollments tab when clicked', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    // Click on the Enrollments tab
    const enrollmentsTab = screen.getByRole('button', { name: /Enrollments/i });
    fireEvent.click(enrollmentsTab);

    // Verify Enrollments content is visible
    expect(screen.getByText('All viewer links generated for this project — across every listener and assignment.')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Verify columns using getAllByText or getByRole to avoid ambiguity
    expect(screen.getByRole('columnheader', { name: 'Groups / Listeners' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Enrollments' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Date Created' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
  });

  it('opens LinkReadyModal when Share action is clicked in the table', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    // Go to Enrollments tab
    fireEvent.click(screen.getByRole('button', { name: /Enrollments/i }));
    
    const table = screen.getByRole('table');
    const settingsButton = within(table).getByRole('button', { name: 'Actions' });
    fireEvent.click(settingsButton);

    const shareButton = screen.getByRole('button', { name: /Share/i });
    expect(shareButton).toBeInTheDocument();

    fireEvent.click(shareButton);

    expect(screen.getByText('Your link is ready')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Share/i, hidden: false })).not.toBeInTheDocument();
  });

  it('calls showToast when Update is clicked in the actions dropdown', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Enrollments/i }));
    
    const table = screen.getByRole('table');
    const settingsButton = within(table).getByRole('button', { name: 'Actions' });
    fireEvent.click(settingsButton);

    const updateButtons = screen.getAllByRole('button', { name: /Update/i });
    // In the DOM, we have the table Update button, the top right Update button, and the footer Update button.
    // The dropdown item is one of them. Let's just find the one that says exactly "Update" and has the actionMenuItem class
    const dropdownUpdateButton = updateButtons.find(btn => btn.className.includes('actionMenuItem')) || updateButtons[1];
    fireEvent.click(dropdownUpdateButton);

    expect(mockShowToast).toHaveBeenCalledWith("Link updated. The shared link now serves the latest project data.", "success");
  });

  it('calls showToast when footer Update Enrollment Links is clicked', () => {
    render(<ShareEnrollModal isOpen={true} onClose={mockOnClose} />);
    
    const footerUpdateBtn = screen.getByRole('button', { name: /Update Enrollment Links/i });
    fireEvent.click(footerUpdateBtn);

    expect(mockShowToast).toHaveBeenCalledWith("Link updated. The shared link now serves the latest project data.", "success");
  });
});
