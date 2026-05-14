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
      
      // Give the page a short moment to stabilize rendering
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).StonlyWidget) {
          try {
            (window as any).StonlyWidget('openGuide', tourId)
          } catch (e) {
            console.error('[Stonly] Error launching guide:', e)
          }
        }
        
        // Clean up the URL so a page refresh doesn't re-trigger the tour
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('stonly_tour')
        const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : '')
        router.replace(newUrl, { scroll: false })
      }, 1000)

      return () => clearTimeout(timer)
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
