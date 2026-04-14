'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoWizard.module.css';
import { Play, SkipForward, MousePointer2, Wand2, ArrowRight, Video, FileText, Share2, Sparkles } from 'lucide-react';

import { useUIStore } from '@/lib/store';

const VideoWizard: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInteractive, setShowInteractive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { closeOnboarding } = useUIStore();

  const steps = [
    // ...
  ];

  const handleAction = () => {
    setShowInteractive(false);
    setIsPaused(false);
    
    if (steps[currentStep].isFinal) {
      closeOnboarding();
      return;
    }
    // ...

    const nextStart = steps[currentStep].nextStart;
    if (videoRef.current && nextStart !== undefined) {
      videoRef.current.currentTime = nextStart;
      videoRef.current.play();
      setCurrentStep(prev => prev + 1);
    }
  };

  const current = steps[currentStep];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Wand2 size={24} color="#f43f5e" />
          <span>PitchAvatar Lab</span>
        </div>
        <button className={styles.skipBtn} onClick={() => window.location.href = '/'}>
          Skip Intro
        </button>
      </div>

      <div className={styles.videoWrapper}>
        <video 
          ref={videoRef}
          className={styles.videoElement}
          onTimeUpdate={handleTimeUpdate}
          muted
          autoPlay
          playsInline
          src="https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4"
          loop={isPaused}
        />

        {showInteractive && (
          <div className={styles.overlay}>
            {/* Pulsating Hotspot */}
            <div 
              className={styles.hotspot} 
              style={{ top: current.hotspot.top, left: current.hotspot.left }}
              onClick={handleAction}
            >
              <div className={styles.hotspotInner} />
              <div className={styles.hotspotPulse} />
            </div>

            {/* Arcade-style Tooltip */}
            <div 
              className={styles.tooltip}
              style={{ 
                top: `calc(${current.hotspot.top} - 20px)`, 
                left: `calc(${current.hotspot.left} + 40px)`,
                transform: 'translateY(-50%)'
              }}
            >
              <div className={styles.tooltipArrow} />
              <div className={styles.tooltipContent}>
                <div className={styles.tooltipHeader}>
                  <div className={styles.iconBox}>{current.icon}</div>
                  <h3 className={styles.tooltipTitle}>{current.title}</h3>
                </div>
                <p className={styles.tooltipDesc}>{current.description}</p>
                <button 
                  className={styles.tooltipBtn} 
                  onClick={handleAction}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  {current.actionLabel}
                  <ArrowRight size={18} className={isHovered ? styles.arrowAnimate : ''} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.videoLabel}>
          <div className={styles.pulseDot} />
          <span>{current.label.toUpperCase()}</span>
        </div>

        <div className={styles.progressBar}>
          {steps.map((s, i) => (
            <div 
              key={s.id} 
              className={`${styles.progressSegment} ${i <= currentStep ? styles.segmentActive : ''}`} 
            />
          ))}
        </div>
      </div>

      <div className={styles.footerHint}>
        <MousePointer2 size={14} />
        Click on hotspots to explore the platform features
      </div>
    </div>
  );
};

export default VideoWizard;
