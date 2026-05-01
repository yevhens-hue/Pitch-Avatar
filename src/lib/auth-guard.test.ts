import * as authGuard from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('auth-guard', () => {
  describe('requireAuth', () => {
    it('returns 401 when no authorization header', async () => {
      const mockRequest = {
        headers: { get: () => null },
        json: async () => ({}),
      };
      const result = await authGuard.requireAuth(mockRequest as any);
      
      expect(result).toHaveProperty('status', 401);
      expect(result).toHaveProperty('json');
    });

    it('returns 401 when authorization header is not Bearer', async () => {
      const mockRequest = {
        headers: { get: () => 'Basic token' },
        json: async () => ({}),
      };
      const result = await authGuard.requireAuth(mockRequest as any);
      
      expect(result).toHaveProperty('status', 401);
    });

    it('returns null for valid token', async () => {
      const { supabase } = require('@/lib/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: '1' } },
        error: null,
      });

      const mockRequest = {
        headers: { get: () => 'Bearer valid-token' },
        json: async () => ({}),
      };
      const result = await authGuard.requireAuth(mockRequest as any);
      
      expect(result).toBeNull();
    });

    it('returns 401 for invalid token', async () => {
      const { supabase } = require('@/lib/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const mockRequest = {
        headers: { get: () => 'Bearer invalid-token' },
        json: async () => ({}),
      };

      const result = await authGuard.requireAuth(mockRequest as any);
      
      expect(result).toHaveProperty('status', 401);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('returns null when no authorization header', async () => {
      const mockRequest = {
        headers: { get: () => null }
      };
      const user = await authGuard.getAuthenticatedUser(mockRequest as any);
      
      expect(user).toBeNull();
    });

    it('returns null for non-Bearer authorization', async () => {
      const mockRequest = {
        headers: { get: () => 'Basic token' }
      };
      const user = await authGuard.getAuthenticatedUser(mockRequest as any);
      
      expect(user).toBeNull();
    });

    it('returns user for valid token', async () => {
      const { supabase } = require('@/lib/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
      });

      const mockRequest = {
        headers: { get: () => 'Bearer valid-token' }
      };
      const user = await authGuard.getAuthenticatedUser(mockRequest as any);
      
      expect(user).toEqual({ id: '1', email: 'test@example.com' });
    });
  });
});
