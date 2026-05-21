import '@testing-library/jest-dom';
import * as authGuard from '@/lib/auth-guard';
import * as supabaseModule from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';
import type { UserResponse } from '@supabase/supabase-js';
import type { User } from '@/types';

describe('auth-guard', () => {
  describe('requireAuth', () => {
    it('returns 401 when no authorization header', async () => {
      const mockRequest: Partial<Request> = {
        headers: { get: () => null } as unknown as Headers,
      };
      const result = await authGuard.requireAuth(mockRequest as unknown as Request);

      expect(result).toHaveProperty('status', 401);
      expect(result).toHaveProperty('json');
    });

    it('returns 401 when authorization header is not Bearer', async () => {
      const mockRequest: Partial<Request> = {
        headers: { get: () => 'Basic token' } as unknown as Headers,
      };
      const result = await authGuard.requireAuth(mockRequest as unknown as Request);

      expect(result).toHaveProperty('status', 401);
    });

    it('returns null for valid token', async () => {
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

      const mockRequest: Partial<Request> = {
        headers: { get: () => 'Bearer valid-token' } as unknown as Headers,
      };
      const result = await authGuard.requireAuth(mockRequest as unknown as Request);

      expect(result).toBeNull();
    });

    it('returns 401 for invalid token', async () => {
      const mockError = new AuthError('Invalid token');
      jest.spyOn(supabaseModule.supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const mockRequest: Partial<Request> = {
        headers: { get: () => 'Bearer invalid-token' } as unknown as Headers,
      };

      const result = await authGuard.requireAuth(mockRequest as unknown as Request);

      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('returns null when no authorization header', async () => {
      const mockRequest: Partial<Request> = {
        headers: { get: () => null } as unknown as Headers,
      };
      const user = await authGuard.getAuthenticatedUser(mockRequest as unknown as Request);

      expect(user).toBeNull();
    });

    it('returns null for non-Bearer authorization', async () => {
      const mockRequest: Partial<Request> = {
        headers: { get: () => 'Basic token' } as unknown as Headers,
      };
      const user = await authGuard.getAuthenticatedUser(mockRequest as unknown as Request);

      expect(user).toBeNull();
    });

    it('returns user for valid token', async () => {
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

      const mockRequest: Partial<Request> = {
        headers: { get: () => 'Bearer valid-token' } as unknown as Headers,
      };
      const user = await authGuard.getAuthenticatedUser(mockRequest as unknown as Request);

      expect(user).toEqual({ id: '1', email: 'test@example.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2024-01-01T00:00:00Z' });
    });
  });
});
