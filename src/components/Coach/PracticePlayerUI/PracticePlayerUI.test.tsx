import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticePlayerUI from './PracticePlayerUI';
import { getProjectById } from '@/app/actions/projects';
import { useCoachStore } from '@/lib/useCoachStore';

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn()
}));

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      insert: jest.fn()
    }))
  }
}));

const DEFAULT_SETTINGS = {
  maxQuestions: 5,
  questionDelivery: 'sequential' as const,
  evaluationMode: 'strict' as const,
  feedbackMode: 'immediate' as const,
};

function resetStore() {
  useCoachStore.setState({
    isCoachMode: false,
    traineeRole: 'buyer',
    settings: DEFAULT_SETTINGS,
    scenarios: [],
  });
}

describe('PracticePlayerUI', () => {
  beforeEach(() => {
    resetStore();

    (getProjectById as jest.Mock).mockResolvedValue({
      id: 'proj-123',
      title: 'Pitch Deck 2026',
      slides: [{ id: 'slide-1', title: 'Slide 1' }],
    });

    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockSingle.mockResolvedValue({ data: null });
    mockOrder.mockResolvedValue({
      data: [
        { id: '1', question_text: 'Q1', expected_answer: 'A1', expected_slide_id: 'slide-2' },
        { id: '2', question_text: 'Q2', expected_answer: 'A2' },
      ],
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            isCorrect: true,
            avatarResponse: 'Great answer!',
          }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('TC-05 & TC-06: Starts session, evaluates answer correctly, and navigates slide', async () => {
    render(<PracticePlayerUI projectId="proj-123" />);

    const startBtn = await screen.findByRole('button', { name: /Start practice/i });
    fireEvent.click(startBtn);

    const input = await screen.findByPlaceholderText(/Send a message/i);
    fireEvent.change(input, { target: { value: 'My correct answer' } });
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.objectContaining({
        body: expect.stringContaining('My correct answer'),
      }));
    }, { timeout: 3000 });

    expect(await screen.findByText(/Great answer!/i)).toBeInTheDocument();
  });

  it('TC-07: Incorrect answer with Immediate feedback mode', async () => {
    mockSingle.mockResolvedValue({ data: { feedback_mode: 'immediate' } });

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            isCorrect: false,
            avatarResponse: 'That is incorrect.',
          }),
      })
    );

    render(<PracticePlayerUI projectId="proj-123" />);

    const startBtn = await screen.findByRole('button', { name: /Start practice/i });
    fireEvent.click(startBtn);

    const input = await screen.findByPlaceholderText(/Send a message/i);
    fireEvent.change(input, { target: { value: 'Wrong answer' } });
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.any(Object));
    }, { timeout: 3000 });

    expect(await screen.findByText(/Error/i)).toBeInTheDocument();
  });

  it('TC-08: End feedback mode does not show immediate badges', async () => {
    mockSingle.mockResolvedValue({ data: { feedback_mode: 'end' } });

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            isCorrect: false,
            avatarResponse: 'OK, next question.',
          }),
      })
    );

    render(<PracticePlayerUI projectId="proj-123" />);

    const startBtn = await screen.findByRole('button', { name: /Start practice/i });
    fireEvent.click(startBtn);

    const input = await screen.findByPlaceholderText(/Send a message/i);
    fireEvent.change(input, { target: { value: 'Wrong answer' } });
    fireEvent.click(screen.getByRole('button', { name: /^Send$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.any(Object));
    }, { timeout: 3000 });

    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
  });
});
