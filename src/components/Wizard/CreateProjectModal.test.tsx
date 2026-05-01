import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreateProjectModal from './CreateProjectModal';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('CreateProjectModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal title', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Create new presentation')).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Upload file')).toBeInTheDocument();
    expect(screen.getByText('Upload video')).toBeInTheDocument();
    expect(screen.getByText('Start from scratch')).toBeInTheDocument();
    expect(screen.getByText('Start from template')).toBeInTheDocument();
    expect(screen.getByText('Create with AI')).toBeInTheDocument();
  });

  it('renders project name input', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByPlaceholderText('Presentation name')).toBeInTheDocument();
  });

  it('disables create button when no file selected', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Create')).toBeDisabled();
  });

  it('renders file upload zone', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Drag files here')).toBeInTheDocument();
  });

  it('renders template options', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    // Switch to template tab
    fireEvent.click(screen.getByText('Start from template'));
    expect(screen.getByText('B2B Sales Pitch')).toBeInTheDocument();
  });

  it('closes on cancel click', () => {
    const onClose = jest.fn();
    render(<CreateProjectModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to appropriate wizard on create', () => {
    const { useRouter } = require('next/navigation');
    const push = jest.fn();
    useRouter.mockReturnValue({ push });
    const onClose = jest.fn();

    render(<CreateProjectModal isOpen={true} onClose={onClose} />);
    
    // Need to select something first to enable button
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Create'));

    expect(push).toHaveBeenCalledWith(expect.stringContaining('/create/quick'));
  });
});