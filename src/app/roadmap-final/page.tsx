import React from 'react';
import type { Metadata } from 'next';
import ProbationPlayer from '@/components/Roadmap/ProbationPlayer';

export const metadata: Metadata = {
  title: 'Probation Period Summary · Pitch Avatar',
  description:
    'Interactive presentation summarizing the entire probation period: completed tasks, statuses, and plans.',
};

export default function RoadmapFinalPage() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <ProbationPlayer />
    </main>
  );
}
