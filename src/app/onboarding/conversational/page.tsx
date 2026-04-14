'use client';

import React, { Suspense } from 'react';
import ChatWizard from '@/components/Wizard/variants/ChatWizard';

export default function ChatPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatWizard />
      </Suspense>
    </div>
  );
}
