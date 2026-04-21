'use client'

import React, { Suspense } from 'react'
import Wizard from '@/components/Wizard/Wizard'

export default function CreatePresentationPage() {
  const router = React.useMemo(() => typeof window !== 'undefined' ? window.location : null, []);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary, #0f1115)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{color: 'white', textAlign: 'center'}}>
        <h2>Redirecting to Dashboard...</h2>
        <p>The new onboarding is now managed via Stonly.</p>
      </div>
    </main>
  )
}

