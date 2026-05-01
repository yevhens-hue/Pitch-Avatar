import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/Player/Player', () => {
  return function MockPlayer() {
    return <div data-testid="player">Player</div>;
  };
});

describe('Play Page', () => {
  it('renders player component', () => {
    render(<Page />);
    expect(screen.getByTestId('player')).toBeInTheDocument();
  });

  it('renders exit preview button', () => {
    render(<Page />);
    expect(screen.getByText('Exit Preview')).toBeInTheDocument();
  });
});