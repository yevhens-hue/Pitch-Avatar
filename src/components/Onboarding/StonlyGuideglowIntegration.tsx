'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useAuth } from '@/context/AuthContext'

// ─── Guideglow Tour IDs ───────────────────────────────────────────────────────
// Fill in gg_tour_XXX values once Marketing provides them from Guideglow dashboard
const TOUR_MAP: Record<string, string> = {
  tour_generate_video:      'gg_tour_XXX',
  tour_share_video:         'gg_tour_XXX',
  tour_share_chat:          'gg_tour_XXX',
  tour_embed_chat:          'gg_tour_XXX',
  tour_share_slides:        'gg_tour_XXX',
  tour_upload_slides:       'gg_tour_XXX',
  tour_export_localization: 'gg_tour_XXX',
}

// ─── Checklist Item → Tour Mapping ───────────────────────────────────────────
// KEY = exact textContent of the Stonly checklist item (case-sensitive)
// VALUE = { tourId: key in TOUR_MAP, screen: target route for navigation }
//
// Stonly does not support native data-* attributes on checklist items without
// Enterprise Custom Templates. This map is the single source of truth.
// To add a new tour: add one entry here + corresponding entry in TOUR_MAP above.
const CHECKLIST_TOUR_MAP: Record<string, { tourId: string; screen: string }> = {
  'Pick a Creation Method':    { tourId: 'tour_generate_video',      screen: '/create' },
  'Get sharing link':          { tourId: 'tour_share_video',         screen: '/links' },
  'Add text and voice':        { tourId: 'tour_share_chat',          screen: '/create/video' },
  'Build on your site':        { tourId: 'tour_embed_chat',          screen: '/links' },
  'Design your first scene':   { tourId: 'tour_share_slides',        screen: '/create/quick' },
  'Launch Your First Presentation': { tourId: 'tour_upload_slides',  screen: '/create' },
  'Export localization':       { tourId: 'tour_export_localization',  screen: '/editor' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCompletedItem(el: HTMLElement): boolean {
  return (
    el.classList.contains('completed') ||
    el.getAttribute('aria-checked') === 'true' ||
    !!el.querySelector('[aria-checked="true"]') ||
    el.textContent?.includes('☑') ||
    false
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function StonlyGuideglowIntegration() {
  const router = useRouter()
  const pathname = usePathname()
  const posthog = usePostHog()
  const { user } = useAuth()

  useEffect(() => {
    // ── Step 1: MutationObserver — auto-annotate Stonly checklist items ──────
    // Since Stonly does not allow custom HTML attributes on checklist items
    // without Enterprise plan, we observe the DOM and add data-tour-id /
    // data-screen attributes ourselves based on the item's text content.
    const annotateItems = () => {
      const candidates = document.querySelectorAll<HTMLElement>(
        // Target any element that *could* be a Stonly checklist item and hasn't been mapped yet
        '[class*="stonly"]:not([data-tour-mapped]), [id*="stonly"]:not([data-tour-mapped])'
      )
      candidates.forEach(el => {
        const label = el.textContent?.trim() ?? ''
        const match = CHECKLIST_TOUR_MAP[label]
        if (match) {
          el.setAttribute('data-tour-id', match.tourId)
          el.setAttribute('data-screen', match.screen)
          el.setAttribute('data-tour-mapped', 'true')
        }
      })

      // Also do a broader search for any element whose text matches
      Object.entries(CHECKLIST_TOUR_MAP).forEach(([label, config]) => {
        document.querySelectorAll<HTMLElement>(':not([data-tour-mapped])').forEach(el => {
          if (
            el.children.length === 0 && // leaf nodes only, to avoid parent containers
            el.textContent?.trim() === label
          ) {
            const container = el.closest('li, [role="listitem"], [class*="item"], [class*="task"]') as HTMLElement | null
            if (container && !container.getAttribute('data-tour-mapped')) {
              container.setAttribute('data-tour-id', config.tourId)
              container.setAttribute('data-screen', config.screen)
              container.setAttribute('data-tour-mapped', 'true')
            }
          }
        })
      })
    }

    const observer = new MutationObserver(annotateItems)
    observer.observe(document.body, { childList: true, subtree: true })
    annotateItems() // Run once immediately in case Stonly already rendered

    // ── Step 2: Global click handler ─────────────────────────────────────────
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const item = target.closest('[data-tour-id]') as HTMLElement | null
      if (!item) return
      if (isCompletedItem(item)) return

      e.preventDefault()

      const tourId = item.getAttribute('data-tour-id')
      const targetScreen = item.getAttribute('data-screen')
      if (!tourId) return

      // ── Step 3: Navigation ────────────────────────────────────────────────
      if (targetScreen && !pathname.includes(targetScreen)) {
        router.push(targetScreen)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      // ── Step 4: Launch Guideglow tour ─────────────────────────────────────
      const ggTourId = TOUR_MAP[tourId]
      if (ggTourId && typeof window !== 'undefined' && (window as any).Guideglow) {
        // Graceful fallback: if Guideglow is unavailable, we already navigated
        ;(window as any).Guideglow.startTour(ggTourId)
      }

      // ── Step 5: Analytics ─────────────────────────────────────────────────
      posthog.capture('guideglow_tour_started', {
        tour_id: tourId,
        user_id: user?.id,
        main_goal: user?.user_metadata?.main_goal,
      })
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      observer.disconnect()
    }
  }, [pathname, router, posthog, user])

  return null
}
