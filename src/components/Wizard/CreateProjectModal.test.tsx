import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreateProjectModal from './CreateProjectModal';
import { createProject } from '@/app/actions/projects';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/actions/projects', () => ({
  createProject: jest.fn(() => Promise.resolve({ id: 'proj_123' })),
  updateProjectSlides: jest.fn(() => Promise.resolve({ success: true })),
}));

describe('CreateProjectModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
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
    fireEvent.click(screen.getByText('Start from template'));
    expect(screen.getByText('Product Presentation')).toBeInTheDocument();
  });

  it('closes on cancel click', () => {
    const onClose = jest.fn();
    render(<CreateProjectModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls createProject when Create is clicked with a file', async () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByText('Create'));

    // createProject should be called with the expected arguments
    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.any(String),
        type: expect.any(String),
        status: 'draft',
      })
    );
  });

  it('renders Coach Mode toggle in advanced settings', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText(/Advanced settings/i));
    // Coach Mode is now provided by the shared <CoachSetup /> component
    expect(screen.getByText('Coach Mode')).toBeInTheDocument();
  });

  it('shows Trainee Role selector when Coach Mode is enabled', () => {
    render(<CreateProjectModal isOpen={true} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText(/Advanced settings/i));
    const coachToggle = screen.getByRole('checkbox', { name: /coach mode/i });
    fireEvent.click(coachToggle);
    expect(screen.getByText(/Trainee Role/i)).toBeInTheDocument();
  });
});
