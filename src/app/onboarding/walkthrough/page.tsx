'use client';

import React, { Suspense } from 'react';
import Walkthrough from '@/components/Wizard/variants/Walkthrough';
import styles from '../OnboardingMaster.module.css';

export default function WalkthroughOnboarding() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading wizard...</div>}>
        <Walkthrough />
      </Suspense>
    </main>
  );
}
