import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import RoadmapPlayer from './RoadmapPlayer';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/data/roadmap-data', () => ({
  roadmapData: [
    {
      id: '1',
      title: 'Onboarding',
      cards: [
        { id: 'c1', title: 'Welcome', description: 'Get started', status: 'completed' },
        { id: 'c2', title: 'Setup', description: 'Configure settings', status: 'pending' },
      ],
    },
  ],
}));

describe('RoadmapPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders roadmap title', () => {
    render(<RoadmapPlayer />);
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
  });

  it('renders cards', () => {
    render(<RoadmapPlayer />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Setup')).toBeInTheDocument();
  });

  it('shows completed status', () => {
    render(<RoadmapPlayer />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('renders expand button', () => {
    render(<RoadmapPlayer />);
    expect(screen.getByText('Expand')).toBeInTheDocument();
  });
});