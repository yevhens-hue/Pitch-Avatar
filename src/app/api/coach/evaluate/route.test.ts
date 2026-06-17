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
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

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

    const mockSingle = jest.fn().mockResolvedValue({
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

    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: mockSingle
    }));

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
