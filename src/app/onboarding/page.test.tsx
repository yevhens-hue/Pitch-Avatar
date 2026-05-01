import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import OnboardingMaster from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Onboarding Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders onboarding title', () => {
    render(<OnboardingMaster />);
    expect(screen.getByText("What's your primary goal?")).toBeInTheDocument();
  });

  it('renders role options', () => {
    render(<OnboardingMaster />);
    expect(screen.getByText('Sales & Outreach')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Training & L&D')).toBeInTheDocument();
    expect(screen.getByText('Product & Dev')).toBeInTheDocument();
  });

  it('navigates to step 2 on role selection', () => {
    render(<OnboardingMaster />);
    fireEvent.click(screen.getByText('Sales & Outreach'));
    expect(screen.getByText('How would you like to start?')).toBeInTheDocument();
  });

  it('renders path options in step 2', () => {
    render(<OnboardingMaster />);
    fireEvent.click(screen.getByText('Sales & Outreach'));
    expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    expect(screen.getByText('Upload PDF / PPTX')).toBeInTheDocument();
    expect(screen.getByText('Magic AI Generation')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(<OnboardingMaster />);
    fireEvent.click(screen.getByText('Sales & Outreach'));
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('goes back to step 1', () => {
    render(<OnboardingMaster />);
    fireEvent.click(screen.getByText('Sales & Outreach'));
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText("What's your primary goal?")).toBeInTheDocument();
  });

  it('renders skip link', () => {
    render(<OnboardingMaster />);
    expect(screen.getByText('Skip to Workspace')).toBeInTheDocument();
  });

  it('renders trust banner', () => {
    render(<OnboardingMaster />);
    expect(screen.getByText('Trusted by 50,000+ creators')).toBeInTheDocument();
  });
});