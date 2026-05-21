'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './RoadmapPlayer.module.css';
import { roadmapSlides, SlideData } from '@/data/roadmap-data';
import { Play, Pause, ChevronLeft, ChevronRight, Send, MessageSquare, List } from 'lucide-react';

export default function RoadmapPlayer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chat'>('transcript');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm Sara, your AI assistant. Do you have any questions about our roadmap? Feel free to ask!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0);
  
  const currentSlide = roadmapSlides[currentSlideIndex];
  const totalSlides = roadmapSlides.length;

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: inputValue }]);
    const userQuery = inputValue;
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      let botResponse = "Good question! We plan to focus on this exactly in the second month.";
      if (userQuery.toLowerCase().includes('sara')) {
        botResponse = "I am Sara, your context-aware assistant. My goal is to reduce user churn at the second step of avatar creation.";
      } else if (userQuery.toLowerCase().includes('conversion')) {
        botResponse = "The current conversion rate is 1.38%, but with the new onboarding, we expect to significantly improve this figure.";
      }
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      {/* Main Stage */}
      <div className={styles.stage}>
        <div className={styles.slideArea}>
          <div className={`${styles.slideContent} ${styles.slideEnter}`} key={currentSlide.id}>
            <div className={styles.slideHeader}>
              <div>
                <div className={styles.slideTag}>{currentSlide.tag}</div>
                <h2 className={styles.slideTitle}>{currentSlide.title}</h2>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                {currentSlideIndex + 1} / {totalSlides}
              </div>
            </div>
            
            <div className={styles.slideBody}>
              {/* Dynamic Content Rendering based on slide ID */}
               {currentSlide.id === 1 && (
                 <div className={styles.metricGrid}>
                   {(currentSlide.content as { metrics: Array<{ label: string; value: number }> }).metrics.map((m) => (
                     <div key={m.label} className={styles.metricCard}>
                       <div className={styles.metricVal}>{m.value}%</div>
                       <div className={styles.metricLabel}>{m.label}</div>
                       <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '12px', borderRadius: '2px' }}>
                         <div style={{ height: '100%', background: '#6366f1', width: `${m.value}%`, borderRadius: '2px' }}></div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}

               {currentSlide.id === 3 && (
                 <div className={styles.metricGrid}>
                   {(currentSlide.content as { metrics: Array<{ label: string; value: string; status?: string }> }).metrics.map((m) => (
                     <div key={m.label} className={styles.metricCard}>
                       <div className={`${styles.metricVal} ${m.status === 'red' ? styles.metricValRed : styles.metricValAmber}`}>
                         {m.value}
                       </div>
                       <div className={styles.metricLabel}>{m.label}</div>
                     </div>
                   ))}
                 </div>
               )}

               {currentSlide.id !== 1 && currentSlide.id !== 3 && (
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                   {Object.entries(currentSlide.content as Record<string, unknown>).map(([key, value]) => (
                     Array.isArray(value) && value.map((item) => (
                       <div key={String(item)} style={{ padding: '12px 20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', fontSize: '15px', fontWeight: 500 }}>
                         {String(item)}
                       </div>
                     ))
                   ))}
                 </div>
               )}

               <p style={{ marginTop: 'auto', fontSize: '18px', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6 }}>
                 {'\u201C'}{currentSlide.script.substring(0, 100)}...{'\u201D'}
               </p>
            </div>
          </div>

          {/* AI Avatar Overlay */}
          <div className={styles.avatarContainer}>
            <img src="/sara-speaking.png" alt="Sara" className={styles.avatarImg} />
            <div className={styles.avatarOverlay}></div>
            {isPlaying && <div className={styles.speakingRipple}></div>}
            {isPlaying && <div className={styles.speakingRipple} style={{ animationDelay: '0.5s' }}></div>}
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

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTabs}>
          <div 
            className={`${styles.tab} ${activeTab === 'transcript' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            <List size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Transcript
          </div>
          <div 
            className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            AI Assistant
          </div>
        </div>

        <div className={styles.sidebarContent}>
          {activeTab === 'transcript' ? (
            <div>
              {roadmapSlides.map((s, idx) => (
                <div 
                  key={s.id} 
                  className={`${styles.transcriptLine} ${idx === currentSlideIndex ? styles.transcriptLineActive : ''}`}
                  onClick={() => { setCurrentSlideIndex(idx); setProgress(0); }}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.6, marginBottom: '4px' }}>SLIDE {s.id}</div>
                  {s.script}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.chatArea}>
              <div className={styles.messages}>
                {messages.map((m, idx) => (
                  <div key={idx} className={`${styles.message} ${m.role === 'bot' ? styles.messageBot : styles.messageUser}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <form className={styles.chatInputArea} onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  className={styles.chatInput} 
                  placeholder="Ask a question about strategy..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
                <button type="submit" className={styles.sendBtn}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
