'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useAuth } from '@/context/AuthContext'

// ─── Guideglow Tour IDs ───────────────────────────────────────────────────────
// ID placeholders to be filled by Marketing after creation in Guideglow
const TOUR_MAP: Record<string, string> = {
  tour_generate_video:       'gg_tour_XXX',
  tour_share_video:          'gg_tour_XXX',
  tour_share_chat:           'gg_tour_XXX',
  tour_embed_chat:           'gg_tour_XXX',
  tour_share_slides:         'gg_tour_XXX',
  tour_upload_slides:        'gg_tour_XXX',
  tour_export_localization:  'gg_tour_XXX',
}

// ─── Checklist Item → Tour Mapping ───────────────────────────────────────────
const CHECKLIST_TOUR_MAP: Record<string, { tourId: string; screen: string }> = {
  'Pick a Creation Method':       { tourId: 'tour_generate_video',      screen: '/create' },
  'Generate Video':               { tourId: 'tour_generate_video',      screen: '/create' },
  'Share Presentation':           { tourId: 'tour_share_video',         screen: '/links' },
  'Set up AI Chat':               { tourId: 'tour_share_chat',          screen: '/create/video' },
  'Embed Chat Avatar':            { tourId: 'tour_embed_chat',          screen: '/links' },
  'Design First Scene':           { tourId: 'tour_share_slides',        screen: '/create/quick' },
  'Upload Slides':                { tourId: 'tour_upload_slides',       screen: '/create' },
  'Export Localization':          { tourId: 'tour_export_localization', screen: '/editor' },
}

export default function StonlyGuideglowIntegration() {
  const router = useRouter()
  const pathname = usePathname()
  const posthog = usePostHog()
  const { user } = useAuth()

  useEffect(() => {
    // ── Analytics helper ─────────────────────────────────────────────────────
    const captureTourEvent = (event: string, tourId: string) => {
      posthog.capture(event, {
        tour_id: tourId,
        user_id: user?.id,
        main_goal: user?.user_metadata?.main_goal,
      })
    }

    // ── Tour Launcher ────────────────────────────────────────────────────────
    const launchTour = async (tourId: string, targetScreen?: string) => {
      // 1. Navigation
      if (targetScreen && !pathname.includes(targetScreen)) {
        router.push(targetScreen)
        // Wait for page load and UI stabilization
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // 2. Trigger Guideglow
      const ggTourId = TOUR_MAP[tourId]
      const guideglow = (window as any).Guideglow

      if (ggTourId && guideglow) {
        guideglow.startTour(ggTourId)
        captureTourEvent('guideglow_tour_started', tourId)
      } else if (!guideglow) {
        console.warn('Guideglow not loaded, only navigation performed.')
      }
    }

    // ── DOM Annotation (Fallback if Stonly lacks data-tour-id) ────────────────
    const annotateItems = () => {
      Object.entries(CHECKLIST_TOUR_MAP).forEach(([label, config]) => {
        document.querySelectorAll<HTMLElement>(':not([data-tour-mapped])').forEach(el => {
          if (el.children.length === 0 && el.textContent?.trim() === label) {
            const container = el.closest('li, [role="listitem"], [class*="item"]') as HTMLElement | null
            if (container) {
              container.setAttribute('data-tour-id', config.tourId)
              container.setAttribute('data-screen', config.screen)
              container.setAttribute('data-tour-mapped', 'true')
            }
          }
        })
      })
    }

    // ── Click Handler ────────────────────────────────────────────────────────
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const item = target.closest('[data-tour-id]') as HTMLElement | null
      
      if (!item) return
      
      // Don't restart if already completed (checked)
      const isCompleted = 
        item.classList.contains('completed') || 
        item.getAttribute('aria-checked') === 'true' ||
        item.textContent?.includes('☑')

      if (isCompleted) return

      const tourId = item.getAttribute('data-tour-id')
      const screen = item.getAttribute('data-screen')
      
      if (tourId) {
        launchTour(tourId, screen ?? undefined)
      }
    }

    // ── Guideglow Listeners ──────────────────────────────────────────────────
    const handleTourCompleted = (e: any) => {
      if (e.detail?.tourId) captureTourEvent('guideglow_tour_completed', e.detail.tourId)
    }
    const handleTourDismissed = (e: any) => {
      if (e.detail?.tourId) captureTourEvent('guideglow_tour_dismissed', e.detail.tourId)
    }

    // ── Initialization ───────────────────────────────────────────────────────
    const stonly = (window as any).StonlyWidget
    if (stonly) {
      stonly('on', 'ready', () => {
        document.addEventListener('click', handleClick)
        window.addEventListener('guideglow:completed', handleTourCompleted)
        window.addEventListener('guideglow:dismissed', handleTourDismissed)
      })
    }

    const observer = new MutationObserver(annotateItems)
    observer.observe(document.body, { childList: true, subtree: true })
    annotateItems()

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('guideglow:completed', handleTourCompleted)
      window.removeEventListener('guideglow:dismissed', handleTourDismissed)
      observer.disconnect()
    }
  }, [pathname, router, posthog, user])

  return null
}
