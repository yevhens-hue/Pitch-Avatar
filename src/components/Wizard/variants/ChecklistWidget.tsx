'use client';

import React, { useState, useEffect } from 'react';
import styles from './ChecklistWidget.module.css';
import { Check, ChevronDown, Play, FileText, UserCircle, BookOpen, Share2, Gift, HelpCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';

const ChecklistWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVideo, setShowVideo] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [isAllDone, setIsAllDone] = useState(false);

  const steps = [
    {
      id: 0,
      title: 'Pick a Creation Method',
      desc: 'Most users choose "Quick Presentation" to see AI magic in seconds.',
      path: '/',
      icon: <Play size={16} />,
      video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
      trigger: (path: string) => path === '/' || path.includes('onboarding')
    },
    {
      id: 1,
      title: 'Upload your content',
      desc: 'Upload a PDF or PPTX. This is the foundation for your AI avatar.',
      path: '/create?type=quick',
      icon: <FileText size={16} />,
      video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
      trigger: (path: string, search: string) => path.includes('/create') && (search.includes('step=1') || search.includes('step=2') || !search.includes('step'))
    },
    {
      id: 2,
      title: 'Personalize AI Avatar',
      desc: 'Pick a face and voice. This step turns a slide into a living presentation.',
      path: '/create?type=quick&step=4',
      icon: <UserCircle size={16} />,
      video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
      trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=4')
    },
    {
      id: 3,
      title: 'Generate & Review',
      desc: 'Almost there! Finalize your project and see the result.',
      path: '/create?type=quick&step=5',
      icon: <BookOpen size={16} />,
      video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
      trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=5')
    },
    {
      id: 4,
      title: 'Share the link',
      desc: 'Copy your unique link. Real usage happens when others watch your avatar!',
      path: '/projects',
      icon: <Share2 size={16} />,
      video: 'https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4',
      trigger: (path: string) => path.includes('/projects') || path.includes('/links')
    }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search;
    const foundIndex = steps.findIndex(s => s.trigger(pathname, search));
    if (foundIndex !== -1 && foundIndex > currentStep) {
      setCurrentStep(foundIndex);
    }
  }, [pathname]);

  const { toggleChecklist, isChecklistOpen, startTour } = useUIStore();

  const handleNextStep = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === currentStep) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        const nextStep = steps[index + 1];
        router.push(nextStep.path);
        
        // Use a longer delay for page transitions to ensure elements are present
        setTimeout(() => {
          startTour(index + 1);
        }, 800);
      } else {
        setIsAllDone(true);
      }
    }
  };

  const handleGoToPage = (e: React.MouseEvent, index: number, path: string) => {
    e.stopPropagation();
    router.push(path);
    
    // Smooth transition: Wait for navigation then show tour spotlight
    setTimeout(() => {
      startTour(index);
    }, 800);
  };

  const progress = ((currentStep) / (steps.length - 1)) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (isAllDone) {
    return (
      <div className={styles.widget} style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div className={styles.rewardConfetti}>
          <Gift size={48} color="#fff" />
        </div>
        <h4 className={styles.headerTitle} style={{ fontSize: '1.25rem', marginTop: '1rem' }}>Bonus Unlocked!</h4>
        <p className={styles.headerSub} style={{ margin: '0.5rem 0 1.5rem' }}>You've earned <b>5 extra AI minutes</b> for completing your setup.</p>
        <button className={styles.completeBtn} style={{ width: '100%', padding: '1rem' }} onClick={() => {
          setIsAllDone(false);
          toggleChecklist(false);
        }}>
          Claim & Close
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.widget} ${!isOpen ? styles.minimized : ''}`}>
      {showVideo !== null && (
        <div className={styles.videoOverlay} onClick={() => setShowVideo(null)}>
          <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
            <video src={steps[showVideo].video} autoPlay loop muted playsInline className={styles.helpVideo} />
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

      {!isOpen && (
        <div className={styles.bubble} onClick={() => setIsOpen(true)}>
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

      {isOpen && (
        <>
          <div className={styles.header} onClick={() => setIsOpen(false)}>
            <div className={styles.progressBox}>
              <svg width="44" height="44">
                <circle className={styles.circleBg} cx="22" cy="22" r={radius} />
                <circle 
                  className={styles.circleProgress} 
                  cx="22" cy="22" r={radius} 
                  style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }}
                />
              </svg>
              <span className={styles.progressText}>{currentStep + 1}/{steps.length}</span>
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
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

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
