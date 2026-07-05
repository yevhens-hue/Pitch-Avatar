import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoachQASetPanel from './CoachQASetPanel';
import { useCoachStore } from '@/lib/useCoachStore';
import { updateCoachScenarios } from '@/app/actions/coachActions';

// ── Mock Zustand Store ───────────────────────────────────────────────
jest.mock('@/lib/useCoachStore', () => ({
  useCoachStore: jest.fn(),
}));

jest.mock('@/app/actions/coachActions', () => ({
  updateCoachScenarios: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock lucide-react to render identifiable elements for icons
jest.mock('lucide-react', () => {
  return {
    Link2: () => <span data-testid="link2-icon" />,
    FileText: () => <span data-testid="filetext-icon" />,
    Plus: () => <span data-testid="plus-icon" />,
    X: (props: any) => <button {...props} data-testid="x-icon">Delete</button>,
    Edit2: (props: any) => <button {...props} data-testid="edit-icon">Edit</button>,
  };
});

const mockSetScenarios = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useCoachStore as unknown as jest.Mock).mockReturnValue({
    scenarios: [
      { id: '1', questionText: 'What is Pitch Avatar?', expectedAnswer: 'A presentation tool', questionType: 'product', roleTemplate: 'buyer', evaluationCriteria: [] },
    ],
    setScenarios: mockSetScenarios,
    traineeRole: 'buyer',
  });
});

describe('CoachQASetPanel', () => {
  it('renders panel headers', () => {
    render(<CoachQASetPanel projectId="proj_1" />);
    expect(screen.getByText('Coach Q&A Set')).toBeInTheDocument();
    expect(screen.getByText('Content Source')).toBeInTheDocument();
    expect(screen.getByText('Generation Parameters')).toBeInTheDocument();
  });

  it('renders existing scenarios in the Test Set', () => {
    render(<CoachQASetPanel projectId="proj_1" />);
    expect(screen.getByText('What is Pitch Avatar?')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
  });

  it('adds a new scenario manually', () => {
    render(<CoachQASetPanel projectId="proj_1" />);
    const addBtn = screen.getByText('+ Add manually');
    fireEvent.click(addBtn);

    expect(mockSetScenarios).toHaveBeenCalledTimes(1);
    
    // Expect setScenarios to be called with the new item added to the beginning
    const newScenarios = mockSetScenarios.mock.calls[0][0];
    expect(newScenarios).toHaveLength(2);
    expect(newScenarios[0].questionText).toBe('New Question?');
  });

  it('deletes a scenario', () => {
    render(<CoachQASetPanel projectId="proj_1" />);
    
    // Find delete button
    const deleteBtns = screen.getAllByRole('button', { name: /delete question/i });
    if (deleteBtns.length > 0) {
      fireEvent.click(deleteBtns[0]);
    } else {
      // If we don't have aria-labels, we'll just mock it directly or click the generic button
      const allBtns = screen.getAllByRole('button');
      // The last button in the row is usually delete
      fireEvent.click(allBtns[allBtns.length - 1]);
    }

    expect(mockSetScenarios).toHaveBeenCalledTimes(1);
    const updatedScenarios = mockSetScenarios.mock.calls[0][0];
    expect(updatedScenarios).toHaveLength(0); // 1 - 1 = 0
  });
  
  it('calls updateCoachScenarios when adding manually', async () => {
    render(<CoachQASetPanel projectId="proj_1" />);
    const addBtn = screen.getByText('+ Add manually');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(updateCoachScenarios).toHaveBeenCalledWith('proj_1', expect.any(Array));
    });
  });
});
