import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('@/lib/store', () => ({
  useUIStore: jest.fn(),
}));

jest.mock('@/constants/onboarding', () => ({
  ONBOARDING_CHECKLISTS: {
    video: [
      {
        id: 0,
        title: 'Test Step',
        desc: 'Test description',
        path: '/',
        target: '[data-tour="test"]',
        position: 'bottom' as const,
        video: 'https://example.com/video.mp4',
        trigger: () => {},
      },
    ],
  },
  ONBOARDING_STEPS: [],
}));

import OnboardingGuide from './OnboardingGuide';

describe('OnboardingGuide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useUIStore } = require('@/lib/store');
    (useUIStore as jest.Mock).mockReturnValue({
      isGuideOpen: true,
      isGuideMinimized: false,
      setGuideMinimized: jest.fn(),
      closeGuide: jest.fn(),
      openGuide: jest.fn(),
      activeChecklist: 'video',
      setActiveChecklist: jest.fn(),
      guideCompletedSteps: [],
      currentGuideStep: 0,
      setCurrentGuideStep: jest.fn(),
      completeGuideStep: jest.fn(),
      spotlightStepIndex: null,
      setSpotlightStep: jest.fn(),
      isOnboardingCompleted: false,
      setOnboardingCompleted: jest.fn(),
    });
  });

  it('renders the checklist widget when guide is open', () => {
    render(<OnboardingGuide />);
    expect(screen.getByText('Checklist 1 — Avatar Video')).toBeInTheDocument();
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
    expect(screen.getByText('+5 avatar minutes')).toBeInTheDocument();
  });

  it('minimizes widget when minimize button is clicked', () => {
    const setGuideMinimized = jest.fn();
    const { useUIStore } = require('@/lib/store');
    (useUIStore as jest.Mock).mockReturnValue({
      isGuideOpen: true,
      isGuideMinimized: false,
      setGuideMinimized,
      closeGuide: jest.fn(),
      openGuide: jest.fn(),
      activeChecklist: 'video',
      setActiveChecklist: jest.fn(),
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

    // Click header to minimize (header click triggers setGuideMinimized(true))
    const headerElement = screen.getByText('Checklist 1 — Avatar Video');
    fireEvent.click(headerElement);

    expect(setGuideMinimized).toHaveBeenCalledWith(true);
  });
});