'use client';

import React, { Suspense } from 'react';
import ChatWizard from '@/components/Wizard/variants/ChatWizard';
import styles from '../OnboardingMaster.module.css';

export default function ConversationalOnboarding() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading wizard...</div>}>
        <ChatWizard />
      </Suspense>
    </main>
  );
}
