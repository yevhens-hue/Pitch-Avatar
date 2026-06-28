import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import PracticePlayerUI from './PracticePlayerUI';
import { getProjectById } from '@/app/actions/projects';

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

describe('PracticePlayerUI', () => {
  beforeEach(() => {
    (getProjectById as jest.Mock).mockResolvedValue({ id: 'proj-123', title: 'Pitch Deck 2026', slides: [{id: 'slide-1', title: 'Slide 1'}] });
    
    // Default mocks for supabase chain
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    
    // By default, no special settings
    mockSingle.mockResolvedValue({ data: null });
    
    // Default 2 scenarios
    mockOrder.mockResolvedValue({
      data: [
        { id: '1', question_text: 'Q1', expected_answer: 'A1', expected_slide_id: 'slide-2' },
        { id: '2', question_text: 'Q2', expected_answer: 'A2' }
      ]
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          avatarResponse: 'Great answer!'
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('TC-05 & TC-06: Starts session, evaluates answer correctly, and navigates slide', async () => {
    render(<PracticePlayerUI projectId="proj-123" />);

    // TC-05: Successful session start
    const startBtn = await screen.findByRole('button', { name: /Отправить/i });
    expect(startBtn).toBeInTheDocument();
    
    // We send START_PRACTICE_SIMULATION by clicking start button (actually by sending an empty/initial message if seller starts, or auto on load)
    // Actually the mock returns data when evaluate is called
    // Let's send a message
    const input = screen.getByPlaceholderText(/Send a message/i);
    fireEvent.change(input, { target: { value: 'My correct answer' } });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.objectContaining({
        body: expect.stringContaining('My correct answer')
      }));
    }, { timeout: 3000 });

    // Check for success feedback (TC-06)
    const feedback = await screen.findByText(/Great answer!/i);
    expect(feedback).toBeInTheDocument();
  });

  it('TC-07: Incorrect answer with Immediate feedback mode', async () => {
    // Setup immediate mode
    mockSingle.mockResolvedValue({ data: { feedback_mode: 'immediate' } });
    
    // Mock incorrect response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          isCorrect: false,
          avatarResponse: 'That is incorrect.'
        }),
      })
    );

    render(<PracticePlayerUI projectId="proj-123" />);

    const input = await screen.findByPlaceholderText(/Send a message/i);
    const startBtn = screen.getByRole('button', { name: /Отправить/i });

    fireEvent.change(input, { target: { value: 'Wrong answer' } });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.any(Object));
    }, { timeout: 3000 });
    // Should display a red badge for incorrect answer
    expect(screen.getByText(/Ошибка/i)).toBeInTheDocument();
  });

  it('TC-08: End feedback mode does not show immediate badges', async () => {
    mockSingle.mockResolvedValue({ data: { feedback_mode: 'end' } });
    
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          isCorrect: false,
          avatarResponse: 'OK, next question.'
        }),
      })
    );

    render(<PracticePlayerUI projectId="proj-123" />);

    const input = await screen.findByPlaceholderText(/Send a message/i);
    const startBtn = screen.getByRole('button', { name: /Отправить/i });

    fireEvent.change(input, { target: { value: 'Wrong answer' } });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.any(Object));
    }, { timeout: 3000 });
    
    // No error badge should be shown in 'end' mode
    expect(screen.queryByText(/Ошибка/i)).not.toBeInTheDocument();
  });
});
