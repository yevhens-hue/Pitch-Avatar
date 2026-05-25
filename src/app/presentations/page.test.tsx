import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    FileUp: MockIcon,
    PlusCircle: MockIcon,
    Trash2: MockIcon,
    FolderInput: MockIcon,
    Shield: MockIcon,
  };
});

describe('Presentations Page', () => {
  it('renders presentations page title and headers', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: 'My Presentations' })).toBeInTheDocument();
    expect(screen.getByText('+ Create Presentation')).toBeInTheDocument();
  });

  it('renders mock presentations list', () => {
    render(<Page />);
    expect(screen.getByText('Product Demo - Q1')).toBeInTheDocument();
    expect(screen.getByText('Sales Pitch April')).toBeInTheDocument();
    expect(screen.getByText('Company Overview')).toBeInTheDocument();
  });
});