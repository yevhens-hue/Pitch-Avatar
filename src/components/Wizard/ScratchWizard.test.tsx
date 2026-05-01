import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ScratchWizard from './ScratchWizard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('ScratchWizard', () => {
  it('renders scratch wizard title', () => {
    render(<ScratchWizard />);
    expect(screen.getByText('Start from Scratch')).toBeInTheDocument();
  });

  it('renders slide layout options', () => {
    render(<ScratchWizard />);
    expect(screen.getByText('Blank slide')).toBeInTheDocument();
    expect(screen.getByText('Title + Content')).toBeInTheDocument();
    expect(screen.getByText('Avatar + Text')).toBeInTheDocument();
    expect(screen.getByText('Split Screen')).toBeInTheDocument();
  });

  it('renders create button', () => {
    render(<ScratchWizard />);
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
});