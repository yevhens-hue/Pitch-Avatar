import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LibraryPage from './page';

jest.mock('@/components/Library/Library', () => {
  return function MockLibrary() {
    return <div data-testid="library">Library</div>;
  };
});

describe('Library Page', () => {
  it('renders library component', () => {
    render(<LibraryPage />);
    expect(screen.getByTestId('library')).toBeInTheDocument();
  });
});