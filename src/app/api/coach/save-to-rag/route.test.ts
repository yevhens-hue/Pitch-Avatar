import { POST } from './route';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

jest.mock('@/lib/auth-guard', () => ({
  requireAuth: jest.fn()
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis()
  }
}));

describe('POST /api/coach/save-to-rag', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue(null); // No auth error
  });

  it('should save dynamic test properties (reactionType, isTest, testOptions) into buyer_scenarios metadata', async () => {
    // Arrange
    const payload = {
      projectId: 'proj_123',
      questionText: 'Which option is best?',
      expectedAnswer: 'Option B',
      expectedSlideId: 'slide_2',
      saveTarget: 'scenario',
      reactionType: 'video',
      reactionData: 'http://video.com',
      isTest: true,
      testOptions: ['Option A', 'Option B', 'Option C'],
      correctOptionIndex: 1
    };

    mockRequest = {
      json: jest.fn().mockResolvedValue(payload)
    };

    const mockInsert = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({ data: [], error: null }) });
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'buyer_scenarios') {
        return { insert: mockInsert };
      }
      return { insert: jest.fn().mockReturnThis(), select: jest.fn() };
    });

    // Act
    const response = await POST(mockRequest);
    const jsonResponse = await response.json();

    // Assert
    expect(jsonResponse.success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('buyer_scenarios');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        project_id: 'proj_123',
        question_text: 'Which option is best?',
        expected_answer: 'Option B',
        metadata: expect.objectContaining({
          reactionType: 'video',
          reactionData: 'http://video.com',
          isTest: true,
          testOptions: ['Option A', 'Option B', 'Option C'],
          correctOptionIndex: 1
        })
      })
    );
  });
});
