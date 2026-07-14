import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import CoachSettingsPanel from './CoachSettingsPanel'
import { updateCoachSettings } from '@/app/actions/coachActions'

jest.mock('@/app/actions/coachActions', () => ({
  updateCoachSettings: jest.fn(() => Promise.resolve({ success: true })),
}))

const mockUpdateSettings = jest.fn()
const mockSettings = {
  testFormat: 'text_voice',
  questionTiming: 'on_slides',
  questionOrder: 'sequential',
  feedbackFlags: {
    immediateFeedback: true,
    showCorrectAnswers: true,
    alwaysShowScore: false,
  },
  showRemainingQuestions: true,
  passingScore: 70,
}

const mockScenarios = [
  { id: '1', questionText: 'What problem do we solve?', expectedAnswer: 'Pain point', questionType: 'product', expectedSlideId: '1' },
  { id: '2', questionText: 'How do you price it?', expectedAnswer: 'Pricing', questionType: 'price', expectedSlideId: 'any' },
  { id: '3', questionText: 'What is the ROI?', expectedAnswer: 'ROI', questionType: 'roi', expectedSlideId: '2' },
]

jest.mock('@/lib/useCoachStore', () => ({
  useCoachStore: () => ({
    settings: mockSettings,
    setSettings: mockUpdateSettings,
    scenarios: mockScenarios,
  }),
}))

describe('CoachSettingsPanel', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders refreshed coach settings sections', () => {
    render(<CoachSettingsPanel projectId="123" hasPresentation />)

    expect(screen.getByText('Training setup')).toBeInTheDocument()
    expect(screen.getByText('Question coverage')).toBeInTheDocument()
    expect(screen.getByText('Learner feedback')).toBeInTheDocument()
    expect(screen.getByText('3 questions')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('calls setSettings and API when session limit changes', async () => {
    render(<CoachSettingsPanel projectId="123" hasPresentation />)

    const limitInput = screen.getByRole('spinbutton', { name: /session time limit in minutes/i })
    fireEvent.change(limitInput, { target: { value: '18' } })

    await act(async () => {
      jest.advanceTimersByTime(900)
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ sessionDurationLimit: 18 }))

    await waitFor(() => {
      expect(updateCoachSettings).toHaveBeenCalled()
    })
  })

  it('toggles learner feedback properly', async () => {
    render(<CoachSettingsPanel projectId="123" hasPresentation />)

    const showScoreCheckbox = screen.getByRole('checkbox', { name: /keep the current score visible during the session/i })
    fireEvent.click(showScoreCheckbox)

    await act(async () => {
      jest.advanceTimersByTime(900)
    })

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbackFlags: expect.objectContaining({ alwaysShowScore: true }),
      }),
    )
  })
})
