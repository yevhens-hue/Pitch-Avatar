import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchWizard from './ScratchWizard';



describe('ScratchWizard', () => {
  it('renders scratch wizard title', () => {
    render(<ScratchWizard />);
    expect(screen.getByText('Set Up Your Project')).toBeInTheDocument();
  });

  it('renders slide layout options', () => {
    render(<ScratchWizard />);
    expect(screen.getByText(/Blank Slide/)).toBeInTheDocument();
    expect(screen.getByText(/Title \+ Content/)).toBeInTheDocument();
    expect(screen.getByText(/Avatar \+ Text/)).toBeInTheDocument();
    expect(screen.getByText(/Split Screen/)).toBeInTheDocument();
  });

  it('renders create button', () => {
    render(<ScratchWizard />);
    expect(screen.getByRole('button', { name: 'Open Editor' })).toBeInTheDocument();
  });
});