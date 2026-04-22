'use client'

import { Suspense } from 'react'
import ScratchWizard from '@/components/Wizard/ScratchWizard'

export default function ScratchPage() {
  return (
    <Suspense>
      <ScratchWizard />
    </Suspense>
  )
}
