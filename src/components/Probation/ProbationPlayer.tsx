'use client';

import React, { useState, useEffect } from 'react';
import styles from '../Roadmap/RoadmapPlayer.module.css';
import { probationSlides } from '@/data/probation-data';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProbationPlayer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const currentSlide = probationSlides[currentSlideIndex];
  const totalSlides = probationSlides.length;

  // Handle slide timing (simulation)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1; // 10 seconds per slide roughly
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSlideIndex]);

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  return (
    <div className={styles.container}>
      {/* Main Stage */}
      <div className={styles.stage} style={{ borderRight: 'none' }}>
        <div className={styles.slideArea}>
          <div className={`${styles.slideContent} ${styles.slideEnter}`} key={currentSlide.id} style={{ maxWidth: '1200px', maxHeight: '680px' }}>
            <div className={styles.slideHeader}>
              <div>
                <div className={styles.slideTag}>{currentSlide.tag}</div>
                <h2 className={styles.slideTitle}>{currentSlide.title}</h2>
                {currentSlide.subtitle && (
                  <div style={{ fontSize: '15px', color: '#0076ff', marginTop: '8px', fontWeight: 500 }}>
                    {currentSlide.subtitle}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                {currentSlideIndex + 1} / {totalSlides}
              </div>
            </div>
            
            <div className={styles.slideBody}>
               {/* Dynamic Content Rendering */}
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                 {Object.entries(currentSlide.content as Record<string, unknown>).map(([key, value]) => {
                   if (key === 'metrics') {
                     return (value as Array<{ label: string; value: number | string; status?: string }>).map((m) => (
                       <div key={m.label} className={styles.metricCard}>
                         <div className={`${styles.metricVal} ${m.status === 'red' ? styles.metricValRed : m.status === 'amber' ? styles.metricValAmber : ''}`}>
                           {m.value}{typeof m.value === 'number' ? '%' : ''}
                         </div>
                         <div className={styles.metricLabel}>{m.label}</div>
                         {typeof m.value === 'number' && (
                           <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '12px', borderRadius: '2px' }}>
                             <div style={{ height: '100%', background: '#0076ff', width: `${m.value}%`, borderRadius: '2px' }}></div>
                           </div>
                         )}
                       </div>
                     ));
                   }
                   
                   return Array.isArray(value) && value.map((item) => (
                     <div key={String(item)} style={{ padding: '12px 20px', background: 'rgba(0,118,255, 0.1)', border: '1px solid rgba(0,118,255, 0.3)', borderRadius: '12px', fontSize: '15px', fontWeight: 500 }}>
                       {String(item)}
                     </div>
                   ));
                 })}
               </div>

               <p style={{ marginTop: 'auto', fontSize: '18px', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 }}>
                 {'\u201C'}{currentSlide.script}{'\u201D'}
               </p>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className={styles.controls}>
          <button className={styles.playBtn} onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className={styles.timeInfo}>
            {Math.floor(progress / 10)}s / 10s
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.navBtn} onClick={handlePrev} disabled={currentSlideIndex === 0}>
              <ChevronLeft size={18} />
            </button>
            <button className={styles.navBtn} onClick={handleNext} disabled={currentSlideIndex === totalSlides - 1}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
