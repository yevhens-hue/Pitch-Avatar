'use client'

import React from 'react';
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
  if (isAdmin) {
    return <TrainModeUI projectId={projectId} />;
  }
  return <PracticePlayerUI projectId={projectId} />;
};

export default CoachPageRouter;
