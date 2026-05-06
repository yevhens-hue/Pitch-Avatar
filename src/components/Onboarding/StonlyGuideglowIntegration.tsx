'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useAuth } from '@/context/AuthContext'

// ─── Guideglow Tour IDs ───────────────────────────────────────────────────────
// ID placeholders to be filled by Marketing after creation in Guideglow
const TOUR_MAP: Record<string, string> = {
  // Video
  tour_create_avatar:        'gg_tour_XXX',
  tour_generate_script:      'gg_tour_XXX',
  tour_choose_voice:         'gg_tour_XXX',
  tour_generate_video:       'gg_tour_XXX',
  tour_share_video:          'gg_tour_XXX',
  // Chat
  tour_create_chat_avatar:   'gg_tour_XXX',
  tour_setup_scenario:       'gg_tour_XXX',
  tour_test_avatar:          'gg_tour_XXX',
  tour_get_embed:            'gg_tour_XXX',
  tour_share_first:          'gg_tour_XXX',
  // Slides
  tour_upload_presentation:  'gg_tour_XXX',
  tour_choose_slide_avatar:  'gg_tour_XXX',
  tour_choose_slide_voice:   'gg_tour_XXX',
  tour_generate_presentation:'gg_tour_XXX',
  tour_share_presentation:   'gg_tour_XXX',
  // Localization
  tour_upload_video:         'gg_tour_XXX',
  tour_choose_language:      'gg_tour_XXX',
  tour_start_localization:   'gg_tour_XXX',
  tour_check_localization:   'gg_tour_XXX',
  tour_export_localization:  'gg_tour_XXX',
}

// ─── Checklist Item → Tour Mapping ───────────────────────────────────────────
const CHECKLIST_TOUR_MAP: Record<string, { tourId: string; screen: string }> = {
  // Checklist 1 — Video
  'Create your avatar':       { tourId: 'tour_create_avatar',      screen: '/editor' },
  'Write or generate script': { tourId: 'tour_generate_script',    screen: '/create/video' },
  'Choose a voice':           { tourId: 'tour_choose_voice',       screen: '/voices' },
  'Generate video':           { tourId: 'tour_generate_video',     screen: '/create/video' },
  'Share video':              { tourId: 'tour_share_video',        screen: '/links' },

  // Checklist 2 — Chat-avatar
  'Create chat-avatar (Choose look and voice)':                       { tourId: 'tour_create_chat_avatar', screen: '/chat-avatar/create' },
  'Set up conversation scenario (Define what avatar knows and how it answers)': { tourId: 'tour_setup_scenario',     screen: '/chat-avatar/create' },
  'Test your avatar (Conduct a test dialogue)':                       { tourId: 'tour_test_avatar',        screen: '/chat-avatar' },
  'Get link or embed code (Copy for website or email)':               { tourId: 'tour_get_embed',          screen: '/links' },
  'Share with first user (Send link to launch the first session)':    { tourId: 'tour_share_first',        screen: '/links' },

  // Checklist 3 — Slides
  'Upload presentation':               { tourId: 'tour_upload_presentation',   screen: '/create' },
  'Choose an avatar':                  { tourId: 'tour_choose_slide_avatar',   screen: '/editor' },
  'Choose a voice (slides)':           { tourId: 'tour_choose_slide_voice',    screen: '/voices' },
  'Generate presentation with avatar': { tourId: 'tour_generate_presentation', screen: '/create/quick' },
  'Share or download':                 { tourId: 'tour_share_presentation',    screen: '/links' },

  // Checklist 4 — Localization
  'Upload video':           { tourId: 'tour_upload_video',        screen: '/video' },
  'Choose target language': { tourId: 'tour_choose_language',     screen: '/video' },
  'Start localization':     { tourId: 'tour_start_localization',  screen: '/video' },
  'Check the result':       { tourId: 'tour_check_localization',  screen: '/video' },
  'Download or share':      { tourId: 'tour_export_localization', screen: '/video' },

  // Checklist 5 — Fallback
  'Create first avatar video':  { tourId: 'tour_generate_video',      screen: '/create/video' },
  'Translate any video':        { tourId: 'tour_start_localization',  screen: '/video' },
  'Add avatar to presentation': { tourId: 'tour_upload_presentation', screen: '/create' },
  'Share result':               { tourId: 'tour_share_video',         screen: '/links' },
  'Try chat avatar':            { tourId: 'tour_create_chat_avatar',  screen: '/chat-avatar/create' },
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
    const findStepLabelByTourId = (tourId: string): string | null => {
      // Find the entry in CHECKLIST_TOUR_MAP where the tourId matches 
      // OR where the TOUR_MAP resolved ID matches
      const entry = Object.entries(CHECKLIST_TOUR_MAP).find(([_, config]) => {
        const internalKey = config.tourId
        const actualGgId = TOUR_MAP[internalKey]
        return internalKey === tourId || actualGgId === tourId
      })
      return entry ? entry[0] : null
    }

    const completeStonlyStep = (tourId: string) => {
      const label = findStepLabelByTourId(tourId)
      const stonly = (window as any).StonlyWidget
      if (label && stonly) {
        stonly('setStepCompleted', { stepName: label })
      }
    }

    const handleTourCompleted = (e: any) => {
      const tourId = e.detail?.tourId
      if (tourId) {
        captureTourEvent('guideglow_tour_completed', tourId)
        completeStonlyStep(tourId)
      }
    }

    const handleTourDismissed = (e: any) => {
      const tourId = e.detail?.tourId
      if (tourId) {
        captureTourEvent('guideglow_tour_dismissed', tourId)
        // Optionally mark as completed even if dismissed to move user along
        completeStonlyStep(tourId)
      }
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
