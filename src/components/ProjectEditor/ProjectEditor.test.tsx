import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectEditor from './ProjectEditor';

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    Layers: MockIcon,
    User: MockIcon,
    BookOpen: MockIcon,
    Key: MockIcon,
    FileText: MockIcon,
    Settings: MockIcon,
    PlayCircle: MockIcon,
  };
});

describe('ProjectEditor', () => {
  it('renders editor tabs navigation', () => {
    render(<ProjectEditor />);
    expect(screen.getAllByText('Slides')[0]).toBeInTheDocument();
    expect(screen.getByText('Avatar')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders slides list and thumbnail panel by default', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
    expect(screen.getByText('Slide 3')).toBeInTheDocument();
  });

  it('renders script editor and visual preview', () => {
    render(<ProjectEditor />);
    expect(screen.getByPlaceholderText('Enter script for this slide...')).toBeInTheDocument();
    expect(screen.getByText('Slide 1 Visual Preview')).toBeInTheDocument();
  });

  it('switches tabs on click', () => {
    render(<ProjectEditor />);
    
    // Switch to settings tab
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByText('Viewer Layout')).toBeInTheDocument();

    // Switch to avatar tab
    fireEvent.click(screen.getByText('Avatar'));
    expect(screen.getByText('Avatar Settings')).toBeInTheDocument();
    expect(screen.getByText('Professional Presenter')).toBeInTheDocument();
  });
});