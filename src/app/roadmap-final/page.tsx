import React from 'react';
import type { Metadata } from 'next';
import ProbationPlayer from '@/components/Roadmap/ProbationPlayer';

export const metadata: Metadata = {
  title: 'Итоги испытательного срока · Pitch Avatar',
  description:
    'Интерактивная презентация по итогам всего испытательного срока: выполненные задачи, статусы и планы.',
};

export default function RoadmapFinalPage() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <ProbationPlayer />
    </main>
  );
}
