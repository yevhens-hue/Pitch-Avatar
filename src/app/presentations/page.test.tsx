import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return {
    FileUp: MockIcon,
    PlusCircle: MockIcon,
  };
});

describe('Presentations Page', () => {
  it('renders presentations page title and headers', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: 'My Presentations' })).toBeInTheDocument();
    expect(screen.getByText('Upload PDF/PPTX')).toBeInTheDocument();
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });

  it('renders mock presentations list', () => {
    render(<Page />);
    expect(screen.getByText('Sales Deck 2024')).toBeInTheDocument();
    expect(screen.getByText('Investor Pitch')).toBeInTheDocument();
    expect(screen.getByText('Q3 Product Roadmap')).toBeInTheDocument();
  });
});