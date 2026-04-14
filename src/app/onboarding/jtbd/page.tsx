'use client';

import React, { Suspense } from 'react';
import JTBDWizard from '@/components/Wizard/variants/JTBDWizard';

export default function JTBDPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <JTBDWizard />
      </Suspense>
    </div>
  );
}
