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
    
    expect(screen.getByText('What is the main goal you would like to achieve with Pitch Avatar?')).toBeTruthy()
    
    expect(screen.getByText('Create an AI avatar for corporate training and communications')).toBeTruthy()
    expect(screen.getByText('Create a conversational avatar for customer support')).toBeTruthy()
    expect(screen.getByText('I am just playing around')).toBeTruthy()
    expect(screen.getByText('Other (please specify)')).toBeTruthy()

    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy()
  })

  it('allows selecting an option and clicking next', () => {
    render(<GoalSelection onNext={mockOnNext} />)
    
    const option = screen.getByText('I am just playing around')
    fireEvent.click(option)
    
    const nextButton = screen.getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)
    
    expect(mockOnNext).toHaveBeenCalledWith('I am just playing around')
  })
})