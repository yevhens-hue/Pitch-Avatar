'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import JTBDWizard from './variants/JTBDWizard';
import MagicWizard from './variants/MagicWizard';
import ChatWizard from './variants/ChatWizard';
import SnovWizard from './variants/SnovWizard';
import VideoWizard from './variants/VideoWizard';
import Walkthrough from './variants/Walkthrough';
import styles from './OnboardingLabOverlay.module.css';

interface OnboardingLabOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingLabOverlay: React.FC<OnboardingLabOverlayProps> = ({ isOpen, onClose }) => {
  const [activeVariant, setActiveVariant] = useState<string | null>(null);

  if (!isOpen) return null;

  const variants = [
    { id: 'jtbd', title: 'JTBD (Role-based)', component: <JTBDWizard /> },
    { id: 'magic', title: 'Magic Start', component: <MagicWizard /> },
    { id: 'conversational', title: 'Conversational', component: <ChatWizard /> },
    { id: 'snov', title: 'Snov.io Style', component: <SnovWizard /> },
    { id: 'video', title: 'Interactive Video', component: <VideoWizard /> },
    { id: 'walkthrough', title: 'Guided Walkthrough', component: <Walkthrough /> },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {activeVariant 
              ? variants.find(v => v.id === activeVariant)?.title 
              : 'Onboarding Lab'}
          </h2>
          <button className={styles.closeBtn} onClick={() => {
            if (activeVariant) setActiveVariant(null);
            else onClose();
          }}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {!activeVariant ? (
            <div className={styles.grid}>
              {variants.map((v) => (
                <div key={v.id} className={styles.card} onClick={() => setActiveVariant(v.id)}>
                  <h3>{v.title}</h3>
                  <p>Click to preview variant</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.variantWrapper}>
              {variants.find(v => v.id === activeVariant)?.component}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLabOverlay;
