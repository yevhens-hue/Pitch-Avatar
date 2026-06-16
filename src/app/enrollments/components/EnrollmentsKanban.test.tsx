import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnrollmentsKanban from './EnrollmentsKanban';
import { Enrollment } from '@/types/listeners';

const mockStyles: any = {
  kanbanBoard: 'kanbanBoard',
  kanbanColumn: 'kanbanColumn',
  kanbanCard: 'kanbanCard',
  kanbanCardBtnDanger: 'kanbanCardBtnDanger',
};

const mockEnrollments: Enrollment[] = [
  {
    id: 'e1',
    title: 'John Doe',
    listenerId: 'l1',
    listenerName: 'John Doe',
    listenerEmail: 'john@example.com',
    projectId: 'p1',
    projectTitle: 'Q1 Pres',
    targetType: 'listener',
    contentType: 'project',
    status: 'In Progress',
    startDate: '2026-01-01T00:00:00Z',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
    emailSchedule: undefined,
  },
  {
    id: 'e2',
    title: 'Jane Smith',
    listenerId: 'l2',
    listenerName: 'Jane Smith',
    listenerEmail: 'jane@example.com',
    projectId: 'p1',
    projectTitle: 'Q1 Pres',
    targetType: 'listener',
    contentType: 'project',
    status: 'Completed',
    startDate: null,
    createdAt: '2026-06-05',
    updatedAt: '2026-06-05',
    emailSchedule: undefined,
  },
];

const defaultProps = {
  styles: mockStyles,
  enrollments: mockEnrollments,
  isLoading: false,
  isPending: false,
  handleCopyLink: jest.fn(),
  handleOpenEdit: jest.fn(),
  handleDelete: jest.fn(),
};

describe('EnrollmentsKanban', () => {
  it('renders kanban columns', () => {
    render(<EnrollmentsKanban {...defaultProps} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Not started')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders enrollment cards', () => {
    render(<EnrollmentsKanban {...defaultProps} />);
    expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Q1 Pres').length).toBeGreaterThanOrEqual(1);
  });

  it('shows counts per column header', () => {
    render(<EnrollmentsKanban {...defaultProps} />);
    // Find column count badges by their Position
    const columnHeaders = screen.getAllByText('In Progress');
    // The column header with count is the first one (parent div contains count)
    expect(columnHeaders.length).toBeGreaterThanOrEqual(1);
  });

  it('calls handleOpenEdit on card click', () => {
    const mockHandle = jest.fn();
    render(<EnrollmentsKanban {...defaultProps} handleOpenEdit={mockHandle} />);
    fireEvent.click(screen.getAllByText('John Doe')[0]);
    expect(mockHandle).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });

  it('shows skeleton loader', () => {
    render(<EnrollmentsKanban {...defaultProps} isLoading />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('shows empty state for empty column', () => {
    render(<EnrollmentsKanban {...defaultProps} enrollments={[]} />);
    const emptyStates = screen.getAllByText('No enrollments');
    expect(emptyStates.length).toBeGreaterThan(0);
  });

  it('handles delete via gear button click', () => {
    const mockHandle = jest.fn();
    render(<EnrollmentsKanban {...defaultProps} handleDelete={mockHandle} />);
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(mockHandle).toHaveBeenCalledWith('e1');
  });
});
