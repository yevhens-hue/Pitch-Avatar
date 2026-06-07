import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

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
});