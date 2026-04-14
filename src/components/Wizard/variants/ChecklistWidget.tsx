'use client';

import React, { useState, useEffect } from 'react';
import styles from './ChecklistWidget.module.css';
import { Check, ChevronDown, ChevronUp, Play, FileText, UserCircle, BookOpen, Share2, MousePointer2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';

const ChecklistWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
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
      trigger: (path: string) => path === '/' || path.includes('onboarding')
    },
    {
      id: 1,
      title: 'Upload your content',
      desc: 'Upload a PDF or PPTX. This is the foundation for your AI avatar.',
      path: '/create?type=quick',
      icon: <FileText size={16} />,
      trigger: (path: string, search: string) => path.includes('/create') && (search.includes('step=1') || search.includes('step=2') || !search.includes('step'))
    },
    {
      id: 2,
      title: 'Personalize AI Avatar',
      desc: 'Pick a face and voice. This step turns a slide into a living presentation.',
      path: '/create?type=quick&step=4',
      icon: <UserCircle size={16} />,
      trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=4')
    },
    {
      id: 3,
      title: 'Generate & Review',
      desc: 'Almost there! Finalize your project and see the result.',
      path: '/create?type=quick&step=5',
      icon: <BookOpen size={16} />,
      trigger: (path: string, search: string) => path.includes('/create') && search.includes('step=5')
    },
    {
      id: 4,
      title: 'Share the link',
      desc: 'Copy your unique link. Real usage happens when others watch your avatar!',
      path: '/projects',
      icon: <Share2 size={16} />,
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

  const handleNextStep = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === currentStep) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        router.push(steps[index + 1].path);
      } else {
        setIsAllDone(true);
      }
    }
  };

  if (isAllDone) {
    return (
      <div className={styles.widget} style={{ textAlign: 'center', padding: '2rem' }}>
        <div className={styles.successIcon}>
          <Check size={40} color="white" />
        </div>
        <h4 className={styles.headerTitle}>You're all set!</h4>
        <p className={styles.headerSub}>You've completed the onboarding.</p>
        <button className={styles.completeBtn} style={{ marginTop: '1rem' }} onClick={() => toggleChecklist(false)}>
          Close Guide
        </button>
      </div>
    );
  }

  const { toggleChecklist, isChecklistOpen } = useUIStore();

  const progress = ((currentStep) / (steps.length - 1)) * 100;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // If we are in the Lab variant, we might want a different look, 
  // but for now let's keep it as a floating widget.
  
  return (
    <div className={`${styles.widget} ${!isOpen ? styles.minimized : ''}`}>
      {!isChecklistOpen && (
        <div className={styles.labNotice}>
          <button onClick={() => toggleChecklist(true)} className={styles.activateBtn}>
            Pin to Dashboard
          </button>
        </div>
      )}
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.progressBox}>
          <svg width="44" height="44">
            <circle 
              className={styles.circleBg} 
              cx="22" cy="22" r={radius} 
            />
            <circle 
              className={styles.circleProgress} 
              cx="22" cy="22" r={radius} 
              style={{ 
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset 
              }}
            />
          </svg>
          <span className={styles.progressText}>{currentStep + 1}/{steps.length}</span>
        </div>
        <div className={styles.headerInfo}>
          <h4 className={styles.headerTitle}>Quick Start Guide</h4>
          <p className={styles.headerSub}>Complete these steps to launch</p>
        </div>
        <button className={styles.toggleBtn}>
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {isOpen && (
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
                  </div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepTitle}>
                      {step.title}
                      {isActive && <MousePointer2 size={12} className={styles.pointer} />}
                    </div>
                    {isActive && (
                      <div className={styles.stepDesc}>
                        {step.desc}
                        <div className={styles.stepActions}>
                          <button 
                            className={styles.completeBtn}
                            onClick={(e) => handleNextStep(e, index)}
                          >
                            Mark as Done
                          </button>
                          <button 
                            className={styles.goBtn}
                            onClick={() => router.push(step.path)}
                          >
                            Go to Page
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
      )}
    </div>
  );
};

export default ChecklistWidget;
