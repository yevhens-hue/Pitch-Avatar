'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoWizard.module.css';
import { Play, SkipForward, MousePointer2, CheckCircle2, Wand2 } from 'lucide-react';

const VideoWizard: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInteractive, setShowInteractive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Markers for interactivity (time in seconds)
  const steps = [
    {
      id: 0,
      label: 'Introduction',
      pauseAt: 4,
      title: 'Welcome to PitchAvatar!',
      description: 'Ready to see how AI transforms presentations?',
      actionLabel: 'Show me how!',
      nextStart: 4.1
    },
    {
      id: 1,
      label: 'Avatar Choice',
      pauseAt: 8,
      title: 'Meet Your AI Twin',
      description: 'You can choose from 50+ professional avatars.',
      actionLabel: 'Select an Avatar',
      nextStart: 8.1
    },
    {
      id: 2,
      label: 'Knowledge Base',
      pauseAt: 12,
      title: 'Smart Knowledge Base',
      description: 'Upload your docs and the AI will answer questions.',
      actionLabel: 'Try Knowledge Import',
      nextStart: 12.1
    },
    {
      id: 3,
      label: 'Finalize',
      pauseAt: 16,
      title: 'Ready to Launch?',
      description: 'Your interactive video is just one click away.',
      actionLabel: 'Go to Dashboard',
      isFinal: true
    }
  ];

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTime = videoRef.current.currentTime;
    const step = steps[currentStep];

    if (currentTime >= step.pauseAt && !isPaused && !showInteractive) {
      videoRef.current.pause();
      setIsPaused(true);
      setShowInteractive(true);
    }
  };

  const handleAction = () => {
    setShowInteractive(false);
    setIsPaused(false);
    
    if (steps[currentStep].isFinal) {
      window.location.href = '/';
      return;
    }

    const nextStart = steps[currentStep].nextStart;
    if (videoRef.current && nextStart !== undefined) {
      videoRef.current.currentTime = nextStart;
      videoRef.current.play();
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hint}>
        <Wand2 size={28} style={{ marginRight: '10px', display: 'inline' }} />
        Interactive Onboarding
      </div>
      
      <button className={styles.skipBtn} onClick={() => window.location.href = '/'}>
        Skip Intro <SkipForward size={16} style={{ marginLeft: '6px', display: 'inline' }} />
      </button>

      <div className={styles.videoWrapper}>
        <video 
          ref={videoRef}
          className={styles.videoElement}
          onTimeUpdate={handleTimeUpdate}
          muted
          autoPlay
          playsInline
          // Using a high-quality abstract video that looks like a tech demo background
          src="https://cdn.pixabay.com/video/2020/09/11/49520-458145265_tiny.mp4"
          loop={isPaused} // Loop current frame if paused (visual effect)
        />

        {showInteractive && (
          <div className={styles.overlay}>
            <div className={styles.interactiveElement}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '14px' }}>
                <MousePointer2 size={32} color="#6366f1" />
              </div>
              <h3 className={styles.elementTitle}>{steps[currentStep].title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '300px' }}>
                {steps[currentStep].description}
              </p>
              <button className={styles.elementBtn} onClick={handleAction}>
                {steps[currentStep].actionLabel}
              </button>
            </div>
          </div>
        )}

        <div className={styles.videoLabel}>
          <div className={styles.pulse} />
          <span>ONBOARDING: {steps[currentStep].label.toUpperCase()}</span>
        </div>

        <div className={styles.progressContainer}>
          {steps.map((s, i) => (
            <div 
              key={s.id} 
              className={`${styles.progressDot} ${i <= currentStep ? styles.progressDotActive : ''}`} 
            />
          ))}
        </div>
      </div>

      <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
        The video automatically pauses to let you interact with key features.
      </p>
    </div>
  );
};

export default VideoWizard;
