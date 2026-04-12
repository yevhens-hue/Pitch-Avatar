import type { User, Subscription } from '@/types'

const MOCK_USER: User = {
  id: '1',
  name: 'Yevhen',
  email: '1cpafarm@gmail.com',
  avatarInitial: 'Y',
  company: 'pseudo_Yevhen_Sh_52718',
}

const MOCK_SUBSCRIPTION: Subscription = {
  plan: 'trial',
  trialDaysLeft: 7,
  aiMinutesTotal: 50,
  aiMinutesUsed: 45,
}

export async function fetchCurrentUser() {
  // TODO: replace with real API call
  return { user: MOCK_USER, subscription: MOCK_SUBSCRIPTION }
}

export function fetchCurrentUserSync() {
  return { user: MOCK_USER, subscription: MOCK_SUBSCRIPTION }
}

export async function updateUserProfile(
  data: Partial<Pick<User, 'name' | 'phone' | 'company' | 'country' | 'role'>>,
) {
  // TODO: replace with real API call
  return { ...MOCK_USER, ...data }
}
