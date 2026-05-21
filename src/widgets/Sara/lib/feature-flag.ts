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
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Current fallback to PostHog until AWS AppConfig is fully integrated on the client
    if (posthog) {
      const enabled = posthog.isFeatureEnabled(flagName)
      setIsEnabled(!!enabled)
    }
  }, [posthog, flagName])

  return isEnabled
}
