import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import WizardLayout from './WizardLayout';

const steps = ['Step 1', 'Step 2', 'Step 3'];
const mockProps = {
  title: 'Test Wizard',
  steps,
  activeStep: 1,
  onStepClick: jest.fn(),
  onNext: jest.fn(),
  onExit: jest.fn(),
  children: <div>Content</div>,
};

describe('WizardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title', () => {
    render(<WizardLayout {...mockProps} />);
    expect(screen.getByText('Test Wizard')).toBeInTheDocument();
  });

  it('renders step labels', () => {
    render(<WizardLayout {...mockProps} />);
    steps.forEach(step => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('renders children', () => {
    render(<WizardLayout {...mockProps} />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onNext when next button is clicked', () => {
    render(<WizardLayout {...mockProps} />);
    fireEvent.click(screen.getByText('Next →'));
    expect(mockProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('disables next button when isNextDisabled is true', () => {
    render(<WizardLayout {...mockProps} isNextDisabled={true} />);
    expect(screen.getByText('Next →')).toBeDisabled();
  });

  it('shows finish label on last step', () => {
    render(<WizardLayout {...mockProps} activeStep={3} nextLabel="Finish" />);
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('calls onExit when exit button is clicked', () => {
    render(<WizardLayout {...mockProps} />);
    fireEvent.click(screen.getByText('Exit'));
    expect(mockProps.onExit).toHaveBeenCalledTimes(1);
  });

  it('marks completed steps as done', () => {
    render(<WizardLayout {...mockProps} activeStep={2} />);
    const doneStep = screen.getByText('Step 1');
    expect(doneStep.parentElement).toHaveClass('stepDone');
  });
});