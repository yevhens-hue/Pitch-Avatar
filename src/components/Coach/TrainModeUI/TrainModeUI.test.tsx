import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrainModeUI from './TrainModeUI';
import { getProjectById } from '@/app/actions/projects';

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn()
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
    
    // Mock the fetch call for evaluate
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          avatarResponse: 'Here is a test for you',
          reactionType: 'text',
          testOptions: ['First Option', 'Second Option', 'Third Option'],
          isCorrect: true
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render dynamic test options over the slide when avatar sends testOptions', async () => {
    render(<TrainModeUI {...defaultProps} />);

    // Switch to Listener Mode
    const listenerModeBtn = screen.getByText('You speak as Listener');
    fireEvent.click(listenerModeBtn);

    // Find the chat input
    const input = screen.getByPlaceholderText('Напишите сообщение...');
    fireEvent.change(input, { target: { value: 'test trigger' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Wait for the mock fetch to resolve and state to update
    const option1 = await screen.findByText('A: First Option');
    const option2 = await screen.findByText('B: Second Option');

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();

    // The hardcoded options from previous implementation shouldn't be there
    expect(screen.queryByText('A: Option 1')).not.toBeInTheDocument();
  });
});
