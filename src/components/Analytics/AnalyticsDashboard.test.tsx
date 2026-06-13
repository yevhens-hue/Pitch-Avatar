import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Mock the useUIStore to avoid version conditionals
jest.mock('@/lib/store', () => ({
  useUIStore: () => ({ isFutureVersion: false }),
}))

import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard Component', () => {
  it('should render key metrics', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Enrollment Results')).toBeInTheDocument();
    expect(screen.getByText('Total Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render the stat values based on mock data', () => {
    render(<AnalyticsDashboard />);
    // MOCK_RESULTS has 8 entries total; 5 completed → stats show those counts
    expect(screen.getByText('8')).toBeInTheDocument(); // total
    expect(screen.getByText('5')).toBeInTheDocument(); // completed
  });
});
