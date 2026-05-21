'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function StonlyTourLauncher() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const tourId = searchParams.get('stonly_tour')
    if (!tourId) return

    let intervalId: number | null = null
    let attempts = 0

    intervalId = window.setInterval(() => {
      attempts++
      // StonlyWidget is injected at runtime by <script>; eslint-disable-next-line to suppress `any` cast on window
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w: any = window
      if (typeof w.StonlyWidget === 'function') {
        if (intervalId !== null) {
          window.clearInterval(intervalId)
          intervalId = null
        }
        try {
          w.StonlyWidget('openGuide', { guideId: tourId })
        } catch (e) {
          console.error('[Stonly] Error launching guide:', e)
        }

        // Clean up URL after successful launch
        try {
          const url = new URL(window.location.href)
          url.searchParams.delete('stonly_tour')
          window.history.replaceState({}, '', url.toString())
        } catch (e) {
          console.error('[Stonly] Error cleaning URL:', e)
        }
      } else if (attempts >= 20) {
        if (intervalId !== null) {
          window.clearInterval(intervalId)
          intervalId = null
        }
        console.warn('[Stonly] Widget failed to initialize within timeout.')
      }
    }, 500)

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [searchParams])

  return null
}

export default function StonlyOnboardingIntegration() {
  return (
    <>
      <StonlyTourLauncher />
    </>
  )
}
