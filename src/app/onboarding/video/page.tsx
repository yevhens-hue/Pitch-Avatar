'use client';

import React, { Suspense } from 'react';
import VideoWizard from '@/components/Wizard/variants/VideoWizard';

export default function VideoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <VideoWizard />
      </Suspense>
    </div>
  );
}
