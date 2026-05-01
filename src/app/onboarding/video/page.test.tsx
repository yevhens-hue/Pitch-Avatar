import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import OnboardingVideo from './page';

jest.mock('@/components/Wizard/variants/VideoWizard', () => {
  return function MockVideoWizard() {
    return <div data-testid="onboarding-video">Video Wizard</div>;
  };
});

describe('Onboarding Video Page', () => {
  it('renders video wizard component', () => {
    render(<OnboardingVideo />);
    expect(screen.getByTestId('onboarding-video')).toBeInTheDocument();
  });
});