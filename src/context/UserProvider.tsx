'use client'

import { useState, useEffect } from 'react'
import { UserContext } from './UserContext'
import { fetchCurrentUser, fetchCurrentUserSync } from '@/services/user-service'
import type { User, Subscription } from '@/types'

export function UserProvider({ children }: { children: React.ReactNode }) {
  const sync = fetchCurrentUserSync()
  const [user, setUser] = useState<User | null>(sync.user)
  const [subscription, setSubscription] = useState<Subscription | null>(sync.subscription)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser().then(({ user: u, subscription: s }) => {
      if (!cancelled) {
        setUser(u)
        setSubscription(s)
        setIsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return (
    <UserContext.Provider value={{ user, subscription, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}
