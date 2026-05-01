import { getAuthenticatedUser } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('getAuthenticatedUser', () => {
  it('returns user when valid token provided', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
    });

    const mockRequest = {
      headers: {
        get: (header: string) => {
          if (header === 'Authorization') return 'Bearer valid-token';
          return null;
        }
      }
    };

    const user = await getAuthenticatedUser(mockRequest as any);
    expect(user).toEqual({ id: '1', email: 'test@example.com' });
  });

  it('returns null when no authorization header', async () => {
    const mockRequest = {
      headers: { get: () => null }
    };
    const user = await getAuthenticatedUser(mockRequest as any);
    expect(user).toBeNull();
  });

  it('returns null for non-Bearer authorization', async () => {
    const mockRequest = {
      headers: { get: () => 'Basic token' }
    };
    const user = await getAuthenticatedUser(mockRequest as any);
    expect(user).toBeNull();
  });
});