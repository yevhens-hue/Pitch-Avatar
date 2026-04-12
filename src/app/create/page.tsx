'use client'

import React, { Suspense } from 'react'
import Wizard from '@/components/Wizard/Wizard'

export default function CreatePresentationPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary, #0f1115)' }}>
      <Suspense fallback={<div style={{color: 'white', padding: '2rem'}}>Loading...</div>}>
        <Wizard />
      </Suspense>
    </main>
  )
}

