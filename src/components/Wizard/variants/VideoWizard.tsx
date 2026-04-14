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
      label: 'Getting Started',
      pauseAt: 4,
      title: 'Step 1: Upload Your Content',
      description: 'The AI needs a foundation. Upload a PDF or PPTX. Our engine will parse your slides to create a script and a knowledge base automatically.',
      actionLabel: 'Got it, what\'s next?',
      nextStart: 4.1
    },
    {
      id: 1,
      label: 'AI Persona',
      pauseAt: 8,
      title: 'Step 2: Choose Your AI Avatar',
      description: 'Select from our library of 50+ diverse avatars. You can also upload your own photo to create a custom AI twin that speaks with your unique voice.',
      actionLabel: 'I want a custom avatar!',
      nextStart: 8.1
    },
    {
      id: 2,
      label: 'AI Training',
      pauseAt: 12,
      title: 'Step 3: Train the Assistant',
      description: 'Add extra documents to the Knowledge Base. This allows your avatar to answer unexpected viewer questions in real-time, just like a human expert.',
      actionLabel: 'Show me how it works',
      nextStart: 12.1
    },
    {
      id: 3,
      label: 'Engagement',
      pauseAt: 16,
      title: 'Step 4: Share & Track',
      description: 'Send a link to your customers. Get notified when they watch, see which slides they spend time on, and review their chat history with the AI.',
      actionLabel: 'Start My First Avatar',
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
