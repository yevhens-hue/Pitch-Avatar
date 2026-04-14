'use client';

import React, { Suspense } from 'react';
import SnovWizard from '@/components/Wizard/variants/SnovWizard';

export default function SnovPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <SnovWizard />
      </Suspense>
    </div>
  );
}
