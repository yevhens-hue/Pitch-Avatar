import { render, screen, fireEvent } from '@testing-library/react';
import ProjectEditor from './ProjectEditor';

describe('ProjectEditor Component', () => {
  it('should render the editor sections', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Slides')).toBeInTheDocument();
    expect(screen.getByText('Script Editor')).toBeInTheDocument();
    expect(screen.getByText('Avatar Settings')).toBeInTheDocument();
  });

  it('should allow typing in the script editor', () => {
    render(<ProjectEditor />);
    const textArea = screen.getByPlaceholderText(/Enter script for this slide/i);
    fireEvent.change(textArea, { target: { value: 'Hello world' } });
    expect(textArea).toHaveValue('Hello world');
  });
});
