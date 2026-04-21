'use client';

import React, { Suspense } from 'react';
import JTBDWizard from '@/components/Wizard/variants/JTBDWizard';
import styles from '../OnboardingMaster.module.css';

export default function JTBDOnboarding() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading wizard...</div>}>
        <JTBDWizard />
      </Suspense>
    </main>
  );
}
