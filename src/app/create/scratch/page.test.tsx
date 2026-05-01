import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ScratchPage from './page';

jest.mock('@/components/Wizard/ScratchWizard', () => {
  return function MockScratchWizard() {
    return <div data-testid="scratch-wizard-page">Scratch Wizard</div>;
  };
});

describe('Scratch Page', () => {
  it('renders scratch wizard component', () => {
    render(<ScratchPage />);
    expect(screen.getByTestId('scratch-wizard-page')).toBeInTheDocument();
  });
});