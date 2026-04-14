'use client';

import React, { Suspense } from 'react';
import MagicWizard from '@/components/Wizard/variants/MagicWizard';

export default function MagicPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <MagicWizard />
      </Suspense>
    </div>
  );
}
