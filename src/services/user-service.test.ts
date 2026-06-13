import { fetchCurrentUser, fetchCurrentUserSync, updateUserProfile } from './user-service';

describe('user-service', () => {
  describe('fetchCurrentUser', () => {
    it('returns user and subscription when authenticated', async () => {
      const result = await fetchCurrentUser();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('subscription');
      // auth mock returns user.id 'test'; no profile so falls back to MOCK_USER name
      expect(result.user.name).toBe('Yevhen');
      expect(result.subscription.plan).toBe('trial');
    });
  });

  describe('fetchCurrentUserSync', () => {
    it('returns sync result', () => {
      const result = fetchCurrentUserSync();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('subscription');
    });
  });

  describe('updateUserProfile', () => {
    it('returns merged profile data', async () => {
      const result = await updateUserProfile({ name: 'New Name', company: 'NewCo' });
      // When auth exists, function returns data directly (not the merged MOCK_USER object)
      expect(result.name).toBe('New Name');
      expect(result.company).toBe('NewCo');
    });
  });
});