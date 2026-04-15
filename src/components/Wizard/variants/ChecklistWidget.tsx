'use client';

import React, { useState, useEffect } from 'react';
import styles from './ChecklistWidget.module.css';
import { Check, ChevronDown, Play, FileText, UserCircle, BookOpen, Share2, Gift, HelpCircle, ArrowRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { ONBOARDING_STEPS } from '@/constants/onboarding';

const ChecklistWidget: React.FC = () => {
  const { 
    isChecklistOpen, 
    toggleChecklist, 
    currentChecklistStep, 
    setCurrentChecklistStep, 
    completeOnboardingStep,
    setOnboardingCompleted,
    isChecklistMinimized, 
    setChecklistMinimized,
    isTourActive,
    startTour 
  } = useUIStore();

  const [showVideo, setShowVideo] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [isAllDone, setIsAllDone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // INP Optimization: Defer progress calculation to let the page settle
    const timer = setTimeout(() => {
      const search = window.location.search;
      const currentPath = pathname || '';
      
      const foundIndex = ONBOARDING_STEPS.findIndex(s => s.trigger(currentPath, search));
      
      if (foundIndex !== -1 && foundIndex > currentChecklistStep) {
        setCurrentChecklistStep(foundIndex);
        if (isTourActive) startTour(foundIndex);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, currentChecklistStep, setCurrentChecklistStep, isTourActive, startTour]);

  const handleNextStep = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === currentChecklistStep) {
      if (currentChecklistStep < ONBOARDING_STEPS.length - 1) {
        completeOnboardingStep(index);
        const nextStepObj = ONBOARDING_STEPS[index + 1];
        
        // INP Critical Fix: Yield before navigation
        setTimeout(() => {
          router.push(nextStepObj.path);
          startTour(index + 1);
        }, 0);
      } else {
        setIsAllDone(true);
      }
    }
  };

  const handleGoToPage = (e: React.MouseEvent, index: number, path: string) => {
    e.stopPropagation();
    setTimeout(() => {
      router.push(path);
      startTour(index);
    }, 0);
  };

  const progress = React.useMemo(() => 
    ((currentChecklistStep) / (ONBOARDING_STEPS.length - 1)) * 100
  , [currentChecklistStep]);

  const radius = 18;
  const circumference = React.useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = React.useMemo(() => 
    circumference - (progress / 100) * circumference
  , [progress, circumference]);

  if (isAllDone) {
    return (
      <div className={styles.widget} style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div className={styles.rewardConfetti}>
          <Gift size={48} color="#fff" />
        </div>
        <h4 className={styles.headerTitle} style={{ fontSize: '1.25rem', marginTop: '1rem' }}>Bonus Unlocked!</h4>
        <p className={styles.headerSub} style={{ margin: '0.5rem 0 1.5rem' }}>You&apos;ve earned <b>5 extra AI minutes</b> for completing your setup.</p>
        <button className={styles.completeBtn} style={{ width: '100%', padding: '1rem' }} onClick={() => {
          setIsAllDone(false);
          toggleChecklist(false);
          setOnboardingCompleted(true);
        }}>
          Claim & Close
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.widget} ${isChecklistMinimized ? styles.minimized : ''}`}>
      {showVideo !== null && (
        <div className={styles.videoOverlay} onClick={() => setShowVideo(null)}>
          <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
            <video src={(ONBOARDING_STEPS[showVideo] as { video?: string })?.video} autoPlay loop muted playsInline className={styles.helpVideo} />
            <button className={styles.closeVideo} onClick={() => setShowVideo(null)}>Close Tutorial</button>
          </div>
        </div>
      )}

      {!isChecklistOpen && (
        <div className={styles.labNotice}>
          <button onClick={() => toggleChecklist(true)} className={styles.activateBtn}>
            Pin to Dashboard
          </button>
        </div>
      )}

      {isChecklistMinimized && (
        <div className={styles.bubble} onClick={() => setChecklistMinimized(false)}>
          <svg width="60" height="60">
            <circle className={styles.circleBg} cx="30" cy="30" r="26" />
            <circle 
              className={styles.circleProgress} 
              cx="30" cy="30" r="26" 
              style={{ 
                strokeDasharray: 2 * Math.PI * 26,
                strokeDashoffset: (2 * Math.PI * 26) - (progress / 100) * (2 * Math.PI * 26) 
              }}
            />
          </svg>
          <div className={styles.bubbleText}>{Math.round(progress)}%</div>
          <div className={styles.bubblePulse} />
        </div>
      )}

      {!isChecklistMinimized && (
        <>
          <div className={styles.header} onClick={() => setChecklistMinimized(true)}>
            <div className={styles.progressBox}>
              <svg width="44" height="44">
                <circle className={styles.circleBg} cx="22" cy="22" r={radius} />
                <circle 
                  className={styles.circleProgress} 
                  cx="22" cy="22" r={radius} 
                  style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }}
                />
              </svg>
              <span className={styles.progressText}>{currentChecklistStep + 1}/{ONBOARDING_STEPS.length}</span>
            </div>
            <div className={styles.headerInfo}>
              <h4 className={styles.headerTitle}>Launch Checklist</h4>
              <div className={styles.rewardBadge}>
                <Gift size={12} /> +5 AI min reward
              </div>
            </div>
            <button className={styles.toggleBtn}>
              <ChevronDown size={20} />
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.stepList}>
              {ONBOARDING_STEPS.map((step, index) => {
                const isCompleted = index < currentChecklistStep;
                const isActive = index === currentChecklistStep;

                return (
                  <div 
                    key={step.id} 
                    className={`${styles.stepItem} ${isActive ? styles.activeStep : ''} ${isCompleted ? styles.completedStep : ''}`}
                    onClick={() => router.push(step.path)}
                  >
                    <div className={styles.statusIcon}>
                      {isCompleted ? <Check size={14} color="white" /> : index + 1}
                      {isActive && <div className={styles.activePulse} />}
                    </div>
                    <div className={styles.stepInfo}>
                      <div className={styles.stepTitle}>
                        {step.title}
                        {isActive && (
                          <button 
                            className={styles.helpBtn} 
                            onClick={(e) => { e.stopPropagation(); setShowVideo(index); }}
                            title="See how it works"
                          >
                            <HelpCircle size={14} />
                          </button>
                        )}
                      </div>
                      {isActive && (
                        <div className={styles.stepDesc}>
                          {step.desc}
                          <div className={styles.stepActions}>
                            <button className={styles.completeBtn} onClick={(e) => handleNextStep(e, index)}>
                              Next Step
                            </button>
                            <button className={styles.goBtn} onClick={(e) => handleGoToPage(e, index, step.path)}>
                              Show me how <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChecklistWidget;
