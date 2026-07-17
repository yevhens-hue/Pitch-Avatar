'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import PracticePlayerUI from '@/components/Coach/PracticePlayerUI/PracticePlayerUI';
import TrainModeUI from '@/components/Coach/TrainModeUI/TrainModeUI';

interface CoachPageRouterProps {
  projectId: string;
  isAdmin: boolean;
}

/**
 * Маршрутизатор Coach-страницы:
 * - Без ?admin=1 → PracticePlayerUI (испытуемый / trainee)
 * - С ?admin=1 → TrainModeUI (тренер / admin)
 */
const CoachPageRouter: React.FC<CoachPageRouterProps> = ({ projectId, isAdmin }) => {
  const router = useRouter();
  if (isAdmin) {
    return <TrainModeUI projectId={projectId} initialMode="train" onExit={() => router.push(`/editor?projectId=${projectId}`)} />;
  }
  return <TrainModeUI projectId={projectId} initialMode="practice" onExit={() => router.push(`/projects/${projectId}`)} />;
};

export default CoachPageRouter;
