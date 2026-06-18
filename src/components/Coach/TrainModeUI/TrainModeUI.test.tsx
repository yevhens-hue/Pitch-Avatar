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

  it('should render dynamic test options over the slide when avatar sends testOptions', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const practiceModeBtn = screen.getByText('Practice Mode');
    fireEvent.click(practiceModeBtn);

    const startBtn = screen.getByText('Start Practice Simulation');
    fireEvent.click(startBtn);

    // Wait for the mock fetch and UI update
    const option1 = await screen.findByText('A: First Option');
    const option2 = await screen.findByText('B: Second Option');

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(screen.queryByText('A: Option 1')).not.toBeInTheDocument();
  });

  // The original test tested for "Check Answer" and "Show Answer", but we hid those in Practice mode and it doesn't make sense to keep that test.
  // We'll replace it with testing attach slide checkbox.
  it('should render Attach Slide checkbox in Practice Mode', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const practiceModeBtn = screen.getByText('Practice Mode');
    fireEvent.click(practiceModeBtn);

    const startBtn = screen.getByText('Start Practice Simulation');
    fireEvent.click(startBtn);

    const attachCheckbox = await screen.findByLabelText(/Attach current slide/i);
    expect(attachCheckbox).toBeInTheDocument();
  });

});
