'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { X, ArrowRight, MousePointer2 } from 'lucide-react';
import styles from './ContextualTour.module.css';

const TOUR_STEPS = [
  {
    id: 0,
    title: 'Choose your weapon',
    desc: 'Select "Quick Presentation" to start with AI. It\'s the fastest way to get your first result.',
    target: '[data-tour="quick-start"]', // We'll add this to the dashboard
    position: 'bottom'
  },
  {
    id: 1,
    title: 'Feed the AI',
    desc: 'Drag your PDF or PPTX here. The AI will read every slide to build your script.',
    target: '[data-tour="upload-zone"]',
    position: 'right'
  },
  {
    id: 2,
    title: 'Pick a Persona',
    desc: 'Choose an AI Avatar that matches your brand tone. You can preview voices here too.',
    target: '[data-tour="avatar-select"]',
    position: 'left'
  },
  {
    id: 3,
    title: 'Final Polish',
    desc: 'Review your slides and click "Generate" to create the final video.',
    target: '[data-tour="generate-btn"]',
    position: 'top'
  },
  {
    id: 4,
    title: 'Broadcast your Avatar',
    desc: 'Copy this link and send it to your clients. You\'ll see analytics when they watch.',
    target: '[data-tour="share-link"]',
    position: 'bottom'
  }
];

const ContextualTour: React.FC = () => {
  const { isTourActive, activeTourStep, endTour } = useUIStore();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const currentStep = TOUR_STEPS.find(s => s.id === activeTourStep);

  useEffect(() => {
    if (!isTourActive || !currentStep) return;

    const updateCoords = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      } else {
        // Fallback to center if element not found (e.g. on different page)
        setCoords({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 200,
          width: 0,
          height: 0
        });
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [isTourActive, activeTourStep, currentStep]);

  if (!isTourActive || !currentStep) return null;

  const getPopoverStyle = () => {
    const margin = 20;
    if (coords.width === 0) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    switch (currentStep.position) {
      case 'bottom':
        return { top: coords.top + coords.height + margin, left: coords.left + coords.width / 2, transform: 'translateX(-50%)' };
      case 'top':
        return { top: coords.top - margin, left: coords.left + coords.width / 2, transform: 'translate(-50%, -100%)' };
      case 'left':
        return { top: coords.top + coords.height / 2, left: coords.left - margin, transform: 'translate(-100%, -50%)' };
      case 'right':
        return { top: coords.top + coords.height / 2, left: coords.left + coords.width + margin, transform: 'translate(0, -50%)' };
      default:
        return { top: coords.top, left: coords.left };
    }
  };

  return (
    <div className={styles.overlay}>
      {coords.width > 0 && (
        <div 
          className={styles.spotlight} 
          style={{ 
            top: coords.top - 8, 
            left: coords.left - 8, 
            width: coords.width + 16, 
            height: coords.height + 16 
          }} 
        />
      )}
      
      <div className={styles.popover} style={getPopoverStyle()}>
        <div className={styles.header}>
          <div className={styles.taskBadge}>Task {currentStep.id + 1}</div>
          <button className={styles.closeBtn} onClick={endTour}><X size={16} /></button>
        </div>
        <h3 className={styles.title}>{currentStep.title}</h3>
        <p className={styles.desc}>{currentStep.desc}</p>
        <div className={styles.footer}>
          <div className={styles.hint}>
            <MousePointer2 size={12} /> Click the highlighted area
          </div>
          <button className={styles.nextBtn} onClick={endTour}>
            Got it <ArrowRight size={16} />
          </button>
        </div>
        <div className={`${styles.arrow} ${styles[`arrow-${currentStep.position}`]}`} />
      </div>
    </div>
  );
};

export default ContextualTour;
