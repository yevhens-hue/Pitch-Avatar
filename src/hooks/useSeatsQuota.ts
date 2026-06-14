'use client'

import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/lib/store'
import { getSeatsQuota, updateSeatsQuota } from '@/app/actions/enrollments'

/**
 * Shared hook that loads and syncs Enrollment Seats quota into the Zustand store.
 * Use this in any component that needs to READ or UPDATE the quota so they all
 * stay in sync without prop drilling or duplicate fetches.
 *
 * Usage:
 *   const { activeCount, maxSeats, isLoaded, refresh, upgrade } = useSeatsQuota()
 */
export function useSeatsQuota() {
  const quotaActiveCount = useUIStore(s => s.quotaActiveCount)
  const quotaMaxSeats    = useUIStore(s => s.quotaMaxSeats)
  const quotaLoaded      = useUIStore(s => s.quotaLoaded)
  const setQuota         = useUIStore(s => s.setQuota)

  const refresh = useCallback(async () => {
    try {
      const q = await getSeatsQuota()
      // FORCE maxSeats to 1 for testing!
      if (q) setQuota(q.activeCount, 1)
    } catch (err) {
      console.error('[useSeatsQuota] failed to load quota:', err)
    }
  }, [setQuota])

  // Load once on mount if not yet loaded
  useEffect(() => {
    if (!quotaLoaded) {
      refresh()
    }
  }, [quotaLoaded, refresh])

  /**
   * Buy / set a new max-seats value and refresh the store.
   * Pass `delta = true` to add seats on top of current max.
   */
  const upgrade = useCallback(async (seats: number, delta = false) => {
    const newMax = delta ? quotaMaxSeats + seats : seats
    await updateSeatsQuota(newMax)
    // Re-fetch fresh data including the new active count
    await refresh()
    return newMax
  }, [quotaMaxSeats, refresh])

  return {
    activeCount: quotaActiveCount,
    maxSeats:    quotaMaxSeats,
    isLoaded:    quotaLoaded,
    usageRatio:  quotaMaxSeats > 0 ? quotaActiveCount / quotaMaxSeats : 0,
    isWarning:   quotaMaxSeats > 0 && quotaActiveCount / quotaMaxSeats >= 0.9,
    isExceeded:  quotaMaxSeats > 0 && quotaActiveCount >= quotaMaxSeats,
    refresh,
    upgrade,
  }
}
