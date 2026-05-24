import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import RoadmapPlayer from './RoadmapPlayer';

jest.mock('@/data/roadmap-data', () => ({
  roadmapSlides: [
    {
      id: 1,
      tag: 'Tag A',
      title: 'Slide Title A',
      content: { metrics: [{ label: 'Metric A', value: 80 }] },
      script: 'This is the script content for Slide A.',
    },
    {
      id: 2,
      tag: 'Tag B',
      title: 'Slide Title B',
      content: { items: ['Feature B1', 'Feature B2'] },
      script: 'This is the script content for Slide B.',
    },
  ],
}));

jest.mock('lucide-react', () => {
  const MockIcon = (props: any) => null;
  return new Proxy({}, {
    get: () => MockIcon,
  });
});

describe('RoadmapPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders active slide title and tag', () => {
    render(<RoadmapPlayer />);
    expect(screen.getByText('Slide Title A')).toBeInTheDocument();
    expect(screen.getByText('Tag A')).toBeInTheDocument();
  });

  it('renders transcript tab with slide scripts', () => {
    render(<RoadmapPlayer />);
    expect(screen.getByText('This is the script content for Slide A.')).toBeInTheDocument();
    expect(screen.getByText('This is the script content for Slide B.')).toBeInTheDocument();
  });

  it('navigates to next slide on controls click', () => {
    render(<RoadmapPlayer />);
    const nextBtn = document.querySelector('button[class*="navBtn"]:last-child');
    expect(nextBtn).toBeInTheDocument();
    
    if (nextBtn) {
      fireEvent.click(nextBtn);
      expect(screen.getByText('Slide Title B')).toBeInTheDocument();
    }
  });
});