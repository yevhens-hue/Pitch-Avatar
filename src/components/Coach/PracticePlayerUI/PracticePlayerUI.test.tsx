import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticePlayerUI from './PracticePlayerUI';
import { getProjectById } from '@/app/actions/projects';

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn()
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null })), // for settings
          order: jest.fn(() => Promise.resolve({
            data: [
              { id: '1', question_text: 'Test question 1', expected_answer: 'Test answer 1' }
            ]
          })) // for scenarios
        }))
      }))
    }))
  }
}));

describe('PracticePlayerUI', () => {
  beforeEach(() => {
    (getProjectById as jest.Mock).mockResolvedValue({ id: 'proj-123', title: 'Pitch Deck 2026', slides: [] });
    
    // Mock the fetch call for evaluate
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

  it('loads the scenario queue and evaluates user answer when a message is sent', async () => {
    render(<PracticePlayerUI projectId="proj-123" />);

    // Wait for input to be in the document
    const input = await screen.findByPlaceholderText(/Send a message/i);
    const sendButton = await screen.findByRole('button', { name: /Отправить/i });

    // Enter a message and press Enter
    fireEvent.change(input, { target: { value: 'My answer' } });
    fireEvent.click(sendButton);

    // The avatar should output the first question
    const questionText = await screen.findByText('Test question 1');
    expect(questionText).toBeInTheDocument();

    // After the first message, enter the answer
    fireEvent.change(input, { target: { value: 'My answer' } });
    fireEvent.click(sendButton);

    // Check if fetch was called for evaluation
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/coach/evaluate', expect.any(Object));
    });

    // Check if feedback is displayed
    // "Great answer!" comes from our mocked fetch response
    const feedback = await screen.findByText(/Great answer!/i);
    expect(feedback).toBeInTheDocument();
  });

  it('starts voice recognition when mic button is clicked', async () => {
    // Mock SpeechRecognition
    const mockStart = jest.fn();
    const mockStop = jest.fn();
    let onresultCallback: any;

    const MockSpeechRecognition = jest.fn().mockImplementation(() => ({
      start: mockStart,
      stop: mockStop,
      set onresult(cb: any) {
        onresultCallback = cb;
      },
      set onstart(cb: any) {},
      set onend(cb: any) {},
      set onerror(cb: any) {}
    }));

    (window as any).SpeechRecognition = MockSpeechRecognition;

    render(<PracticePlayerUI projectId="proj-123" />);

    const micButton = await screen.findByRole('button', { name: /Включить микрофон/i });
    expect(micButton).toBeInTheDocument();
    
    // Click the mic button
    fireEvent.click(micButton);

    expect(MockSpeechRecognition).toHaveBeenCalledTimes(1);
    expect(mockStart).toHaveBeenCalledTimes(1);

    // Simulate speech recognition result
    onresultCallback({
      results: [[{ transcript: 'Hello from voice' }]]
    });

    const input = await screen.findByPlaceholderText(/Send a message/i);
    expect(input).toHaveValue('Hello from voice');

    // Clean up
    delete (window as any).SpeechRecognition;
  });
});
