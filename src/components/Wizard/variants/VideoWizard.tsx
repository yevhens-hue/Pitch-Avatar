'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoWizard.module.css';
import { Play, SkipForward, MousePointer2, CheckCircle2, Wand2, ArrowRight, Video, FileText, Share2, Sparkles } from 'lucide-react';

const VideoWizard: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInteractive, setShowInteractive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const steps = [
    {
      id: 0,
      label: 'Foundation',
      pauseAt: 4,
      title: 'Upload Content',
      description: 'Drag & drop your PDF or PPTX. PitchAvatar parses every slide to build your AI script instantly.',
      actionLabel: 'Try Import',
      icon: <FileText size={24} />,
      nextStart: 4.1
    },
    {
      id: 1,
      label: 'Character',
      pauseAt: 8,
      title: 'Pick AI Avatar',
      description: 'Choose a professional persona or create your own AI twin from a single photo.',
      actionLabel: 'Select Avatar',
      icon: <Video size={24} />,
      nextStart: 8.1
    },
    {
      id: 2,
      label: 'Intelligence',
      pauseAt: 12,
      title: 'Knowledge Base',
      description: 'Feed the AI extra docs so it can answer viewer questions in real-time during playback.',
      actionLabel: 'Train AI',
      icon: <Sparkles size={24} />,
      nextStart: 12.1
    },
    {
      id: 3,
      label: 'Success',
      pauseAt: 16,
      title: 'Share & Analyze',
      description: 'Send your presentation link and track engagement, heatmaps, and chat logs.',
      actionLabel: 'Get Started',
      icon: <Share2 size={24} />,
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
              <div className={styles.iconCircle}>
                {steps[currentStep].icon}
              </div>
              <div className={styles.textStack}>
                <h3 className={styles.elementTitle}>{steps[currentStep].title}</h3>
                <p className={styles.elementDesc}>{steps[currentStep].description}</p>
              </div>
              <button 
                className={styles.elementBtn} 
                onClick={handleAction}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {steps[currentStep].actionLabel}
                <ArrowRight size={20} className={isHovered ? styles.arrowAnimate : ''} />
              </button>
              <div className={styles.clickHint}>
                <MousePointer2 size={14} /> Click to proceed
              </div>
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
