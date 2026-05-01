import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import OnboardingSnov from './page';

jest.mock('@/components/Wizard/variants/SnovWizard', () => {
  return function MockSnovWizard() {
    return <div data-testid="onboarding-snov">Snov Wizard</div>;
  };
});

describe('Onboarding Snov Page', () => {
  it('renders snov wizard component', () => {
    render(<OnboardingSnov />);
    expect(screen.getByTestId('onboarding-snov')).toBeInTheDocument();
  });
});