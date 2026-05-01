import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import WalkthroughOnboarding from './page';

jest.mock('@/components/Wizard/variants/Walkthrough', () => {
  return function MockWalkthrough() {
    return <div data-testid="walkthrough">Walkthrough</div>;
  };
});

describe('Walkthrough Onboarding Page', () => {
  it('renders walkthrough component', () => {
    render(<WalkthroughOnboarding />);
    expect(screen.getByTestId('walkthrough')).toBeInTheDocument();
  });
});