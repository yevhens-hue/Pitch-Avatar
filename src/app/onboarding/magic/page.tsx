'use client';

import React, { Suspense } from 'react';
import MagicWizard from '@/components/Wizard/variants/MagicWizard';

export default function MagicPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <MagicWizard />
      </Suspense>
    </div>
  );
}
