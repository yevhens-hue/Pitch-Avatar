'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { X, ArrowRight, MousePointer2 } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import styles from './ContextualTour.module.css';

const ContextualTour: React.FC = () => {
  const { isTourActive, activeTourStep, endTour, nextTourStep, completeOnboardingStep } = useUIStore();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentStep = ONBOARDING_STEPS.find(s => s.id === activeTourStep);

  // Sync navigation with tour steps
  useEffect(() => {
    if (!isTourActive || !currentStep) return;

    const currentUrl = pathname + (typeof window !== 'undefined' ? window.location.search : '');
    // Normalize paths for comparison (optional, but good for robustness)
    const normalizedTarget = currentStep.path.split('#')[0];
    const normalizedCurrent = currentUrl.split('#')[0];

    if (normalizedCurrent !== normalizedTarget && !normalizedCurrent.includes(normalizedTarget)) {
       // Only navigate if we're not already on the target page
       // We use a small timeout to avoid immediate navigation loops
       const timer = setTimeout(() => {
         router.push(currentStep.path);
       }, 100);
       return () => clearTimeout(timer);
    }
  }, [activeTourStep, isTourActive, currentStep, pathname, router]);

  // Performance Optimization: Use a ref to prevent unnecessary recalculations from triggers
  const lastUpdateRef = React.useRef<number>(0);

  const updateCoords = React.useCallback(() => {
    if (!currentStep) return false;
    
    // Throttle updates to ~60fps
    const now = Date.now();
    if (now - lastUpdateRef.current < 16) return false;
    lastUpdateRef.current = now;

    const el = document.querySelector(currentStep.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const newCoords = {
        top: rect.top, // Use viewport coordinates since overlay is fixed
        left: rect.left,
        width: rect.width,
        height: rect.height
      };
      
      // Only state update if values actually changed to prevent render loops
      setCoords(prev => {
        if (
          Math.abs(prev.top - newCoords.top) < 1 && 
          Math.abs(prev.left - newCoords.left) < 1 && 
          prev.width === newCoords.width
        ) {
          return prev;
        }
        return newCoords;
      });
      setIsVisible(true);
      return true;
    }
    return false;
  }, [currentStep]);

  useEffect(() => {
    if (isTourActive && currentStep) {
      const timer = setTimeout(() => {
        const el = document.querySelector(currentStep.target);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
        updateCoords();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTourStep, isTourActive, currentStep, updateCoords]);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setIsVisible(false);
      return;
    }

    setIsVisible(false);
    
    // Use interval for high-frequency updates during transitions/animations
    const poll = setInterval(() => {
      updateCoords();
    }, 50);

    const handleUpdate = () => {
      requestAnimationFrame(() => updateCoords());
    };
    
    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('scroll', handleUpdate, { passive: true });

    return () => {
      clearInterval(poll);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [isTourActive, activeTourStep, currentStep, updateCoords]);

  if (!isTourActive || !currentStep || !isVisible) return null;

  const handleNext = () => {
    // INP Critical Fix: Use setTimeout 0 to break execution context and allow UI update
    setTimeout(() => {
      if (activeTourStep !== null) {
        completeOnboardingStep(activeTourStep);
      }
      
      if (activeTourStep === ONBOARDING_STEPS.length - 1) {
        endTour();
      } else {
        nextTourStep();
      }
    }, 0);
  };

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
            top: coords.top - 12, 
            left: coords.left - 12, 
            width: coords.width + 24, 
            height: coords.height + 24 
          }} 
        />
      )}
      
      <div className={styles.popover} style={getPopoverStyle()}>
        <div className={styles.header}>
          <div className={styles.progressText}>{currentStep.id + 1} of {ONBOARDING_STEPS.length}</div>
          <button className={styles.closeBtn} onClick={endTour}><X size={18} /></button>
        </div>
        <h3 className={styles.title}>{currentStep.title}</h3>
        <p className={styles.desc}>{currentStep.desc}</p>
        <div className={styles.footer}>
          <div className={styles.progressDots}>
            {ONBOARDING_STEPS.map((s, idx) => (
              <div key={s.id} className={`${styles.dot} ${idx === activeTourStep ? styles.dotActive : ''}`} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className={styles.skipBtn} onClick={endTour}>Skip</button>
            <button className={styles.nextBtn} onClick={handleNext}>
              {activeTourStep === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
        <div className={`${styles.arrow} ${styles[`arrow-${currentStep.position}`]}`} />
      </div>
    </div>
  );
};

export default ContextualTour;
