'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, ChevronDown, Gift, X, PlayCircle } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import styles from './OnboardingGuide.module.css';

interface SpotlightCoords {
  top: number;
  left: number;
  width: number;
  height: number;
}

const OnboardingGuide: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const {
    isGuideOpen,
    isGuideMinimized,
    setGuideMinimized,
    closeGuide,
    openGuide,
    guideCompletedSteps,
    currentGuideStep,
    setCurrentGuideStep,
    completeGuideStep,
    spotlightStepIndex,
    setSpotlightStep,
    isOnboardingCompleted,
    setOnboardingCompleted,
  } = useUIStore();

  const [coords, setCoords] = useState<SpotlightCoords>({ top: 0, left: 0, width: 0, height: 0 });
  const [isSpotlightVisible, setIsSpotlightVisible] = useState(false);
  const [isAllDone, setIsAllDone] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-open guide on first visit
  useEffect(() => {
    if (!isOnboardingCompleted && pathname === '/') {
      const timer = setTimeout(() => openGuide(), 1800);
      return () => clearTimeout(timer);
    }
  }, [isOnboardingCompleted, pathname, openGuide]);

  // ===== SPOTLIGHT COORDS =====

  const updateCoords = useCallback(() => {
    if (spotlightStepIndex === null) return false;
    const step = ONBOARDING_STEPS[spotlightStepIndex];
    if (!step) return false;

    const now = Date.now();
    if (now - lastUpdateRef.current < 16) return false;
    lastUpdateRef.current = now;

    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const newCoords = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
      setCoords(prev => {
        if (
          Math.abs(prev.top - newCoords.top) < 1 &&
          Math.abs(prev.left - newCoords.left) < 1 &&
          Math.abs(prev.width - newCoords.width) < 1
        ) return prev;
        return newCoords;
      });
      setIsSpotlightVisible(true);
      return true;
    }
    return false;
  }, [spotlightStepIndex]);

  // Navigate + find element whenever spotlight step changes
  useEffect(() => {
    if (spotlightStepIndex === null) {
      setIsSpotlightVisible(false);
      return;
    }

    const step = ONBOARDING_STEPS[spotlightStepIndex];
    if (!step) return;

    const currentPath = (pathname || '').split('?')[0];
    const targetPath = step.path.split('?')[0];

    setIsSpotlightVisible(false);

    if (currentPath !== targetPath) {
      router.push(step.path);
    }

    let retryCount = 0;
    const maxRetries = 40; // 8 s total

    const tryFind = () => {
      const el = document.querySelector(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => updateCoords(), 250);
      } else if (retryCount < maxRetries) {
        retryCount++;
        retryTimerRef.current = setTimeout(tryFind, 200);
      }
    };

    retryTimerRef.current = setTimeout(tryFind, 450);
    return () => { if (retryTimerRef.current) clearTimeout(retryTimerRef.current); };
  }, [spotlightStepIndex, pathname, router, updateCoords]);

  // Keep coords updated on scroll / resize
  useEffect(() => {
    if (spotlightStepIndex === null || !isSpotlightVisible) return;

    const handleUpdate = () => requestAnimationFrame(() => updateCoords());
    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('scroll', handleUpdate, { passive: true });
    const poll = setInterval(() => updateCoords(), 100);

    return () => {
      clearInterval(poll);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [spotlightStepIndex, isSpotlightVisible, updateCoords]);

  // ===== HANDLERS =====

  const startTourFromStep = (index: number) => {
    setCurrentGuideStep(index);
    setSpotlightStep(index);
    setGuideMinimized(true); // hide checklist so spotlight is unobstructed
  };

  const handleSpotlightNext = () => {
    const currentIdx = spotlightStepIndex!;
    completeGuideStep(currentIdx);

    const nextIdx = currentIdx + 1;
    if (nextIdx < ONBOARDING_STEPS.length) {
      setCurrentGuideStep(nextIdx);
      setSpotlightStep(nextIdx);
    } else {
      setSpotlightStep(null);
      setIsAllDone(true);
      setGuideMinimized(false);
    }
  };

  const handleSpotlightSkip = () => {
    setSpotlightStep(null);
    setGuideMinimized(false); // re-expand checklist
  };

  const handleClaimReward = () => {
    setIsAllDone(false);
    setOnboardingCompleted(true);
    closeGuide();
  };

  // Don't render when completed and guide is closed
  if (isOnboardingCompleted && !isGuideOpen) return null;

  // ===== TOOLTIP POSITION =====
  const getTooltipStyle = (): React.CSSProperties => {
    if (!coords.width || spotlightStepIndex === null) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const step = ONBOARDING_STEPS[spotlightStepIndex];
    const margin = 28;
    const tooltipWidth = 320;
    const safeLeft = (left: number) =>
      Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    switch (step.position) {
      case 'bottom':
        return {
          top: coords.top + coords.height + margin,
          left: safeLeft(coords.left + coords.width / 2 - tooltipWidth / 2),
        };
      case 'top':
        return {
          top: coords.top - margin,
          left: safeLeft(coords.left + coords.width / 2 - tooltipWidth / 2),
          transform: 'translateY(-100%)',
        };
      case 'left':
        return {
          top: coords.top + coords.height / 2,
          left: coords.left - margin - tooltipWidth,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: coords.top + coords.height / 2,
          left: coords.left + coords.width + margin,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: coords.top + coords.height + margin,
          left: safeLeft(coords.left),
        };
    }
  };

  const getArrowClass = () => {
    if (spotlightStepIndex === null) return '';
    switch (ONBOARDING_STEPS[spotlightStepIndex].position) {
      case 'bottom': return styles.arrowBottom;
      case 'top':    return styles.arrowTop;
      case 'left':   return styles.arrowLeft;
      case 'right':  return styles.arrowRight;
      default:       return styles.arrowBottom;
    }
  };

  // ===== PROGRESS =====
  const completedCount = guideCompletedSteps.length;
  const progress = (completedCount / ONBOARDING_STEPS.length) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isTourActive = spotlightStepIndex !== null;

  // ===== RENDER =====
  return (
    <>
      {/* ── SPOTLIGHT OVERLAY ── */}
      {isTourActive && isSpotlightVisible && coords.width > 0 && (
        <div className={styles.spotlightOverlay}>
          {/* dim backdrop – click to skip */}
          <div className={styles.spotlightBackdrop} onClick={handleSpotlightSkip} />

          {/* highlighted cutout */}
          <div
            className={styles.spotlight}
            style={{
              top:    coords.top  - 12,
              left:   coords.left - 12,
              width:  coords.width  + 24,
              height: coords.height + 24,
            }}
          >
            <div className={styles.spotlightRing} />
          </div>

          {/* tooltip */}
          <div className={styles.tooltip} style={getTooltipStyle()}>
            <div className={`${styles.tooltipArrow} ${getArrowClass()}`} />
            <div className={styles.tooltipHeader}>
              <span className={styles.tooltipStepLabel}>
                Step {spotlightStepIndex! + 1} of {ONBOARDING_STEPS.length}
              </span>
              <button className={styles.tooltipCloseBtn} onClick={handleSpotlightSkip}>
                <X size={14} />
              </button>
            </div>
            <h3 className={styles.tooltipTitle}>
              {ONBOARDING_STEPS[spotlightStepIndex!].title}
            </h3>
            <p className={styles.tooltipDesc}>
              {ONBOARDING_STEPS[spotlightStepIndex!].desc}
            </p>
            <div className={styles.tooltipFooter}>
              <div className={styles.tooltipDots}>
                {ONBOARDING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`${styles.tooltipDot} ${
                      idx === spotlightStepIndex ? styles.tooltipDotActive :
                      guideCompletedSteps.includes(idx) ? styles.tooltipDotDone : ''
                    }`}
                  />
                ))}
              </div>
              <div className={styles.tooltipActions}>
                <button className={styles.tooltipSkipBtn} onClick={handleSpotlightSkip}>
                  Pause
                </button>
                <button className={styles.tooltipNextBtn} onClick={handleSpotlightNext}>
                  {spotlightStepIndex === ONBOARDING_STEPS.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING WIDGET ── */}
      {isGuideOpen && (
        <div className={`${styles.widget} ${isGuideMinimized ? styles.minimized : ''}`}>

          {/* Minimized bubble */}
          {isGuideMinimized && (
            <div className={styles.bubble} onClick={() => {
              if (!isTourActive) setGuideMinimized(false);
            }}>
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
                    You&apos;ve earned <b>5 extra AI minutes</b> for completing the tour.
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
                        {completedCount}/{ONBOARDING_STEPS.length}
                      </span>
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

                  {/* ── Start tour CTA ── */}
                  {completedCount === 0 && (
                    <div className={styles.startTourBanner}>
                      <button
                        className={styles.startTourBtn}
                        onClick={() => startTourFromStep(0)}
                      >
                        <PlayCircle size={18} />
                        Start Interactive Tour
                      </button>
                      <p className={styles.startTourHint}>
                        We&apos;ll highlight each feature step by step
                      </p>
                    </div>
                  )}

                  {/* ── Step list ── */}
                  <div className={styles.content}>
                    <div className={styles.stepList}>
                      {ONBOARDING_STEPS.map((step, index) => {
                        const isCompleted = guideCompletedSteps.includes(index);
                        const isActive = index === currentGuideStep;

                        return (
                          <div
                            key={step.id}
                            className={`${styles.stepItem} ${isActive ? styles.activeStep : ''} ${isCompleted ? styles.completedStep : ''}`}
                            onClick={() => startTourFromStep(index)}
                            title="Click to spotlight this step"
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
      )}
    </>
  );
};

export default OnboardingGuide;
