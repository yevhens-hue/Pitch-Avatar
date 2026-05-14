'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function StonlyTourLauncher() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const tourId = searchParams.get('stonly_tour')
    let intervalId: number | null = null

    if (tourId) {
      console.log(`[Stonly] URL parameter detected. Launching tour: ${tourId}`)
      
      // Poll for StonlyWidget to be ready (up to 10 seconds)
      let attempts = 0
      intervalId = window.setInterval(() => {
        attempts++
        if (typeof window !== 'undefined' && (window as any).StonlyWidget) {
          if (intervalId !== null) {
            window.clearInterval(intervalId)
            intervalId = null
          }
          try {
            (window as any).StonlyWidget('openGuide', { guideId: tourId })
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
          // Give up after ~10 seconds
          if (intervalId !== null) {
            window.clearInterval(intervalId)
            intervalId = null
          }
          console.warn('[Stonly] Widget failed to initialize within timeout.')
        }
      }, 500)
    }

    // Cleanup function that runs when effect is re-run or component unmounts
    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [searchParams]) // Only depend on searchParams since we only care about the parameter

  return null
}

export default function StonlyOnboardingIntegration() {
  return (
    <>
      <StonlyTourLauncher />
    </>
  )
}
