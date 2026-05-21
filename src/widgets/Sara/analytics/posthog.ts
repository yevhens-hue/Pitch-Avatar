import posthog from 'posthog-js'

export const captureSaraEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return

  // Ensure main_goal and current_url are always sent as per DoD
  const defaultProperties = {
    current_url: window.location.href,
    pathname: window.location.pathname,
  }

  posthog.capture(eventName, { ...defaultProperties, ...properties })
}
