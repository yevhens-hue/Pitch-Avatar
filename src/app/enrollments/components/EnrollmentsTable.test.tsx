import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnrollmentsTable from './EnrollmentsTable';
import { Enrollment } from '@/types/listeners';

const mockStyles: any = {
  tableCard: 'tableCard',
  table: 'table',
  rowSelected: 'rowSelected',
  dropdownPopover: 'dropdownPopover',
  gearBtn: 'gearBtn',
  gearItem: 'gearItem',
  gearItemDelete: 'gearItemDelete',
  statusBadge: 'statusBadge',
  statusPending: 'statusPending',
  btnPrimary: 'btnPrimary',
  bulkBtn: 'bulkBtn',
  bulkBtnDanger: 'bulkBtnDanger',
  bulkDismiss: 'bulkDismiss',
  bulkSelected: 'bulkSelected',
  pageBtn: 'pageBtn',
};

const mockEnrollments: Enrollment[] = [
  {
    id: 'e1',
    title: 'John Doe',
    listenerId: 'l1',
    listenerName: 'John Doe',
    listenerEmail: 'john@example.com',
    projectId: 'p1',
    projectTitle: 'Q1 Presentation',
    targetType: 'listener',
    contentType: 'project',
    status: 'Completed',
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
    projectTitle: 'Q1 Presentation',
    targetType: 'listener',
    contentType: 'project',
    status: 'In Progress',
    startDate: '2026-06-10T00:00:00Z',
    createdAt: '2026-06-05',
    updatedAt: '2026-06-05',
    emailSchedule: undefined,
  },
];

const defaultProps = {
  styles: mockStyles,
  enrollments: mockEnrollments,
  selectedIds: [],
  visibleColumns: ['Name', 'ListenerGroup', 'ProjectCourse', 'Status', 'Link', 'StartDate', 'DateCreated'],
  isLoading: false,
  isPending: false,
  toggleSelectAll: jest.fn(),
  toggleSelect: jest.fn(),
  handleCopyLink: jest.fn(),
  handleOpenEdit: jest.fn(),
  activeInlineStatusId: null,
  setActiveInlineStatusId: jest.fn(),
  handleInlineStatusChange: jest.fn(),
  activeGearId: null,
  setActiveGearId: jest.fn(),
  handleOpenManual: jest.fn(),
  handleUpdateWebLink: jest.fn(),
  handleDelete: jest.fn(),
  getStatusClass: (status: string) => `status-${status}`,
  page: 1,
  setPage: jest.fn(),
  totalCount: 2,
  rowsPerPage: 10,
  setRowsPerPage: jest.fn(),
  sortBy: 'created_at',
  setSortBy: jest.fn(),
  sortOrder: 'asc',
  setSortOrder: jest.fn(),
  isFutureVersion: true,
  hasActiveFilters: false,
};

describe('EnrollmentsTable', () => {
  it('renders table structure with rows and columns', () => {
    const { container } = render(<EnrollmentsTable {...defaultProps} />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(container.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('renders pagination range text', () => {
    render(<EnrollmentsTable {...defaultProps} />);
    expect(screen.getByText('1-2 из 2')).toBeInTheDocument();
  });

  it('calls handleOpenEdit when row clicked', () => {
    const mockOpen = jest.fn();
    const { container } = render(<EnrollmentsTable {...defaultProps} handleOpenEdit={mockOpen} />);
    const firstRow = container.querySelector('tbody tr');
    if (firstRow) fireEvent.click(firstRow);
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('gear menu renders when activeGearId is set', () => {
    render(<EnrollmentsTable {...defaultProps} activeGearId="e1" />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText(/Update Links/i)).toBeInTheDocument();
  });

  it('calls handleDelete when delete clicked in gear menu', () => {
    const mockDelete = jest.fn();
    render(<EnrollmentsTable {...defaultProps} handleDelete={mockDelete} activeGearId="e1" />);
    fireEvent.click(screen.getByText('Delete'));
    expect(mockDelete).toHaveBeenCalledWith('e1');
  });

  it('calls handleCopyLink when Share clicked in gear menu', () => {
    const mockCopy = jest.fn();
    render(<EnrollmentsTable {...defaultProps} handleCopyLink={mockCopy} activeGearId="e1" />);
    fireEvent.click(screen.getByText('Share'));
    expect(mockCopy).toHaveBeenCalledWith('e1');
  });

  it('shows empty state when no enrollments', () => {
    render(<EnrollmentsTable {...defaultProps} enrollments={[]} />);
    expect(screen.getByText("Let's set up your first Enrollment")).toBeInTheDocument();
  });

  it('shows filtered empty state', () => {
    render(<EnrollmentsTable {...defaultProps} enrollments={[]} hasActiveFilters />);
    expect(screen.getByText('No enrollments found')).toBeInTheDocument();
  });

  it('disables prev/next buttons on first and single page', () => {
    const mockSetPage = jest.fn();
    render(<EnrollmentsTable {...defaultProps} setPage={mockSetPage} />);
    expect(screen.getByLabelText('Предыдущая страница')).toBeDisabled();
    expect(screen.getByLabelText('Следующая страница')).toBeDisabled();
  });

  it('calls rows per page change and resets page', () => {
    const mockSetRows = jest.fn();
    const mockSetPage = jest.fn();
    render(<EnrollmentsTable {...defaultProps} setRowsPerPage={mockSetRows} setPage={mockSetPage} />);
    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '25' } });
    expect(mockSetRows).toHaveBeenCalledWith(25);
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });

  it('calls handleUpdateWebLink from gear menu', () => {
    const mockUpdate = jest.fn();
    render(<EnrollmentsTable {...defaultProps} handleUpdateWebLink={mockUpdate} activeGearId="e1" />);
    fireEvent.click(screen.getByText(/Update Links/i));
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('renders skeleton rows when loading', () => {
    render(<EnrollmentsTable {...defaultProps} isLoading />);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
  });
});
