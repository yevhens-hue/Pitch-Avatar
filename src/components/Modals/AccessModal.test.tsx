import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessModal from './AccessModal';

describe('AccessModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AccessModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with access type options when isOpen is true', () => {
    render(<AccessModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Access')).toBeInTheDocument();
    expect(screen.getByText('Access type *')).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'Available to me' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Available to company users' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Available to individual users' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Available to Superadmin' })).toBeInTheDocument();
  });

  it('allows selecting "Available to Superadmin"', () => {
    render(<AccessModal isOpen={true} onClose={mockOnClose} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('me');

    fireEvent.change(select, { target: { value: 'superadmin' } });
    expect(select).toHaveValue('superadmin');
  });

  it('calls onClose when close button is clicked', () => {
    render(<AccessModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
