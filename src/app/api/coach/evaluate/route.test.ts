import { POST } from './route';
import { requireAuth } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

jest.mock('@/lib/auth-guard', () => ({
  requireAuth: jest.fn()
}));

const mockSingle = jest.fn();
const mockEq = jest.fn().mockReturnValue({
  single: mockSingle,
  then: jest.fn().mockResolvedValue({ data: [], error: null })
});
const mockSelect = jest.fn().mockReturnValue({
  eq: mockEq,
  then: jest.fn().mockResolvedValue({ data: [], error: null })
});
const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  insert: jest.fn().mockReturnThis()
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: (table: string) => mockFrom(table),
  })
}));

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }]
      })
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'mocked response' } }]
        })
      }
    }
  }));
});

describe('POST /api/coach/evaluate', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue(null);
  });

  it('should retrieve a test scenario from database and return its custom options and reaction', async () => {
    // Arrange
    const payload = {
      projectId: 'proj_123',
      slideId: 'slide_1',
      userMessage: 'Option B',
      listenerName: 'John',
      language: 'English'
    };

    mockRequest = {
      json: jest.fn().mockResolvedValue(payload)
    };

    mockSingle.mockResolvedValue({
      data: {
        id: 1,
        question_text: 'Which is best?',
        metadata: {
          isTest: true,
          testOptions: ['Option A', 'Option B', 'Option C'],
          correctOptionIndex: 1,
          reactionType: 'video',
          reactionData: 'http://video.com'
        }
      },
      error: null
    });

    // Mock the then/promise resolution of supabase .select().eq() for scenarios list in route.ts line 253
    mockEq.mockImplementation(() => {
      return {
        single: mockSingle,
        then: (resolve: any) => resolve({
          data: [
            {
              id: 1,
              question_text: 'Which is best?',
              expected_answer: 'Option B',
              expected_slide_id: 'slide_1',
              metadata: {
                isTest: true,
                testOptions: ['Option A', 'Option B', 'Option C'],
                correctOptionIndex: 1,
                reactionType: 'video',
                reactionData: 'http://video.com'
              }
            }
          ],
          error: null
        })
      };
    });

    // Act
    const response = await POST(mockRequest);
    const jsonResponse = await response.json();

    // Assert
    expect(jsonResponse.success).toBe(true);
    expect(jsonResponse.isCorrect).toBe(true); // Because userMessage is 'Option B' which matches correctOptionIndex: 1
    expect(jsonResponse.reactionType).toBe('video');
    expect(jsonResponse.reactionData).toBe('http://video.com');
  });
});
