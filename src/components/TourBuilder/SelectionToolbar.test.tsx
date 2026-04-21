import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectionToolbar from './SelectionToolbar';

const mockElement = {
  tagName: 'DIV',
  id: 'test-id',
  parentElement: { tagName: 'BODY' },
  firstElementChild: { tagName: 'SPAN' },
  previousElementSibling: { tagName: 'DIV' },
  nextElementSibling: { tagName: 'DIV' },
  getBoundingClientRect: () => ({ top: 100, left: 50 }),
} as unknown as HTMLElement;

describe('SelectionToolbar', () => {
  it('renders toolbar buttons', () => {
    render(
      <SelectionToolbar 
        element={mockElement} 
        onClose={jest.fn()} 
        onUpdate={jest.fn()} 
      />
    );

    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn();
    render(
      <SelectionToolbar 
        element={mockElement} 
        onClose={onClose} 
        onUpdate={jest.fn()} 
      />
    );

    const cancelButton = screen.getByTitle('Cancel selection');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onUpdate with parent element when expand is clicked', () => {
    const onUpdate = jest.fn();
    render(
      <SelectionToolbar 
        element={mockElement} 
        onClose={jest.fn()} 
        onUpdate={onUpdate} 
      />
    );

    const expandButton = screen.getByTitle('Expand selection (Parent)');
    fireEvent.click(expandButton);

    expect(onUpdate).toHaveBeenCalledWith(mockElement.parentElement);
  });

  it('calls onUpdate with first child when shrink is clicked', () => {
    const onUpdate = jest.fn();
    render(
      <SelectionToolbar 
        element={mockElement} 
        onClose={jest.fn()} 
        onUpdate={onUpdate} 
      />
    );

    const shrinkButton = screen.getByTitle('Shrink selection (First Child)');
    fireEvent.click(shrinkButton);

    expect(onUpdate).toHaveBeenCalledWith(mockElement.firstElementChild);
  });

  it('calls onUpdate with previous sibling when prev is clicked', () => {
    const onUpdate = jest.fn();
    render(
      <SelectionToolbar 
        element={mockElement} 
        onClose={jest.fn()} 
        onUpdate={onUpdate} 
      />
    );

    const prevButton = screen.getByTitle('Previous sibling');
    fireEvent.click(prevButton);

    expect(onUpdate).toHaveBeenCalledWith(mockElement.previousElementSibling);
  });

  it('calls onUpdate with next sibling when next is clicked', () => {
    const onUpdate = jest.fn();
    render(
      <SelectionToolbar 
        element={mockElement} 
        onClose={jest.fn()} 
        onUpdate={onUpdate} 
      />
    );

    const nextButton = screen.getByTitle('Next sibling');
    fireEvent.click(nextButton);

    expect(onUpdate).toHaveBeenCalledWith(mockElement.nextElementSibling);
  });
});