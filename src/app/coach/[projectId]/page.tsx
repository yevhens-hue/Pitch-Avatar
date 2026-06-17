import React from 'react';
import TrainModeUI from '@/components/Coach/TrainModeUI/TrainModeUI';

export default async function CoachUnifiedPage(props: { params: Promise<{ projectId: string }> }) {
  const params = await props.params;
  const { projectId } = params;

  return <TrainModeUI projectId={projectId} />;
}
