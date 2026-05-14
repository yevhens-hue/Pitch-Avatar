'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * TOUR_MAP: Links Stonly Checklist Item IDs to Stonly Guide IDs.
 * Replace 'GUIDE_ID_HERE' with real IDs from the Stonly Dashboard.
 */
const TOUR_MAP: Record<string, { guideId: string; path?: string }> = {
  // B1, B3, B4: Create chat avatar
  'create-chat-avatar': { 
    guideId: 'mdPPvKKoUL', 
    path: '/chat-avatar/create' 
  },
  // Set up conversation scenario
  'setup-scenario': { 
    guideId: 'mdPPvKKoUL', 
    path: '/chat-avatar/create' 
  },
  // Test your avatar
  'test-avatar': { 
    guideId: 'mdPPvKKoUL', 
    path: '/chat-avatar/create' 
  },
  // Get link or embed
  'get-link': { 
    guideId: 'mdPPvKKoUL', 
    path: '/chat-avatar' 
  },
  // A1, A2: Create video presentation
  'create-video': { 
    guideId: 'mdPPvKKoUL', 
    path: '/create' 
  }
}

/**
 * StonlyOnboardingIntegration
 * 
 * Handles the hybrid logic between Stonly Checklists and Stonly Guides.
 * 1. Listens for clicks on Checklist items.
 * 2. Navigates to the correct page if needed.
 * 3. Triggers the specific Stonly Guide.
 */
export default function StonlyOnboardingIntegration() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // 1. Monitor DOM for Stonly Checklist items to attach listeners
    const observer = new MutationObserver(() => {
      annotateItems()
      attachListeners()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // 2. Initial run
    annotateItems()
    attachListeners()

    return () => observer.disconnect()
  }, [pathname])

  /**
   * Injects data-tour-id into Stonly elements if they don't have them natively.
   * This allows us to map Checklist items to our TOUR_MAP.
   */
  const annotateItems = () => {
    const items = document.querySelectorAll('.stonly-checklist-item')
    items.forEach(item => {
      const text = item.textContent?.toLowerCase() || ''
      if (text.includes('create chat-avatar') && !item.getAttribute('data-tour-id')) {
        item.setAttribute('data-tour-id', 'create-chat-avatar')
      } else if (text.includes('conversation scenario') && !item.getAttribute('data-tour-id')) {
        item.setAttribute('data-tour-id', 'setup-scenario')
      } else if (text.includes('test your avatar') && !item.getAttribute('data-tour-id')) {
        item.setAttribute('data-tour-id', 'test-avatar')
      } else if (text.includes('get link') && !item.getAttribute('data-tour-id')) {
        item.setAttribute('data-tour-id', 'get-link')
      } else if (text.includes('video presentation') && !item.getAttribute('data-tour-id')) {
        item.setAttribute('data-tour-id', 'create-video')
      }
    })
  }

  /**
   * Attaches click listeners to the annotated items.
   */
  const attachListeners = () => {
    const items = document.querySelectorAll('[data-tour-id]:not([data-listener-active])')
    items.forEach(item => {
      item.setAttribute('data-listener-active', 'true')
      item.addEventListener('click', () => {
        const tourId = item.getAttribute('data-tour-id')
        if (tourId && TOUR_MAP[tourId]) {
          launchStonlyGuide(tourId)
        }
      })
    })
  }

  /**
   * Navigates to the correct URL and triggers the Stonly Guide.
   */
  const launchStonlyGuide = async (id: string) => {
    const config = TOUR_MAP[id]
    if (!config) return

    console.log(`[Stonly] Launching guide ${config.guideId} for ${id}`)

    // 1. Navigate if path is different
    if (config.path && pathname !== config.path) {
      router.push(config.path)
      // Wait for navigation and page stabilization
      await new Promise(r => setTimeout(r, 1500))
    }

    // 2. Trigger Stonly Guide via Widget API
    if (typeof window !== 'undefined' && (window as any).StonlyWidget) {
      (window as any).StonlyWidget('openGuide', {
        guideId: config.guideId,
        fullScreen: false
      })
    } else {
      console.warn('[Stonly] Widget not found on window')
    }
  }

  return null
}
