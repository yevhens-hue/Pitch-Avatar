import { POST } from './route';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fallback response for LLM Only mode', async () => {
    const mockRequest = {
      headers: {
        get: (header: string) => {
          if (header === 'Authorization') return 'Bearer valid-token';
          return null;
        }
      },
      json: async () => ({
        message: 'Hello',
        settings: { answerMode: 'LLM Only', externalRAG: { enabled: false } }
      }),
    };

    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('Based on my general knowledge');
    expect(data.source).toBe('LLM Knowledge');
  });

  it('returns internal RAG response when external RAG disabled', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '1' } },
      error: null,
    });

    const mockRequest = {
      headers: {
        get: (header: string) => {
          if (header === 'Authorization') return 'Bearer valid-token';
          return null;
        }
      },
      json: async () => ({
        message: 'How do I upload?',
        settings: { answerMode: 'Hybrid', externalRAG: { enabled: false } }
      }),
    };

    const response = await POST(mockRequest as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe('Internal Documents');
  });

  it('returns 401 without auth', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Unauthorized' },
    });

    const mockRequest = {
      headers: {
        get: () => null, // No Authorization header
      },
      json: async () => ({ message: 'test', settings: {} }),
    };

    const response = await POST(mockRequest as any);
    expect(response.status).toBe(401);
  });

  it('returns 500 on error', async () => {
    (supabase.auth.getUser as jest.Mock).mockRejectedValue(new Error('DB error'));

    const mockRequest = {
      headers: {
        get: () => 'Bearer token'
      },
      json: async () => ({ message: 'test', settings: {} }),
    };

    const response = await POST(mockRequest as any);
    expect(response.status).toBe(500);
  });
});