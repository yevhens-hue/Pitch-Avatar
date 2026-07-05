import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

jest.mock('@/app/actions/coachActions', () => ({
  updateCoachSettings: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock simple debounce for tests to prevent delays
jest.mock('@/components/ProjectEditor/panels/CoachSettingsPanel', () => {
  const original = jest.requireActual('@/components/ProjectEditor/panels/CoachSettingsPanel');
  return original;
});

const mockUpdateSettings = jest.fn();
const mockSettings = {
  testFormat: 'text_voice',
  questionTiming: 'on_slides',
  questionOrder: 'sequential',
  feedbackFlags: {
    immediateFeedback: true,
    showCorrectAnswers: true,
    alwaysShowScore: false
  },
  passingScore: 70
};

jest.mock('@/lib/useCoachStore', () => ({
  useCoachStore: () => ({
    settings: mockSettings,
    setSettings: mockUpdateSettings,
  }),
}));

import CoachSettingsPanel from './CoachSettingsPanel';
import { updateCoachSettings } from '@/app/actions/coachActions';

describe('CoachSettingsPanel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders settings sections', () => {
    render(<CoachSettingsPanel projectId="123" />);
    
    expect(screen.getByText('Test Format')).toBeInTheDocument();
    expect(screen.getByText('Test Set Selection')).toBeInTheDocument();
    expect(screen.getByText('Question Timing')).toBeInTheDocument();
    expect(screen.getByText('Question Order')).toBeInTheDocument();
    expect(screen.getByText('Display Flags')).toBeInTheDocument();
    expect(screen.getByText('PASSING SCORE')).toBeInTheDocument();
  });

  it('calls setSettings and API when passing score changes', async () => {
    render(<CoachSettingsPanel projectId="123" />);
    
    
    
    const scoreInput = screen.getByRole('spinbutton');
    fireEvent.change(scoreInput, { target: { value: '80' } });
    
    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ passingScore: 80 }));
    
    await waitFor(() => {
      expect(updateCoachSettings).toHaveBeenCalled();
    });
  });

  it('toggles feedback flags properly', async () => {
    render(<CoachSettingsPanel projectId="123" />);
    
    const showScoreCheckbox = screen.getByRole('checkbox', { name: /show current score constantly/i });
    fireEvent.click(showScoreCheckbox);
    
    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({
      feedbackFlags: expect.objectContaining({ alwaysShowScore: true })
    }));
  });
});
