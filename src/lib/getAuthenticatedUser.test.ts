import '@testing-library/jest-dom';
import { getAuthenticatedUser } from '@/lib/auth-guard';
import * as supabaseModule from '@/lib/supabase';
import type { UserResponse } from '@supabase/supabase-js';

jest.mock('@/lib/supabase');

describe('getAuthenticatedUser', () => {
  it('returns user when valid token provided', async () => {
    const mockUserData: UserResponse = {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00Z',
        },
      },
      error: null,
    };
    jest.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValue(mockUserData);

    const mockRequest = new Request('http://localhost', {
      headers: { Authorization: 'Bearer valid-token' },
    });

    const user = await getAuthenticatedUser(mockRequest);
    expect(user).toEqual({
      id: '1',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    });
  });

  it('returns null when no authorization header', async () => {
    const mockRequest = new Request('http://localhost');
    const user = await getAuthenticatedUser(mockRequest);
    expect(user).toBeNull();
  });

  it('returns null for non-Bearer authorization', async () => {
    const mockRequest = new Request('http://localhost', {
      headers: { Authorization: 'Basic token' },
    });
    const user = await getAuthenticatedUser(mockRequest);
    expect(user).toBeNull();
  });
});
