import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/ProjectEditor/ProjectEditor', () => {
  return function MockProjectEditor() {
    return <div data-testid="project-editor">Project Editor</div>;
  };
});

describe('Editor Page', () => {
  it('renders project editor component', () => {
    render(<Page />);
    expect(screen.getByTestId('project-editor')).toBeInTheDocument();
  });

  it('renders preview button', () => {
    render(<Page />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders share project button', () => {
    render(<Page />);
    expect(screen.getByText('Share project')).toBeInTheDocument();
  });
});