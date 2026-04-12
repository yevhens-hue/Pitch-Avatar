import { render, screen, fireEvent } from '@testing-library/react';
import ProjectEditor from './ProjectEditor';

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/test' } }),
      }),
    },
  }),
}));

jest.mock('lucide-react', () => ({
  Layers: 'Layers',
  User: 'User',
  BookOpen: 'BookOpen',
  Key: 'Key',
  FileText: 'FileText',
  Settings: 'Settings',
  ChevronDown: 'ChevronDown',
  Save: 'Save',
  Play: 'Play',
  Upload: 'Upload',
}));

describe('ProjectEditor Component', () => {
  it('should render the editor sections', () => {
    render(<ProjectEditor />);
    expect(screen.getAllByText('Slides').length).toBeGreaterThan(0);
  });

  it('should allow typing in the script editor', () => {
    render(<ProjectEditor />);
    const textarea = screen.getByPlaceholderText(/Enter script for this slide/i);
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(textarea).toHaveValue('Hello world');
  });
});