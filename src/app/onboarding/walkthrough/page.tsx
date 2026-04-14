'use client';

import React, { Suspense } from 'react';
import Walkthrough from '@/components/Wizard/variants/Walkthrough';

export default function WalkthroughPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Walkthrough />
      </Suspense>
    </div>
  );
}
