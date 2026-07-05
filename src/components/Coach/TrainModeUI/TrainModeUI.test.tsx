import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrainModeUI from './TrainModeUI';
import { getProjectById } from '@/app/actions/projects';

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn()
}));

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({ isFutureVersion: true })
}));

const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      order: mockOrder,
      insert: mockInsert
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } })
    }
  }
}));

jest.mock('@/lib/store', () => ({
  useUIStore: () => ({ isFutureVersion: true })
}));

describe('TrainModeUI', () => {
  const defaultProps = {
    projectId: 'test_123',
    slides: [
      { id: '1', title: 'Slide 1', imageUrl: '' }
    ],
    onExit: jest.fn()
  };

  beforeEach(() => {
    (getProjectById as jest.Mock).mockResolvedValue({ id: 'test_123', name: 'Test Project' });
    
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockOrder.mockResolvedValue({ data: [] });
    mockSingle.mockResolvedValue({ data: null });
    mockInsert.mockResolvedValue({ data: null, error: null });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          avatarResponse: 'Here is a test for you',
          reactionType: 'text',
          testOptions: ['First Option', 'Second Option', 'Third Option'],
          isCorrect: true,
          expectedAnswer: 'This is the expected answer',
          expectedSlideId: '2'
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('TC-01: Save scenario', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const coachModeBtn = screen.getByText('⚙️ Coach');
    fireEvent.click(coachModeBtn);

    const questionInput = await screen.findByPlaceholderText(/What is the ROI of the solution/i);
    const answerInput = await screen.findByPlaceholderText(/What the trainee should answer/i);
    
    fireEvent.change(questionInput, { target: { value: 'My Question' } });
    fireEvent.change(answerInput, { target: { value: 'My Answer' } });

    const saveBtn = screen.getByText('Save as Scenario');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/save-to-rag', expect.objectContaining({
        body: expect.stringContaining('My Question')
      }));
    });
  });

  it('TC-02: Test Answer panel', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const coachModeBtn = screen.getByText('⚙️ Coach');
    fireEvent.click(coachModeBtn);

    const questionInput = await screen.findByPlaceholderText(/What is the ROI of the solution/i);
    fireEvent.change(questionInput, { target: { value: 'My Question' } });

    const answerInput = await screen.findByPlaceholderText(/What the trainee should answer/i);
    fireEvent.change(answerInput, { target: { value: 'My Expected Answer' } });

    const quizToggle = screen.getByLabelText(/Test \/ Quiz/i);
    fireEvent.click(quizToggle);

    const testInput = await screen.findByPlaceholderText(/Enter student's test answer/i);
    fireEvent.change(testInput, { target: { value: 'Testing answer' } });
    
    const checkBtn = screen.getByText('Check answer');
    fireEvent.click(checkBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.any(Object));
      // In TrainModeUI, feedback is shown in a div with testFeedback
      expect(screen.getByText(/Here is a test for you/i)).toBeInTheDocument();
    });
  });

  it('TC-03: seller_asks_first setting', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const coachModeBtn = screen.getByText('⚙️ Coach');
    fireEvent.click(coachModeBtn);

    const configBtn = await screen.findByText('Settings');
    fireEvent.click(configBtn);

    const startModeSelect = await screen.findByLabelText(/Start Mode/i);
    fireEvent.change(startModeSelect, { target: { value: 'seller_asks_first' } });

    const applyBtn = screen.getByText('Done');
    fireEvent.click(applyBtn);

    await waitFor(() => {
      expect(mockEq).toHaveBeenCalledWith('project_id', 'test_123');
    });
  });

  it('TC-04: Knowledge base loading', async () => {
    mockOrder.mockResolvedValueOnce({
      data: [
        { id: 'scen-1', question_text: 'DB Q1', expected_answer: 'DB A1' }
      ]
    });

    render(<TrainModeUI {...defaultProps} />);

    const coachModeBtn = screen.getByText('⚙️ Coach');
    fireEvent.click(coachModeBtn);

    const scenariosTab = await screen.findByText(/Scenarios/i);
    fireEvent.click(scenariosTab);

    // Verify scenario loaded from DB is displayed in the saved scenarios panel
    await waitFor(async () => {
      const scenarioItem = await screen.findByText(/DB Q1/i);
      expect(scenarioItem).toBeInTheDocument();
    });
  });
});
