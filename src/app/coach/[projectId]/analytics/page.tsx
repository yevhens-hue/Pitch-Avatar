import React from 'react';
import CoachAnalyticsDashboard from '@/components/Coach/CoachAnalytics/CoachAnalyticsDashboard';

export default async function CoachAnalyticsPage(props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  const { projectId } = params;

  return (
    <main style={{ height: '100vh', width: '100vw', overflow: 'auto', backgroundColor: '#0f172a' }}>
      <CoachAnalyticsDashboard projectId={projectId} />
    </main>
  );
}
