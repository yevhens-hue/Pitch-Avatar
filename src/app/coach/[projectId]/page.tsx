import React from 'react';
import { Suspense } from 'react';
import CoachPageRouter from '@/components/Coach/CoachPageRouter';

export default async function CoachUnifiedPage(props: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ admin?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { projectId } = params;
  const isAdmin = searchParams.admin === '1' || searchParams.admin === 'true';

  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading...</div>}>
      <CoachPageRouter projectId={projectId} isAdmin={isAdmin} />
    </Suspense>
  );
}

