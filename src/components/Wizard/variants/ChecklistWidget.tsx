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
      title: 'Create your first project',
      desc: 'Start by creating a new presentation from the dashboard.',
      path: '/',
      icon: <Play size={16} />
    },
    {
      id: 1,
      title: 'Upload your content',
      desc: 'Upload a PDF or PPTX file to provide content for the AI.',
      path: '/onboarding/magic',
      icon: <FileText size={16} />
    },
    {
      id: 2,
      title: 'Choose an AI Avatar',
      desc: 'Select a professional persona that fits your brand tone.',
      path: '/onboarding/jtbd',
      icon: <UserCircle size={16} />
    },
    {
      id: 3,
      title: 'Train Knowledge Base',
      desc: 'Add extra documents so the AI can answer viewer questions.',
      path: '/knowledge',
      icon: <BookOpen size={16} />
    },
    {
      id: 4,
      title: 'Share & Track',
      desc: 'Send your link to prospects and track their engagement.',
      path: '/analytics',
      icon: <Share2 size={16} />
    }
  ];

  const handleNextStep = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === currentStep) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
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
