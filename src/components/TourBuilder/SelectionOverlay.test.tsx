import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SelectionOverlay from './SelectionOverlay';

const mockRect = { top: 100, left: 50, width: 200, height: 150 };
const mockElement = {
  tagName: 'DIV',
  id: 'test-element',
  dataset: { tour: 'step-1' },
  getBoundingClientRect: () => mockRect,
} as unknown as HTMLElement;

describe('SelectionOverlay', () => {
  it('renders hover overlay', () => {
    render(<SelectionOverlay element={mockElement} type="hover" />);

    expect(screen.getByTestId('selection-overlay-hover')).toBeInTheDocument();
  });

  it('renders select overlay with label', () => {
    render(<SelectionOverlay element={mockElement} type="select" />);

    expect(screen.getByText('div#test-element')).toBeInTheDocument();
  });

  it('renders data-tour attribute in label', () => {
    render(<SelectionOverlay element={mockElement} type="select" />);

    expect(screen.getByText(/data-tour/)).toBeInTheDocument();
  });
});