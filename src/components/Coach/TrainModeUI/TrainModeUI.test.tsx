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

    // Switch to practice preview if not already
    const practiceModeBtn = screen.getByText('🎯 Предпросмотр сессии');
    fireEvent.click(practiceModeBtn);

    const startBtn = screen.getByText('Начать тренировку');
    fireEvent.click(startBtn);

    // Wait for the mock fetch and UI update
    const option1 = await screen.findByText('A: First Option');
    const option2 = await screen.findByText('B: Second Option');

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(screen.queryByText('A: Option 1')).not.toBeInTheDocument();
  });

  it('should render slide binding select in Coach Mode', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const coachModeBtn = screen.getByText('⚙️ Настройка (Тренер)');
    fireEvent.click(coachModeBtn);

    const selectDropdown = await screen.findByText(/Привязка к слайду/i);
    expect(selectDropdown).toBeInTheDocument();
  });

  it('should render Buyer Persona and Start Mode settings in Config modal', async () => {
    render(<TrainModeUI {...defaultProps} />);

    const coachModeBtn = screen.getByText('⚙️ Настройка (Тренер)');
    fireEvent.click(coachModeBtn);

    // Open Config Modal
    const configBtn = await screen.findByText(/Настройки/i);
    fireEvent.click(configBtn);

    const personaSelect = await screen.findByLabelText(/Buyer Persona/i);
    const startModeSelect = await screen.findByLabelText(/Start Mode/i);

    expect(personaSelect).toBeInTheDocument();
    expect(startModeSelect).toBeInTheDocument();
  });
});
