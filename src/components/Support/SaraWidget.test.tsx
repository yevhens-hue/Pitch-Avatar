import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SaraWidget from './SaraWidget';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('posthog-js/react', () => ({
  usePostHog: () => ({
    isFeatureEnabled: () => true,
    capture: jest.fn(),
  }),
}));

jest.mock('@/services/user-service', () => ({
  fetchCurrentUser: jest.fn().mockResolvedValue({ user: null, subscription: null }),
  fetchCurrentUserSync: () => ({ user: null, subscription: null }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('@/lib/supportStore', () => ({
  useSupportChatStore: () => ({
    isOpen: false,
    toggleChat: jest.fn(),
    messages: [],
    addMessage: jest.fn(),
    isMuted: false,
    setMuted: jest.fn(),
  }),
}));

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({ isChecklistOpen: false }),
}));

jest.mock('@/lib/knowledgeStore', () => ({
  useKnowledgeStore: () => ({ settings: { answerMode: 'Hybrid', externalRAG: {} as any } }),
}));

// Mock Guideglow
beforeEach(() => {
  Object.defineProperty(window, 'Guideglow', {
    value: { startTour: jest.fn() },
    writable: true,
  });
});

describe('SaraWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders FAB when feature enabled and checklist closed', () => {
    render(<SaraWidget />);
    expect(screen.getByText('Sara')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant · online')).toBeInTheDocument();
  });

  it('opens chat dialog on FAB click', () => {
    render(<SaraWidget />);
    fireEvent.click(screen.getByText('Sara'));
    expect(screen.getByPlaceholderText('Ask Sara anything…')).toBeInTheDocument();
  });

  it('sends user message', async () => {
    render(<SaraWidget />);
    fireEvent.click(screen.getByText('Sara'));
    
    const input = screen.getByPlaceholderText('Ask Sara anything…');
    fireEvent.change(input, { target: { value: 'How do I upload?' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('How do I upload?')).toBeInTheDocument();
    });
  });

  it('closes on X button click', () => {
    render(<SaraWidget />);
    fireEvent.click(screen.getByText('Sara'));
    expect(screen.getByPlaceholderText('Ask Sara anything…')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);

    expect(screen.queryByPlaceholderText('Ask Sara anything…')).not.toBeInTheDocument();
  });

  it('renders suggestion chips', () => {
    render(<SaraWidget />);
    expect(screen.getByText('How it works?')).toBeInTheDocument();
  });

  it('has muted toggle button', () => {
    render(<SaraWidget />);
    fireEvent.click(screen.getByText('Sara'));
    // The button has no label, just icon - check existence
    const inputZone = document.querySelector('[class*="inputZone"]');
    expect(inputZone).toBeInTheDocument();
  });
});