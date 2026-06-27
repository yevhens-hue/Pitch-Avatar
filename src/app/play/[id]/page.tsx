"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import PracticePlayerUI from '@/components/Coach/PracticePlayerUI/PracticePlayerUI';

export default function PlayPracticePage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) return null;
  
  return <PracticePlayerUI projectId={id} />;
}
