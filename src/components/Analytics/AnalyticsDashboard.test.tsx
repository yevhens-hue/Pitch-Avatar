import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard Component', () => {
  it('renders enrollment results header', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Enrollment Results')).toBeInTheDocument();
    expect(screen.getByText(/Track HR onboarding completion/)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Clear Report')).toBeInTheDocument();
    expect(screen.getByText('Download CSV')).toBeInTheDocument();
  });

  it('renders stat cards', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Total Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
