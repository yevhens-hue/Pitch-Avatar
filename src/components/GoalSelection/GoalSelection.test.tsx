import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import GoalSelection from './GoalSelection'

describe('GoalSelection Component', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    mockOnNext.mockClear()
  })

  it('renders the title and all goal options', () => {
    render(<GoalSelection onNext={mockOnNext} />)
    
    // Check main title
    expect(screen.getByText('Какой основной цели вы хотели бы достичь с помощью Pitch Avatar?')).toBeTruthy()
    
    // Check options
    expect(screen.getByText('Создайте AI-аватар для корпоративного обучения и коммуникаций')).toBeTruthy()
    expect(screen.getByText('Создайте разговорного аватара для поддержки клиентов')).toBeTruthy()
    expect(screen.getByText('Я просто балуюсь')).toBeTruthy()
    expect(screen.getByText('Другое (пожалуйста, уточните)')).toBeTruthy()

    // Check button
    expect(screen.getByRole('button', { name: 'Далее' })).toBeTruthy()
  })

  it('allows selecting an option and clicking next', () => {
    render(<GoalSelection onNext={mockOnNext} />)
    
    const option = screen.getByText('Я просто балуюсь')
    fireEvent.click(option)
    
    // We expect some visual change (like class 'selected'), but we can verify the mock gets called when Next is clicked
    const nextButton = screen.getByRole('button', { name: 'Далее' })
    fireEvent.click(nextButton)
    
    expect(mockOnNext).toHaveBeenCalledWith('Я просто балуюсь')
  })
})
