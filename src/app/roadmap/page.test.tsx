import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/components/Roadmap/RoadmapPlayer', () => {
  return function MockRoadmapPlayer() {
    return <div data-testid="roadmap-player">Roadmap Player</div>;
  };
});

describe('Roadmap Page', () => {
  it('renders roadmap player component', () => {
    render(<Page />);
    expect(screen.getByTestId('roadmap-player')).toBeInTheDocument();
  });
});