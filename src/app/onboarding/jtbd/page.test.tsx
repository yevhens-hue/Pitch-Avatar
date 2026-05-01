import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import OnboardingJTBD from './page';

jest.mock('@/components/Wizard/variants/JTBDWizard', () => {
  return function MockJTBDWizard() {
    return <div data-testid="onboarding-jtbd">JTBD Wizard</div>;
  };
});

describe('Onboarding JTBD Page', () => {
  it('renders jtbd wizard component', () => {
    render(<OnboardingJTBD />);
    expect(screen.getByTestId('onboarding-jtbd')).toBeInTheDocument();
  });
});