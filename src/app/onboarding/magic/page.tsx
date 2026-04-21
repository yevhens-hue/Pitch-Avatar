'use client';

import React, { Suspense } from 'react';
import MagicWizard from '@/components/Wizard/variants/MagicWizard';
import styles from '../OnboardingMaster.module.css';

export default function MagicOnboarding() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading wizard...</div>}>
        <MagicWizard />
      </Suspense>
    </main>
  );
}
