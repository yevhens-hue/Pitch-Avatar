'use client'

import { createContext, useContext } from 'react'
import type { User, Subscription } from '@/types'

interface UserContextValue {
  user: User | null
  subscription: Subscription | null
  isLoading: boolean
}

export const UserContext = createContext<UserContextValue>({
  user: null,
  subscription: null,
  isLoading: true,
})

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
