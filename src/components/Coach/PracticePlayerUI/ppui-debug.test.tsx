import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PracticePlayerUI from '@/components/Coach/PracticePlayerUI/PracticePlayerUI';
import { getProjectById } from '@/app/actions/projects';

jest.mock('@/app/actions/projects', () => ({
  getProjectById: jest.fn(() => Promise.resolve({ id: 'proj-123', title: 'Pitch Deck 2026', slides: [{id: 'slide-1', title: 'Slide 1'}] }))
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

test('debug actual', async () => {
  mockSelect.mockReturnThis();
  mockEq.mockReturnThis();
  mockSingle.mockResolvedValue({ data: { feedback_mode: 'immediate' } });
  mockOrder.mockResolvedValue({ data: [
    { id: '1', question_text: 'Q1', expected_answer: 'A1', expected_slide_id: 'slide-2' },
  ]});
  
  global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve({ success: true, isCorrect: false, avatarResponse: 'That is incorrect.' }),
  }));
  
  render(<PracticePlayerUI projectId="proj-123" />);
  
  const startBtn = await screen.findByRole('button', { name: /Start practice/i });
  fireEvent.click(startBtn);
  
  const input = await screen.findByPlaceholderText(/Send a message/i);
  fireEvent.change(input, { target: { value: 'Wrong answer' } });
  fireEvent.click(screen.getByRole('button', { name: /Send/i }));
  
  await waitFor(() => expect(global.fetch).toHaveBeenCalled(), { timeout: 3000 });
  
  const html = document.body.innerHTML;
  console.log('HAS Error:', html.includes('Error'));
  console.log('HAS evalBoxWrong:', html.includes('evalBoxWrong'));
  console.log('HAS That is incorrect:', html.includes('That is incorrect'));
});
