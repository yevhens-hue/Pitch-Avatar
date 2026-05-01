import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/GoalSelection/GoalSelection', () => {
  return function MockGoalSelection() {
    return <div data-testid="goal-selection">Goal Selection</div>;
  };
});

describe('Presentations Page', () => {
  it('renders goal selection component', () => {
    render(<Page />);
    expect(screen.getByTestId('goal-selection')).toBeInTheDocument();
  });
});