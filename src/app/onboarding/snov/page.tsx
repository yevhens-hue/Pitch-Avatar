'use client';

import React, { Suspense } from 'react';
import SnovWizard from '@/components/Wizard/variants/SnovWizard';
import styles from '../OnboardingMaster.module.css';

export default function SnovOnboarding() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading wizard...</div>}>
        <SnovWizard />
      </Suspense>
    </main>
  );
}
