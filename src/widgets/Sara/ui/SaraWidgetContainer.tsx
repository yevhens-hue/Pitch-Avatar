'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useFeatureFlag } from '../lib/feature-flag'
import { useSaraStore, WidgetConfig } from '../store/useSaraStore'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSaraIdleDetector } from '../hooks/useSaraIdleDetector'
import { useSaraEventDetector } from '../hooks/useSaraEventDetector'
import { captureSaraEvent } from '../analytics/posthog'

// Lazy load the widget to prevent it from blocking LCP and TBT
const SaraWidget = dynamic(() => import('./SaraWidget'), { ssr: false })

export interface SaraWidgetContainerProps {
  config?: Partial<WidgetConfig>
}

export default function SaraWidgetContainer({ config }: SaraWidgetContainerProps) {
  const isEnabled = useFeatureFlag('chat-avatar-support')
  const setConfig = useSaraStore((state) => state.setConfig)
  
  // ==========================================
  // HOST APP LEVEL DETECTORS (Decoupled from Widget)
  // ==========================================
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const mainGoal = user?.user_metadata?.main_goal ?? null

  useSaraIdleDetector(pathname, mainGoal)
  useSaraEventDetector(pathname, mainGoal)

  // 1. Host App listens to OUTBOUND events from Widget
  useEffect(() => {
    const handleSaraAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, payload } = customEvent.detail;
      
      console.log('[Host App] Received Webhook from Widget:', type, payload);
      
      if (type === 'navigate') {
        router.push(payload.route);
      } else if (type === 'start_tour') {
        // Here the Host App actually triggers Stonly or internal UI
        console.log('[Host App] Starting tour:', payload.tourId);
        if (typeof window !== 'undefined' && (window as any).StonlyWidget) {
           (window as any).StonlyWidget('openGuide', { guideId: payload.tourId });
        } else {
           alert('Host App would start tour: ' + payload.tourId);
        }
      }
    };

    window.addEventListener('sara:action', handleSaraAction);
    return () => window.removeEventListener('sara:action', handleSaraAction);
  }, [router]);

  // 2. Host App exposes INBOUND API for triggers
  useEffect(() => {
    (window as any).SaraWidget = {
      pushEvent: (eventName: string, payload?: any) => {
        console.log('[Host App -> Widget INBOUND API] Received:', eventName, payload);
        
        // Mocking the Go-trigger-service logic
        if (eventName === 'idle') {
          useSaraStore.getState().setProactiveTrigger({
            id: 'idle_help',
            content: {
              message: 'It seems you have been idle. Do you need help?',
              ctaLabel: 'Get Help',
              action: { type: 'open_chat' }
            },
            cooldownHours: 1,
            triggerType: 'idle',
            routePattern: '.*'
          });
        } else if (eventName === 'project.created') {
          useSaraStore.getState().setProactiveTrigger({
            id: 'project_created',
            content: {
              message: 'Congratulations on creating your first project! Want to learn more?',
              ctaLabel: 'Show me',
              action: { type: 'open_chat' }
            },
            cooldownHours: 24,
            triggerType: 'success',
            routePattern: '.*'
          });
        }
      }
    };
  }, []);

  useEffect(() => {
    captureSaraEvent('chat_avatar_rendered', { screen: pathname, main_goal: mainGoal })
  }, [pathname, mainGoal])

  useEffect(() => {
    if (config) {
      setConfig(config)
    }
  }, [config, setConfig])

  // Only render the widget if the feature flag is enabled
  // FORCED TRUE FOR LAB DEPLOYMENT TESTING
  if (false) return null

  return <SaraWidget />
}
