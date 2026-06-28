import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table) => ({
      insert: jest.fn().mockResolvedValue({ error: null })
    }))
  }))
}));

describe('Coach Analytics API', () => {
  let mockRequest: any;

  beforeEach(() => {
    // Basic Request Mock
    mockRequest = (body: any) => ({
      json: jest.fn().mockResolvedValue(body)
    } as unknown as Request);
    
    // Clear environment vars for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if projectId is missing', async () => {
    const req = mockRequest({
      score: 100,
      feedback: 'Good job',
      isCorrect: true,
      question: 'What is your product?',
      expectedAnswer: 'An AI avatar',
      userAnswer: 'An avatar'
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('projectId is required');
  });

  it('should save analytics successfully and return 200', async () => {
    const req = mockRequest({
      projectId: 'proj-123',
      score: 80,
      feedback: 'Good answer, but could be more detailed.',
      isCorrect: true,
      question: 'What is your product?',
      expectedAnswer: 'An AI avatar for sales',
      userAnswer: 'An AI avatar'
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Analytics saved successfully');
  });

  it('should return 500 if supabase credentials are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const req = mockRequest({
      projectId: 'proj-123',
      score: 100
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Server misconfiguration');
  });
});
