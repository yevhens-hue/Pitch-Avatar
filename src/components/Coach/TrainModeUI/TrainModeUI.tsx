'use client'

import React, { useState, useEffect } from 'react';
import styles from './TrainModeUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, Bot, Video, ArrowUp, ThumbsUp, ThumbsDown, Database, Zap, ChevronsUpDown, Mic, Check } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getProjectById } from '@/app/actions/projects';

type Mode = 'listener' | 'avatar';

interface TrainModeUIProps {
  projectId: string;
}

interface Slide {
  id: string | number;
  text: string;
  [key: string]: any;
}

const TrainModeUI: React.FC<TrainModeUIProps> = ({ projectId }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('listener');
  const [projectTitle, setProjectTitle] = useState('Loading...');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  // Controls state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [generateFromContent, setGenerateFromContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  
  // Editor State (Avatar Mode)
  const [scenarioInput, setScenarioInput] = useState({ question: '', expectedAnswer: '' });

  // Player State (Listener Mode)
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(p => {
        if (p) {
          setProjectTitle(p.title);
          if (p.slides) setSlides(p.slides);
        }
      });
    }
  }, [projectId]);

  const activeSlide = slides[activeSlideIndex] || { id: 1, text: 'No slide content' };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ChevronLeft size={18} />
            Back
          </button>
          <div className={styles.title}>
            Train — {projectTitle}
            <span className={styles.badge}>
              <span style={{ fontSize: '12px' }}>✨</span> Training
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.checkboxes}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} /> Voice
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={videoEnabled} onChange={e => setVideoEnabled(e.target.checked)} /> Video
            </label>
          </div>
          
          <div className={styles.actions}>
            <button className={styles.btnOutline}><Plus size={16} /> Add Q&A</button>
            <button className={styles.btnOutline}><X size={16} /> Discard</button>
            <button className={styles.btnSolid}>Save</button>
          </div>
        </div>
      </div>

      {/* MODE TOGGLE BAR */}
      <div className={styles.modeBar}>
        <div className={styles.modeToggle}>
          <span>Mode:</span>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${mode === 'listener' ? styles.active : ''}`}
              onClick={() => setMode('listener')}
            >
              You speak as Listener
            </button>
            <button 
              className={`${styles.segmentBtn} ${mode === 'avatar' ? styles.active : ''}`}
              onClick={() => setMode('avatar')}
            >
              You speak as Avatar
            </button>
          </div>
          
          {mode === 'avatar' && (
            <label className={styles.generateToggle}>
              <div className={styles.switch}>
                <input type="checkbox" checked={generateFromContent} onChange={e => setGenerateFromContent(e.target.checked)} />
                <span className={styles.slider}></span>
              </div>
              Generate Question from content
            </label>
          )}
        </div>
        
        <div className={styles.subtext}>
          {mode === 'listener' 
            ? 'You ask questions as a listener. Avatar responds based on its role and content.'
            : 'Avatar asks questions as a listener would. You respond as the avatar.'
          }
        </div>
      </div>

      {/* WORKSPACE */}
      <div className={styles.workspace}>
        {/* LEFT PANEL */}
        <div className={styles.leftPanel}>
          <div className={styles.slidePreview}>
            <div className={styles.slidePill}>Slide {activeSlideIndex + 1} / {Math.max(1, slides.length)}</div>
            <div className={styles.slideTitle}>{projectTitle}</div>
            <div className={styles.slideHeadline}>Slide {activeSlide.id}</div>
            <div className={styles.slideSubheadline}>
              {activeSlide.text.substring(0, 150)}{activeSlide.text.length > 150 ? '...' : ''}
            </div>
            <div className={styles.slideFooter}>pitch-avatar.com</div>
          </div>
          
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}>
              <ChevronLeft size={16} />
            </button>
            {slides.length > 0 ? slides.map((_, i) => (
              <button 
                key={i} 
                className={`${styles.pageBtn} ${i === activeSlideIndex ? styles.active : ''}`}
                onClick={() => setActiveSlideIndex(i)}
              >
                {i + 1}
              </button>
            )) : <button className={`${styles.pageBtn} ${styles.active}`}>1</button>}
            <button className={styles.pageBtn} onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}>
              <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat & Reactions
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'knowledge' ? styles.active : ''}`}
              onClick={() => setActiveTab('knowledge')}
            >
              Knowledge Base
            </button>
          </div>

          {activeTab === 'chat' ? (
            <>
              <div className={styles.chatArea}>
                {/* User Bubble */}
                <div className={styles.userMessage}>
                  [MODE: Avatar generates questions from content]<br/>
                  что главное на слайде 5?
                </div>

                {/* Avatar Response Block */}
                <div className={styles.avatarResponseContainer}>
                  <div className={styles.avatarMessage}>
                    На пятом слайде основной акцент сделан на <b>преимуществах использования AI-аватаров для бизнеса</b>, включая круглосуточную доступность и мультиязычность. Хотите, чтобы я подробнее разобрал конкретный пункт или перешел к следующему слайду? (Замените на ID вашего проекта для перехода)
                  </div>
                  
                  {/* Action Buttons Row */}
                  <div className={styles.messageActionsRow}>
                    <button className={styles.actionBtn}>
                      <ThumbsUp size={16} /> Confirm
                    </button>
                    <button className={styles.actionBtn}>
                      <ThumbsDown size={16} /> Reject & Edit
                    </button>
                    <button className={styles.actionBtn}>
                      <Database size={16} /> Q&A → KB
                    </button>
                    <button className={styles.actionBtn}>
                      <Zap size={16} /> Add as Instruction
                    </button>
                  </div>

                  {/* Answer with Avatar Voice Widget */}
                  <div className={styles.voiceBar}>
                    <div className={styles.voiceDragIcon}>
                      <ChevronsUpDown size={14} />
                    </div>
                    <div className={styles.voiceTextWrapper}>
                      <Mic size={16} />
                      <span>Answer with Avatar Voice</span>
                    </div>
                    <div className={styles.tagGroup}>
                      <span className={styles.tagReaction}>Reaction</span>
                      <span className={styles.tagTraining}>Training</span>
                    </div>
                    <div className={styles.voiceControls}>
                      <button className={styles.controlIconBtn}><Check size={14} /></button>
                      <button className={styles.controlIconBtn}><X size={14} /></button>
                    </div>
                  </div>

                  <button className={styles.addReactionBtn}>
                    <Plus size={16} /> Add reaction
                  </button>
                </div>
              </div>

              {/* Input Box Row */}
              <div className={styles.inputArea}>
                <div className={styles.inputBox}>
                  <input 
                    type="text" 
                    className={styles.inputField} 
                    placeholder="Напишите сообщение..." 
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                  />
                  <button className={styles.sendBtn} style={{ background: chatMessage ? '#3b82f6' : '#94a3b8' }}>
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.chatArea}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                Knowledge base settings and files would appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainModeUI;
