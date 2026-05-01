import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProjectEditor from './ProjectEditor';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/user-service', () => ({
  fetchCurrentUserSync: () => ({ user: null, subscription: null }),
}));

describe('ProjectEditor', () => {
  it('renders project editor title', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
  });

  it('renders project name input', () => {
    render(<ProjectEditor />);
    expect(screen.getByLabelText('Project name')).toBeInTheDocument();
  });

  it('renders avatar section', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('AI Avatar')).toBeInTheDocument();
  });

  it('renders language select', () => {
    render(<ProjectEditor />);
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<ProjectEditor />);
    expect(screen.getByText('Save changes')).toBeInTheDocument();
  });
});