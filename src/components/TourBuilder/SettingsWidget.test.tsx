import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsWidget from './SettingsWidget';

const mockElement = {
  tagName: 'DIV',
  id: 'test-element',
  dataset: { tour: 'step-1' },
  className: 'class1 class2',
  parentElement: { 
    tagName: 'SECTION',
    id: 'parent',
    parentElement: document.body,
  },
} as unknown as HTMLElement;

describe('SettingsWidget', () => {
  it('renders element settings panel', () => {
    render(<SettingsWidget element={mockElement} onClose={jest.fn()} />);

    expect(screen.getByText('Element Settings')).toBeInTheDocument();
  });

  it('displays CSS selector for element', () => {
    render(<SettingsWidget element={mockElement} onClose={jest.fn()} />);

    expect(screen.getByText('[data-tour="step-1"]')).toBeInTheDocument();
  });

  it('displays element tag name', () => {
    render(<SettingsWidget element={mockElement} onClose={jest.fn()} />);

    expect(screen.getByText('<div>')).toBeInTheDocument();
  });

  it('displays parent chain', () => {
    render(<SettingsWidget element={mockElement} onClose={jest.fn()} />);

    expect(screen.getByText('section#parent')).toBeInTheDocument();
  });

  it('switches to design tab when clicked', () => {
    render(<SettingsWidget element={mockElement} onClose={jest.fn()} />);

    const designTab = screen.getByText('Design');
    fireEvent.click(designTab);

    expect(screen.getByText('Design settings coming soon...')).toBeInTheDocument();
  });

  it('calls onClose when save highlight is clicked', () => {
    const onClose = jest.fn();
    render(<SettingsWidget element={mockElement} onClose={onClose} />);

    const saveButton = screen.getByText('Save Highlight');
    fireEvent.click(saveButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches back to selection tab', () => {
    render(<SettingsWidget element={mockElement} onClose={jest.fn()} />);

    const designTab = screen.getByText('Design');
    fireEvent.click(designTab);

    const selectionTab = screen.getByText('Selection');
    fireEvent.click(selectionTab);

    expect(screen.getByText('[data-tour="step-1"]')).toBeInTheDocument();
  });
});