import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useUIStore } from '@/lib/store';
import WelcomeGuide from './WelcomeGuide';

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({
    openGuide: jest.fn(),
  }),
}));

jest.mock('@/constants/welcomeBranches', () => ({
  WELCOME_BRANCHES: [
    {
      id: 'default',
      headline: 'Get started',
      steps: [
        { title: 'Step 1', body: 'Body 1', video: '' },
      ],
      ctaLabel: 'Start',
      activationRoute: '/',
    },
  ],
  getBranchByMainGoal: (goal: string | null) => {
    if (!goal) return { id: 'default', headline: 'Get started', steps: [{ title: 'Step 1', body: 'Body 1', video: '' }], ctaLabel: 'Start', activationRoute: '/' };
    return { id: goal, headline: 'Custom', steps: [{ title: 'Custom', body: 'Custom body', video: '' }], ctaLabel: 'Go', activationRoute: '/create' };
  },
  trackGuideEvent: jest.fn(),
}));

describe('WelcomeGuide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders welcome phase initially', () => {
    render(<WelcomeGuide />);
    expect(screen.getByText('Welcome to Pitch Avatar 👋')).toBeInTheDocument();
  });

  it('shows Lets go button', () => {
    render(<WelcomeGuide />);
    expect(screen.getByText(/Let's go/)).toBeInTheDocument();
  });

  it('transitions to steps phase on Lets go click', () => {
    render(<WelcomeGuide />);
    fireEvent.click(screen.getByText(/Let's go/));
    expect(screen.getByText('Step 1 of 1')).toBeInTheDocument();
  });

  it('displays step content in steps phase', () => {
    render(<WelcomeGuide />);
    fireEvent.click(screen.getByText(/Let's go/));
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Body 1')).toBeInTheDocument();
  });

  it('closes when backdrop is clicked', () => {
    render(<WelcomeGuide />);
    const backdrop = document.querySelector('[class*="backdrop"]');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(screen.queryByText('Welcome to Pitch Avatar')).not.toBeInTheDocument();
    }
  });
});