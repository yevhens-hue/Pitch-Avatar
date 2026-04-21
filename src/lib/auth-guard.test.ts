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
      const request = new Request('http://localhost', { method: 'POST' });
      const result = await authGuard.requireAuth(request);
      
      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(401);
    });

    it('returns 401 when authorization header is not Bearer', async () => {
      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Basic token' },
      });
      const result = await authGuard.requireAuth(request);
      
      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(401);
    });

    it('returns null for valid token', async () => {
      const { supabase } = require('@/lib/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: '1' } },
        error: null,
      });

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-token' },
      });
      const result = await authGuard.requireAuth(request);
      
      expect(result).toBeNull();
    });

    it('returns 401 for invalid token', async () => {
      const { supabase } = require('@/lib/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const request = new Request('http://localhost', {
        method: 'POST',
        headers: { Authorization: 'Bearer invalid-token' },
      });
      const result = await authGuard.requireAuth(request);
      
      expect(result).toBeInstanceOf(NextResponse);
      expect(result?.status).toBe(401);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('returns null when no authorization header', async () => {
      const request = new Request('http://localhost');
      const user = await authGuard.getAuthenticatedUser(request);
      
      expect(user).toBeNull();
    });

    it('returns null for non-Bearer authorization', async () => {
      const request = new Request('http://localhost', {
        headers: { Authorization: 'Basic token' },
      });
      const user = await authGuard.getAuthenticatedUser(request);
      
      expect(user).toBeNull();
    });

    it('returns user for valid token', async () => {
      const { supabase } = require('@/lib/supabase');
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
      });

      const request = new Request('http://localhost', {
        headers: { Authorization: 'Bearer valid-token' },
      });
      const user = await authGuard.getAuthenticatedUser(request);
      
      expect(user).toEqual({ id: '1', email: 'test@example.com' });
    });
  });
});