'use client'

import React, { Suspense } from 'react'
import QuickWizard from '@/components/Wizard/QuickWizard'

export default function QuickPresentationPage() {
  return (
    <Suspense fallback={<div>Loading wizard...</div>}>
      <QuickWizard />
    </Suspense>
  )
}
