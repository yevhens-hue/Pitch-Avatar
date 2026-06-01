'use client';

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, ChevronDown, Gift, X } from 'lucide-react';
import { useUIStore, ChecklistType } from '@/lib/store';
import { ONBOARDING_CHECKLISTS } from '@/constants/onboarding';
import styles from './OnboardingGuide.module.css';

const OnboardingGuide: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    isGuideOpen,
    isGuideMinimized,
    setGuideMinimized,
    openGuide,
    closeGuide,
    activeChecklist,
    setActiveChecklist,
    guideCompletedSteps,
    completeGuideStep,
    isOnboardingCompleted,
    setOnboardingCompleted,
  } = useUIStore();

  const [isAllDone, setIsAllDone] = React.useState(false);

  // Auto-open disabled: guide opens only on explicit user action (e.g. "Get Started" button).


  // ===== HANDLERS =====
  const currentSteps = activeChecklist ? ONBOARDING_CHECKLISTS[activeChecklist] : [];
  
  const branchName = useMemo(() => {
    switch (activeChecklist) {
      case 'video': return 'Checklist 1 — Avatar Video';
      case 'chat': return 'Checklist 2 — Chat Avatar';
      case 'slides': return 'Checklist 3 — Slides';
      case 'localization': return 'Checklist 4 — Localization';
      case 'fallback': return 'Checklist 5 — General Start';
      default: return 'Checklist';
    }
  }, [activeChecklist]);

  const handleStepClick = (index: number) => {
    if (!currentSteps[index]) return;
    
    // 1. Mark as completed (simplification for lab mode)
    completeGuideStep(index);
    
    // 2. Navigate to the screen
    const targetPath = currentSteps[index].path;
    const currentPath = (pathname || '').split('?')[0];
    
    if (currentPath !== targetPath.split('?')[0]) {
      router.push(targetPath);
    }
    
    // 3. Check if all done
    if (guideCompletedSteps.length + 1 >= currentSteps.length) {
      setTimeout(() => {
        setIsAllDone(true);
        setGuideMinimized(false);
      }, 500);
    }
  };

  const handleClaimReward = () => {
    setIsAllDone(false);
    setOnboardingCompleted(true);
    closeGuide();
  };

  // Don't render if completed or no checklist active
  if ((isOnboardingCompleted && !isGuideOpen) || !activeChecklist) return null;

  // ===== PROGRESS =====
  const completedCount = guideCompletedSteps.length;
  const totalSteps = currentSteps.length || 1;
  const progress = (completedCount / totalSteps) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // ===== RENDER =====
  return (
    <div className={`${styles.widget} ${isGuideMinimized ? styles.minimized : ''}`}>
      {/* Minimized bubble */}
      {isGuideMinimized && (
        <div className={styles.bubble} onClick={() => setGuideMinimized(false)}>
          <svg width="60" height="60">
            <circle className={styles.circleBg} cx="30" cy="30" r="26" />
            <circle
              className={styles.circleProgress}
              cx="30" cy="30" r="26"
              style={{
                strokeDasharray: 2 * Math.PI * 26,
                strokeDashoffset: (2 * Math.PI * 26) - (progress / 100) * (2 * Math.PI * 26),
              }}
            />
          </svg>
          <div className={styles.bubbleText}>{Math.round(progress)}%</div>
          <div className={styles.bubblePulse} />
        </div>
      )}

      {/* Expanded checklist */}
      {!isGuideMinimized && (
        <>
          {isAllDone ? (
            /* ── Reward card ── */
            <div className={styles.rewardCard}>
              <div className={styles.rewardIconWrapper}>
                <Gift size={48} color="#fff" />
              </div>
              <h4 className={styles.rewardTitle}>Bonus Unlocked! 🎉</h4>
              <p className={styles.rewardDesc}>
                You&apos;ve earned <b>+5 avatar minutes</b> for completing your tasks.
              </p>
              <button className={styles.claimBtn} onClick={handleClaimReward}>
                Claim &amp; Close
              </button>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div className={styles.header} onClick={() => setGuideMinimized(true)}>
                <div className={styles.progressBox}>
                  <svg width="44" height="44">
                    <circle className={styles.circleBg} cx="22" cy="22" r={radius} />
                    <circle
                      className={styles.circleProgress}
                      cx="22" cy="22" r={radius}
                      style={{ strokeDasharray: circumference, strokeDashoffset }}
                    />
                  </svg>
                  <span className={styles.progressText}>
                    {completedCount}/{totalSteps}
                  </span>
                </div>
                <div className={styles.headerInfo}>
                  <h4 className={styles.headerTitle}>{branchName}</h4>
                  <div className={styles.rewardBadge}>
                    <Gift size={12} /> +5 avatar minutes
                  </div>
                </div>
                <button className={styles.toggleBtn}>
                  <ChevronDown size={20} />
                </button>
              </div>

              {/* ── Step list ── */}
              <div className={styles.content}>
                <div className={styles.stepList}>
                  {currentSteps.map((step, index) => {
                    const isCompleted = guideCompletedSteps.includes(index);
                    // Active step is the first non-completed step
                    const isActive = !isCompleted && !guideCompletedSteps.includes(index - 1) && (index === 0 || guideCompletedSteps.includes(index - 1));

                    return (
                      <div
                        key={step.id}
                        className={`${styles.stepItem} ${isActive ? styles.activeStep : ''} ${isCompleted ? styles.completedStep : ''}`}
                        onClick={() => handleStepClick(index)}
                        title="Click to go to this step"
                      >
                        <div className={styles.statusIcon}>
                          {isCompleted
                            ? <Check size={14} color="white" />
                            : index + 1}
                          {isActive && !isCompleted && (
                            <div className={styles.activePulse} />
                          )}
                        </div>
                        <div className={styles.stepInfo}>
                          <div className={styles.stepTitle}>{step.title}</div>
                          {isActive && (
                            <div className={styles.stepDesc}>{step.desc}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OnboardingGuide;
