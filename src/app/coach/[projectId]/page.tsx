'use client';

import React from 'react';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import TrainModeUI from '@/components/Coach/TrainModeUI/TrainModeUI';

function CoachPageInner({ projectId }: { projectId: string }) {
  const router = useRouter();
  return (
    <TrainModeUI
      projectId={projectId}
      onExit={() => router.push(`/editor?projectId=${projectId}`)}
    />
  );
}

export default function CoachUnifiedPage(props: {
  params: { projectId: string };
}) {
  const { projectId } = props.params;

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading...</div>}>
      <CoachPageInner projectId={projectId} />
    </Suspense>
  );
}
