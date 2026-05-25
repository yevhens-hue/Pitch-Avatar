import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

describe('Presentations Page', () => {
  it('renders presentations page title and headers', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: 'My Presentations' })).toBeInTheDocument();
    expect(screen.getByText('+ Create Presentation')).toBeInTheDocument();
  });

  it('renders mock presentations list', () => {
    render(<Page />);
    expect(screen.getByText('Q1 Marketing Campaign')).toBeInTheDocument();
    expect(screen.getByText('Sales Enablement')).toBeInTheDocument();
  });
});