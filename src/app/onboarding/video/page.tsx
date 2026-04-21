'use client';

import React, { Suspense } from 'react';
import VideoWizard from '@/components/Wizard/variants/VideoWizard';
import styles from '../OnboardingMaster.module.css';

export default function VideoVariantOnboarding() {
  return (
    <main className={styles.container}>
      <Suspense fallback={<div>Loading wizard...</div>}>
        <VideoWizard />
      </Suspense>
    </main>
  );
}
