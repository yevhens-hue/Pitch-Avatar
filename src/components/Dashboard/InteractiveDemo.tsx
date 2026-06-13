'use client';

import React, { useState } from 'react';
import styles from './InteractiveDemo.module.css';
import { 
  Upload, CheckCircle, Video, Volume2, Share2, 
  BarChart3, ArrowRight, ArrowLeft, RotateCcw, Copy, Check, Lock 
} from 'lucide-react';

interface Step {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
}

export default function InteractiveDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('brian');
  const [isCopied, setIsCopied] = useState(false);
  const [collectEmail, setCollectEmail] = useState(true);

  const steps: Step[] = [
    {
      title: "Upload Presentation",
      subtitle: "Drag and drop your PPTX or PDF slides to start.",
      badge: "Step 1: Upload",
      icon: <Upload size={18} />
    },
    {
      title: "Choose AI Avatar",
      subtitle: "Select a digital twin to present your slides professionally.",
      badge: "Step 2: Presenter",
      icon: <Video size={18} />
    },
    {
      title: "Voice & AI Script",
      subtitle: "Write or generate scripts and pick an AI voice model.",
      badge: "Step 3: Audio",
      icon: <Volume2 size={18} />
    },
    {
      title: "Generate Shareable Link",
      subtitle: "Publish your presentation and configure viewing parameters.",
      badge: "Step 4: Share",
      icon: <Share2 size={18} />
    },
    {
      title: "Track Slide Analytics",
      subtitle: "Analyze viewer behavior, retention and goal completions.",
      badge: "Step 5: Insights",
      icon: <BarChart3 size={18} />
    }
  ];

  const avatars = [
    { name: 'Sarah (Sales)', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', role: 'Friendly & Professional' },
    { name: 'Michael (Tech)', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', role: 'Authoritative & Clear' },
    { name: 'Emily (Support)', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', role: 'Warm & Welcoming' },
    { name: 'John (Executive)', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', role: 'Corporate & Direct' }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://pitch-avatar.io/p/q3-sales-pitch");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const resetDemo = () => {
    setActiveStep(0);
    setSelectedAvatar(0);
    setSelectedVoice('brian');
  };

  return (
    <div className={styles.demoContainer}>
      {/* Top Progress bar stepper */}
      <div className={styles.stepper}>
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className={`${styles.stepIndicator} ${idx <= activeStep ? styles.stepActive : ''} ${idx === activeStep ? styles.stepCurrent : ''}`}
            onClick={() => setActiveStep(idx)}
          >
            <div className={styles.stepNumIcon}>
              {idx < activeStep ? <CheckCircle size={16} /> : step.icon}
            </div>
            <span className={styles.stepLabel}>{step.title}</span>
          </div>
        ))}
      </div>

      {/* Main Interactive Interactive Stage */}
      <div className={styles.stageGrid}>
        {/* Left Side: Visual Interactive Mockup */}
        <div className={styles.visualCanvas}>
          
          {/* STEP 1 VISUAL MOCKUP */}
          {activeStep === 0 && (
            <div className={styles.uploadMock}>
              <div className={styles.dropZone}>
                <div className={styles.uploadIconPulse}>
                  <Upload size={36} color="#0076ff" />
                </div>
                <h3>Drag & Drop your slides here</h3>
                <p>Supports PDF, PPTX or Keynote formats up to 50MB</p>
                <div className={styles.fileCard}>
                  <div className={styles.fileDetails}>
                    <span className={styles.fileName}>Q3_Sales_Pitch.pptx</span>
                    <span className={styles.fileSize}>12.4 MB</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressBar} style={{ width: '100%' }} />
                  </div>
                  <div className={styles.fileStatus}>
                    <span className={styles.statusText}>100% Uploaded & processed</span>
                    <CheckCircle size={14} className={styles.greenCheck} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 VISUAL MOCKUP */}
          {activeStep === 1 && (
            <div className={styles.avatarMock}>
              <div className={styles.mockTitle}>Select Presentation Avatar</div>
              <div className={styles.avatarGrid}>
                {avatars.map((av, idx) => (
                  <div 
                    key={idx}
                    className={`${styles.avatarCard} ${selectedAvatar === idx ? styles.avatarCardSelected : ''}`}
                    onClick={() => setSelectedAvatar(idx)}
                  >
                    <div className={styles.avatarImageWrapper}>
                      <img src={av.image} alt={av.name} className={styles.avatarImg} />
                      {selectedAvatar === idx && (
                        <div className={styles.activeAvatarBadge}>
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </div>
                    <div className={styles.avatarInfo}>
                      <h4 className={styles.avatarName}>{av.name}</h4>
                      <p className={styles.avatarRole}>{av.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 VISUAL MOCKUP */}
          {activeStep === 2 && (
            <div className={styles.voiceScriptMock}>
              <div className={styles.mockTitle}>Configure Voice & Presentation Script</div>
              <div className={styles.voiceScriptContent}>
                <div className={styles.scriptPane}>
                  <label className={styles.fieldLabel}>Avatar Speech Script (Slide 1)</label>
                  <textarea 
                    className={styles.scriptTextarea}
                    defaultValue="Hello and welcome to Pitch Avatar! Today, I am thrilled to walk you through our brand new interactive platform. In this deck, you will learn how we help sales and marketing teams generate 3x more demo bookings and skyrocket conversion rates up to 20% with zero signup required for listeners. Let's get started!"
                    readOnly
                  />
                  <div className={styles.aiGenerateTip}>
                    <span>✨ Optimized using Sara AI Copilot</span>
                  </div>
                </div>

                <div className={styles.voicePane}>
                  <label className={styles.fieldLabel}>Select Voice Model</label>
                  <div className={styles.voiceOptions}>
                    <div 
                      className={`${styles.voiceOptCard} ${selectedVoice === 'brian' ? styles.voiceOptCardSelected : ''}`}
                      onClick={() => setSelectedVoice('brian')}
                    >
                      <Volume2 size={16} />
                      <div className={styles.voiceOptInfo}>
                        <span className={styles.voiceOptName}>Brian (English US)</span>
                        <span className={styles.voiceOptDesc}>Professional, trustful male voice</span>
                      </div>
                    </div>
                    <div 
                      className={`${styles.voiceOptCard} ${selectedVoice === 'emily' ? styles.voiceOptCardSelected : ''}`}
                      onClick={() => setSelectedVoice('emily')}
                    >
                      <Volume2 size={16} />
                      <div className={styles.voiceOptInfo}>
                        <span className={styles.voiceOptName}>Emily (English UK)</span>
                        <span className={styles.voiceOptDesc}>Warm, welcoming female voice</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 VISUAL MOCKUP */}
          {activeStep === 3 && (
            <div className={styles.shareMock}>
              <div className={styles.mockTitle}>Publish & Generate Dynamic Link</div>
              <div className={styles.shareCard}>
                <div className={styles.linkHeader}>
                  <span className={styles.linkHeaderTitle}>Your interactive link is ready!</span>
                </div>
                <div className={styles.linkInputGroup}>
                  <input 
                    type="text" 
                    className={styles.linkInput} 
                    value="https://pitch-avatar.io/p/q3-sales-pitch" 
                    readOnly 
                  />
                  <button className={styles.copyBtn} onClick={handleCopyLink}>
                    {isCopied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                    <span>{isCopied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <div className={styles.securityToggles}>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Request listener email to view</span>
                      <span className={styles.toggleDesc}>Collect valuable leads automatically</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={collectEmail} 
                        onChange={() => setCollectEmail(!collectEmail)} 
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                  <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Password protect link</span>
                      <span className={styles.toggleDesc}>Secure confidential or proprietary content</span>
                    </div>
                    <Lock size={16} className={styles.greyLock} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 VISUAL MOCKUP */}
          {activeStep === 4 && (
            <div className={styles.analyticsMock}>
              <div className={styles.mockTitle}>Real-time Listener Analytics</div>
              <div className={styles.analyticsStats}>
                <div className={styles.statMiniCard}>
                  <span className={styles.miniLabel}>Total Views</span>
                  <span className={styles.miniValue}>142</span>
                </div>
                <div className={styles.statMiniCard}>
                  <span className={styles.miniLabel}>Avg. Retention</span>
                  <span className={styles.miniValue}>84%</span>
                </div>
                <div className={styles.statMiniCard}>
                  <span className={styles.miniLabel}>Goal Achieved</span>
                  <span className={styles.miniValue}>32%</span>
                </div>
              </div>

              <div className={styles.retentionChart}>
                <span className={styles.chartTitle}>Viewer Retention by Slide</span>
                <div className={styles.barsContainer}>
                  <div className={styles.chartBar} style={{ height: '95%' }}><span className={styles.barTooltip}>Slide 1: 95%</span></div>
                  <div className={styles.chartBar} style={{ height: '90%' }}><span className={styles.barTooltip}>Slide 2: 90%</span></div>
                  <div className={styles.chartBar} style={{ height: '88%' }}><span className={styles.barTooltip}>Slide 3: 88%</span></div>
                  <div className={styles.chartBar} style={{ height: '84%' }}><span className={styles.barTooltip}>Slide 4: 84%</span></div>
                  <div className={styles.chartBar} style={{ height: '62%' }}><span className={styles.barTooltip}>Slide 5: 62%</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Step Description & Navigation */}
        <div className={styles.detailsPane}>
          <div className={styles.badgeWrapper}>
            <span className={styles.badgeText}>{steps[activeStep].badge}</span>
          </div>
          <h2 className={styles.stepTitle}>{steps[activeStep].title}</h2>
          <p className={styles.stepDesc}>{steps[activeStep].subtitle}</p>

          <div className={styles.interactiveExplanation}>
            {activeStep === 0 && (
              <ul className={styles.explanationList}>
                <li>📁 Single slide deck acts as the core presentation structure.</li>
                <li>🚀 Fast conversion into interactive web format.</li>
                <li>🎯 Pre-allocated placeholders for customizable AI Avatars.</li>
              </ul>
            )}
            {activeStep === 1 && (
              <ul className={styles.explanationList}>
                <li>👤 Natural human gestures, eye-contact, and subtle micro-expressions.</li>
                <li>👗 Professionally styled digital presenters for any industry.</li>
                <li>🎥 Dynamic screen positioning: place avatar on the left, right or corner.</li>
              </ul>
            )}
            {activeStep === 2 && (
              <ul className={styles.explanationList}>
                <li>🗣️ 50+ ultra-realistic voice models across multiple languages.</li>
                <li>🤖 Auto-transcribe or translate scripts instantly with AI.</li>
                <li>⏳ Exact timing synchronization between audio segments and slide elements.</li>
              </ul>
            )}
            {activeStep === 3 && (
              <ul className={styles.explanationList}>
                <li>🔗 Instant direct share links, zero download needed for prospects.</li>
                <li>📨 Integrated lead gen forms that synchronize with your CRM.</li>
                <li>⏰ Expiration timers and IP geofencing access controls.</li>
              </ul>
            )}
            {activeStep === 4 && (
              <ul className={styles.explanationList}>
                <li>📊 Precision tracking: know exactly how long they spent on each slide.</li>
                <li>⚠️ Drop-off detection: pinpoint which slide caused them to lose interest.</li>
                <li>⚡ Instant notification when a high-value prospect starts viewing.</li>
              </ul>
            )}
          </div>

          <div className={styles.navActions}>
            {activeStep > 0 && (
              <button className={styles.prevBtn} onClick={prevStep}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            
            {activeStep < steps.length - 1 ? (
              <button className={styles.nextBtn} onClick={nextStep}>
                <span>Next Step</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className={styles.restartBtn} onClick={resetDemo}>
                <RotateCcw size={16} />
                <span>Restart Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
