export type SubscriptionPlan = 'trial' | 'starter' | 'pro' | 'enterprise'

export interface User {
  id: string
  name: string
  email: string
  avatarInitial: string
  phone?: string
  company?: string
  country?: string
  role?: string
  photoUrl?: string
  /** Collected at registration — drives the personalized welcome guide branch */
  main_goal?: string | null
}

export interface Subscription {
  plan: SubscriptionPlan
  trialDaysLeft: number
  aiMinutesTotal: number
  aiMinutesUsed: number
}

export interface UserWithSubscription {
  user: User
  subscription: Subscription
}
