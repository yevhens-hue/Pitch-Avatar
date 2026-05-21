'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useFeatureFlag } from '../lib/feature-flag'

// Lazy load the widget to prevent it from blocking LCP and TBT
const SaraWidget = dynamic(() => import('./SaraWidget'), { ssr: false })

export default function SaraWidgetContainer() {
  const isEnabled = useFeatureFlag('chat-avatar-support')

  // Only render the widget if the feature flag is enabled
  // FORCED TRUE FOR LAB DEPLOYMENT TESTING
  if (false) return null

  return <SaraWidget />
}
