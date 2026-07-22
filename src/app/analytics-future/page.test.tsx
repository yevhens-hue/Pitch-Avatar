import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from './page';

jest.mock('@/components/Analytics/AnalyticsDashboard', () => () => (
  <div>
    <h1>Analytics Dashboard</h1>
    <div>Total Sessions</div>
    <div>Avg. View Time</div>
    <div>Interactions</div>
  </div>
));

describe('Analytics Page', () => {
  it('renders analytics dashboard', () => {
    render(<AnalyticsPage />);
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
  });
});
