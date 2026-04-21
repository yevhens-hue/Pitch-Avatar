import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import { ONBOARDING_STEPS } from '@/constants/onboarding';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({
    isGuideOpen: true,
    isGuideMinimized: false,
    setGuideMinimized: jest.fn(),
    closeGuide: jest.fn(),
    openGuide: jest.fn(),
    guideCompletedSteps: [],
    currentGuideStep: 0,
    setCurrentGuideStep: jest.fn(),
    completeGuideStep: jest.fn(),
    spotlightStepIndex: null,
    setSpotlightStep: jest.fn(),
    isOnboardingCompleted: false,
    setOnboardingCompleted: jest.fn(),
  }),
}));

jest.mock('@/constants/onboarding', () => ({
  ONBOARDING_STEPS: [
    {
      id: 0,
      title: 'Test Step',
      desc: 'Test description',
      path: '/',
      target: '[data-tour="test"]',
      position: 'bottom' as const,
      video: 'https://example.com/video.mp4',
      trigger: () => true,
    },
  ],
}));

import OnboardingGuide from './OnboardingGuide';

describe('OnboardingGuide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the checklist widget when guide is open', () => {
    render(<OnboardingGuide />);

    expect(screen.getByText('Launch Checklist')).toBeInTheDocument();
  });

  it('renders onboarding steps', () => {
    render(<OnboardingGuide />);

    expect(screen.getByText('Test Step')).toBeInTheDocument();
  });

  it('displays progress indicator', () => {
    render(<OnboardingGuide />);

    expect(screen.getByText(/0\/1/)).toBeInTheDocument();
  });

  it('renders the reward badge', () => {
    render(<OnboardingGuide />);

    expect(screen.getByText('+5 AI min reward')).toBeInTheDocument();
  });

  it('minimizes widget when minimize button is clicked', () => {
    const setGuideMinimized = jest.fn();
    const { useUIStore } = require('@/lib/store');
    useUIStore.mockReturnValue({
      isGuideOpen: true,
      isGuideMinimized: false,
      setGuideMinimized,
      closeGuide: jest.fn(),
      openGuide: jest.fn(),
      guideCompletedSteps: [],
      currentGuideStep: 0,
      setCurrentGuideStep: jest.fn(),
      completeGuideStep: jest.fn(),
      spotlightStepIndex: null,
      setSpotlightStep: jest.fn(),
      isOnboardingCompleted: false,
      setOnboardingCompleted: jest.fn(),
    });

    render(<OnboardingGuide />);

    const toggleBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleBtn);

    expect(setGuideMinimized).toHaveBeenCalledWith(true);
  });
});