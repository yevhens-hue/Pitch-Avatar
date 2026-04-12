import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard Component', () => {
  it('should render key metrics', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('Avg. View Time')).toBeInTheDocument();
    expect(screen.getByText('Interactions')).toBeInTheDocument();
  });

  it('should render the stat values (mocked)', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('1,402')).toBeInTheDocument();
  });
});
