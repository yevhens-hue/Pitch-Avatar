import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MagicOnboarding from './page';

jest.mock('@/components/Wizard/variants/MagicWizard', () => {
  return function MockMagicWizard() {
    return <div data-testid="magic-wizard-page">Magic Wizard</div>;
  };
});

describe('Magic Onboarding Page', () => {
  it('renders magic wizard component', () => {
    render(<MagicOnboarding />);
    expect(screen.getByTestId('magic-wizard-page')).toBeInTheDocument();
  });
});