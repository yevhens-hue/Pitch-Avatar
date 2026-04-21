'use client'

import React, { Suspense } from 'react'
import VideoWizard from '@/components/Wizard/VideoWizard'

export default function VideoPage() {
  return (
    <Suspense fallback={<div>Loading wizard...</div>}>
      <VideoWizard />
    </Suspense>
  )
}
