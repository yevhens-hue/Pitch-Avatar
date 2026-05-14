'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

function StonlyTourLauncher() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const tourId = searchParams.get('stonly_tour')
    
    if (tourId) {
      console.log(`[Stonly] URL parameter detected. Launching tour: ${tourId}`)
      
      // Poll for StonlyWidget to be ready (up to 10 seconds)
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (typeof window !== 'undefined' && (window as any).StonlyWidget) {
          clearInterval(interval)
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
          clearInterval(interval)
          console.warn('[Stonly] Widget failed to initialize within timeout.')
        }
      }, 500)

      return () => clearInterval(interval)
    }
  }, [searchParams, pathname, router])

  return null
}

export default function StonlyOnboardingIntegration() {
  return (
    <Suspense fallback={null}>
      <StonlyTourLauncher />
    </Suspense>
  )
}
