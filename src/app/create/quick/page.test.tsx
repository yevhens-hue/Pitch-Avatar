import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuickPresentationPage from './page';

jest.mock('@/components/Wizard/QuickWizard', () => {
  return function MockQuickWizard() {
    return <div data-testid="quick-wizard-page">Quick Wizard</div>;
  };
});

describe('Quick Presentation Page', () => {
  it('renders quick wizard component', () => {
    render(<QuickPresentationPage />);
    expect(screen.getByTestId('quick-wizard-page')).toBeInTheDocument();
  });
});