import React from 'react';
import ProbationPlayer from '@/components/Probation/ProbationPlayer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitch Avatar Probation Presentation',
  description: 'Interactive presentation for the end of probation period.',
};

export default function ProbationPage() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <ProbationPlayer />
    </main>
  );
}
