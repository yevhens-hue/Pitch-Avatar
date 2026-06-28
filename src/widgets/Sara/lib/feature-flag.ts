import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'

/**
 * Temporary wrapper for feature flags.
 * The tech design dictates a move from PostHog to AWS AppConfig.
 * This hook encapsulates the flag logic so it can be easily swapped to
 * an AppConfig/FeatureFlagService provider later.
 */
export const useFeatureFlag = (flagName: string): boolean => {
  const posthog = usePostHog()
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    // Defer PostHog call until component mounts to avoid
    // `setState-in-effect` lint errors.
    return !!(posthog?.isFeatureEnabled(flagName))
  })

  // Sync with PostHog when the flag value or client instance changes.
  useEffect(() => {
    if (posthog) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEnabled(!!posthog.isFeatureEnabled(flagName))
    }
  }, [posthog, flagName])

  return isEnabled
}
