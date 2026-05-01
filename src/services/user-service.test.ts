import { fetchCurrentUser, fetchCurrentUserSync, updateUserProfile } from './user-service';

describe('user-service', () => {
  describe('fetchCurrentUser', () => {
    it('returns mock user and subscription', async () => {
      const result = await fetchCurrentUser();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('subscription');
      expect(result.user.id).toBe('1');
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
    it('merges partial data', async () => {
      const result = await updateUserProfile({ name: 'New Name', company: 'NewCo' });
      expect(result.name).toBe('New Name');
      expect(result.company).toBe('NewCo');
      // unchanged fields remain from MOCK_USER
      expect(result.id).toBe('1');
      expect(result.email).toBe('1cpafarm@gmail.com');
    });
  });
});