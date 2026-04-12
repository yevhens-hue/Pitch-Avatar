import { fetchCurrentUser, fetchCurrentUserSync, updateUserProfile } from './user-service'

describe('user-service', () => {
  describe('fetchCurrentUserSync', () => {
    it('returns user and subscription', () => {
      const result = fetchCurrentUserSync()

      expect(result.user).toBeDefined()
      expect(result.subscription).toBeDefined()
    })

    it('returns user with expected fields', () => {
      const result = fetchCurrentUserSync()

      expect(result.user.id).toBe('1')
      expect(result.user.name).toBe('Yevhen')
      expect(result.user.email).toBe('1cpafarm@gmail.com')
      expect(result.user.avatarInitial).toBe('Y')
    })

    it('returns subscription with expected fields', () => {
      const result = fetchCurrentUserSync()

      expect(result.subscription.plan).toBe('trial')
      expect(result.subscription.trialDaysLeft).toBe(7)
      expect(result.subscription.aiMinutesTotal).toBe(50)
      expect(result.subscription.aiMinutesUsed).toBe(45)
    })
  })

  describe('fetchCurrentUser', () => {
    it('returns the same data as sync version', async () => {
      const syncResult = fetchCurrentUserSync()
      const asyncResult = await fetchCurrentUser()

      expect(asyncResult).toEqual(syncResult)
    })
  })

  describe('updateUserProfile', () => {
    it('merges partial data with existing user', async () => {
      const result = await updateUserProfile({ name: 'New Name' })

      expect(result.name).toBe('New Name')
      expect(result.email).toBe('1cpafarm@gmail.com')
    })

    it('can update company', async () => {
      const result = await updateUserProfile({ company: 'New Company' })

      expect(result.company).toBe('New Company')
    })

    it('preserves unchanged fields', async () => {
      const result = await updateUserProfile({ phone: '+1234567890' })

      expect(result.id).toBe('1')
      expect(result.name).toBe('Yevhen')
      expect(result.phone).toBe('+1234567890')
    })
  })
})
