import { POST } from './route';
import { requireAuth } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

jest.mock('@/lib/auth-guard', () => ({
  requireAuth: jest.fn()
}));

const mockSelect = jest.fn().mockResolvedValue({ data: [], error: null });
const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: (table: string) => mockFrom(table),
  })
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

    // Act
    const response = await POST(mockRequest);
    const jsonResponse = await response.json();

    // Assert
    expect(jsonResponse.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('buyer_scenarios');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        project_id: 'proj_123',
        question_text: 'Which option is best?',
        expected_answer: 'Option B',
        custom_actions: expect.objectContaining({
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
