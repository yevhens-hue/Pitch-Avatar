import React from 'react';
import RoadmapPlayer from '@/components/Roadmap/RoadmapPlayer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pitch Avatar Roadmap Presentation',
  description: 'Interactive roadmap presentation for Months 2 and 3 of the Pitch Avatar project.',
};

export default function RoadmapPage() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <RoadmapPlayer />
    </main>
  );
}
