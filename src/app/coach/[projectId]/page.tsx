import React from 'react';
import { Suspense } from 'react';
import TrainModeUI from '@/components/Coach/TrainModeUI/TrainModeUI';

export default async function CoachUnifiedPage(props: {
  params: Promise<{ projectId: string }>;
}) {
  const params = await props.params;
  const { projectId } = params;

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading...</div>}>
      <TrainModeUI projectId={projectId} />
    </Suspense>
  );
}
