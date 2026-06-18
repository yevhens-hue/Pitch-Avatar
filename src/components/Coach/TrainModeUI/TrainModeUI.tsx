'use client'

import React, { useState, useEffect } from 'react';
import styles from './TrainModeUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, Bot, Video, ArrowUp, ThumbsUp, ThumbsDown, Database, Zap, ChevronsUpDown, Mic, Check, FileText, CheckSquare } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getProjectById } from '@/app/actions/projects';

type Mode = 'practice' | 'train';

interface TrainModeUIProps {
  projectId: string;
  /** Optional pre-loaded slides (otherwise fetched via getProjectById) */
  slides?: Slide[];
  /** Optional custom exit handler; falls back to router.back() */
  onExit?: () => void;
}

interface Slide {
  id: string | number;
  text?: string;
  title?: string;
  [key: string]: any;
}

/** Convert a YouTube/Vimeo watch URL into an embeddable player URL. */
const toEmbedUrl = (url: string): string => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
};
const isEmbeddableVideo = (url: string) => /youtube\.com|youtu\.be|vimeo\.com/.test(url);

const extractTemplateVariables = (text: string) => {
  const matches = text.match(/\{[^}]+\}/g);
  return matches ? Array.from(new Set(matches)) : [];
};

interface Message {
  id: string;
  role: 'user' | 'avatar';
  text: string;
  type?: 'evaluation' | 'regular';
  isGenerating?: boolean;
  testOptions?: string[];
  reactionType?: string;
  reactionData?: string;
  expectedAnswer?: string;
  expectedSlideId?: string | number;
}

const TrainModeUI: React.FC<TrainModeUIProps> = ({ projectId, slides: initialSlides, onExit }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('practice');
  const [projectTitle, setProjectTitle] = useState('Loading...');
  const [slides, setSlides] = useState<Slide[]>(initialSlides ?? []);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  // Controls state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [generateFromContent, setGenerateFromContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  
  // Editor State (Avatar Mode)
  const [scenarioInput, setScenarioInput] = useState({ 
    question: '', 
    expectedAnswer: '',
    reactionType: 'text' as 'text' | 'slide' | 'video',
    reactionData: '',
    isTest: false,
    testOptions: ['', '', ''],
    correctOptionIndex: 0
  });
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // Session Config
  const [sessionConfig, setSessionConfig] = useState({
    listenerName: 'John Doe',
    language: 'English',
    coachRole: 'Buyer'
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Player State (Practice Mode)
  const [chatMessage, setChatMessage] = useState('');
  const [attachSlide, setAttachSlide] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dialogMode, setDialogMode] = useState<'questioning' | 'answering'>('answering'); // listener usually answers

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
  const activeSlideText = activeSlide.text || '';

  // Parse slide-level triggers (MediaData Triggers MVP)
  const [slideTriggers, setSlideTriggers] = useState<any[]>([]);
  useEffect(() => {
    if (activeSlide?.metadata?.triggers && Array.isArray(activeSlide.metadata.triggers)) {
      setSlideTriggers(activeSlide.metadata.triggers);
      // Execute auto-triggers
      activeSlide.metadata.triggers.forEach((trigger: any) => {
        if (trigger.type === 'alert' && trigger.delay) {
          setTimeout(() => showToast(trigger.message || 'Trigger fired!'), trigger.delay);
        }
      });
    } else {
      setSlideTriggers([]);
    }
  }, [activeSlideIndex, activeSlide]);

  // Generate question from content
  const handleGenerateQuestionToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setGenerateFromContent(checked);
    
    if (checked) {
      setIsGeneratingQuestion(true);
      try {
        const res = await fetch('/api/coach/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            roleTemplate: 'buyer',
            questionTypes: ['product', 'objection']
          })
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const q = data.questions[0];
          setScenarioInput(prev => ({
            ...prev,
            question: q.questionText,
            expectedAnswer: q.expectedAnswer
          }));
          
          setMessages([
            { id: Date.now().toString(), role: 'user', text: `[MODE: Avatar generates questions from content]\n${q.questionText}`, type: 'regular' }
          ]);
        }
      } catch (err) {
        showToast('Failed to generate question');
      } finally {
        setIsGeneratingQuestion(false);
      }
    } else {
      setScenarioInput(prev => ({ ...prev, question: '', expectedAnswer: '' }));
      setMessages([]);
    }
  };

  // Handle user sending a message (Practice mode)
  const handleSendMessage = async (messageText?: string, isInitiation: boolean = false) => {
    const text = (messageText ?? chatMessage).trim();
    if (!text && !isInitiation) return;
    if (mode !== 'practice') return;

    if (!isInitiation) {
      const newMessage: Message = { id: Date.now().toString(), role: 'user', text };
      setMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
    
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slideId: activeSlide.id,
          userMessage: isInitiation ? "START_PRACTICE_SIMULATION" : (attachSlide ? `[Slide ${activeSlide.id} Attached] ${text}` : text),
          contextMode: 'strict',
          listenerName: sessionConfig.listenerName,
          language: sessionConfig.language,
          coachRole: sessionConfig.coachRole,
          isInitiation
        })
      });
      const data = await res.json();
      
        // so that the UI can render the dynamic test.
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'avatar',
          text: data.avatarResponse || 'Let me review that. Could you elaborate?',
          type: 'evaluation',
          testOptions: data.testOptions,
          reactionType: data.reactionType,
          reactionData: data.reactionData,
          expectedAnswer: data.expectedAnswer,
          expectedSlideId: data.expectedSlideId
        }]);
        
        // Mock save to analytics
        fetch('/api/coach/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            score: data.score || 0,
            feedback: data.feedback || '',
            isCorrect: data.isCorrect || false
          })
        }).catch(err => console.error('Failed to save analytics', err));
      
      // If the avatar responds with a slide change reaction, switch the active slide
      if (data.reactionType === 'slide' && data.reactionData) {
        const byId = slides.findIndex(s => String(s.id) === String(data.reactionData));
        if (byId >= 0) {
          setActiveSlideIndex(byId);
        } else {
          const n = parseInt(String(data.reactionData), 10);
          if (!isNaN(n) && slides.length > 0) {
            setActiveSlideIndex(Math.max(0, Math.min(slides.length - 1, n - 1)));
          }
        }
        showToast(`Avatar switched to slide ${data.reactionData}`);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Sorry, I am having trouble connecting to the evaluation engine right now.',
        type: 'regular'
      }]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveScenario = async () => {
    if (!scenarioInput.question.trim()) {
      showToast('Please enter a question to train the model.');
      return;
    }

    try {
      const payload = {
        projectId,
        questionText: scenarioInput.question,
        expectedAnswer: scenarioInput.expectedAnswer,
        expectedSlideId: activeSlide.id,
        saveTarget: 'scenario',
        reactionType: scenarioInput.reactionType,
        reactionData: scenarioInput.reactionData,
        isTest: scenarioInput.isTest,
        testOptions: scenarioInput.isTest ? scenarioInput.testOptions : undefined,
        correctOptionIndex: scenarioInput.isTest ? scenarioInput.correctOptionIndex : undefined
      };

      const res = await fetch('/api/coach/save-to-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save training data');
      
      showToast('Training scenario saved successfully!');
      setScenarioInput({ 
        question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', 
        isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 
      });
      setMessages([]);
    } catch (err) {
      showToast('Error saving training scenario.');
    }
  };

  const handleAction = async (actionName: string, messageText?: string) => {
    if (actionName === 'Q&A saved to Knowledge Base' || actionName === 'Added as Instruction') {
      try {
        const res = await fetch('/api/coach/save-to-rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            questionText: 'Learned from conversation context',
            expectedAnswer: messageText || 'Auto-saved interaction',
            expectedSlideId: activeSlide.id,
            saveTarget: actionName.includes('Knowledge') ? 'rag' : 'scenario'
          })
        });
        if (!res.ok) throw new Error('Save failed');
        showToast(actionName);
      } catch (err) {
        showToast(`Failed: ${actionName}`);
      }
    } else {
      showToast(`${actionName} triggered!`);
    }
  };

  // Determine active test options
  const lastMessage = messages[messages.length - 1];
  const activeTestOptions = (mode === 'practice' && lastMessage?.testOptions) ? lastMessage.testOptions : null;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => (onExit ? onExit() : router.back())} aria-label="Exit Train Mode">
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
              <div className={styles.switch}>
                <input type="checkbox" checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} aria-label="Enable voice" />
                <span className={styles.slider}></span>
              </div>
              Voice
            </label>
            <label className={styles.checkboxLabel}>
              <div className={styles.switch}>
                <input type="checkbox" checked={videoEnabled} onChange={e => setVideoEnabled(e.target.checked)} aria-label="Enable video" />
                <span className={styles.slider}></span>
              </div>
              Video
            </label>
          </div>
          
          <div className={styles.actions}>
            <button className={styles.btnOutline} onClick={() => setShowConfigModal(true)}><Zap size={16} /> Session Settings</button>
            <button className={styles.btnOutline} onClick={handleSaveScenario}><Plus size={16} /> Add Q&A</button>
            <button className={styles.btnOutline} onClick={() => setScenarioInput({ 
              question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', 
              isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 
            })}><X size={16} /> Discard</button>
            <button className={styles.btnSolid} onClick={handleSaveScenario}>Save</button>
          </div>
        </div>
      </div>

      {/* MODE TOGGLE BAR */}
      <div className={styles.modeBar}>
        <div className={styles.modeToggle}>
          <span>Mode:</span>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${mode === 'practice' ? styles.active : ''}`}
              onClick={() => { setMode('practice'); setMessages([]); }}
              aria-pressed={mode === 'practice'}
            >
              Practice Mode
            </button>
            <button 
              className={`${styles.segmentBtn} ${mode === 'train' ? styles.active : ''}`}
              onClick={() => { setMode('train'); setMessages([]); setGenerateFromContent(false); setScenarioInput(prev => ({ ...prev, question:'', expectedAnswer:'' })); }}
              aria-pressed={mode === 'train'}
            >
              Train (Admin) Mode
            </button>
          </div>
          
          {mode === 'train' && (
            <label className={styles.generateToggle}>
              <div className={styles.switch}>
                <input type="checkbox" checked={generateFromContent} onChange={handleGenerateQuestionToggle} disabled={isGeneratingQuestion} />
                <span className={styles.slider}></span>
              </div>
              {isGeneratingQuestion ? 'Generating...' : 'Generate Question from content'}
            </label>
          )}
        </div>
        
        <div className={styles.subtext}>
          {mode === 'practice' 
            ? 'Avatar (Buyer) will ask questions or state objections. You (Seller) must answer correctly and choose the right slide.'
            : 'Teach the Avatar how to act as a Buyer, or provide expected correct answers for the Seller.'
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
            {slides.length === 0 ? (
              <div className={styles.slideEmpty}>
                <FileText size={40} strokeWidth={1.5} />
                <div>No slides loaded for this project yet.</div>
              </div>
            ) : (
              <>
                <div className={styles.slideHeadline}>Slide {activeSlide.id}</div>
                <div className={styles.slideSubheadline}>
                  {activeSlideText.substring(0, 150)}{activeSlideText.length > 150 ? '...' : ''}
                </div>
              </>
            )}
            <div className={styles.slideFooter}>pitch-avatar.com</div>
            
            {/* DYNAMIC TEST OVERLAY (Listener Mode Only) */}
              {activeTestOptions && (
                <div style={{ position: 'absolute', bottom: '40px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>Dynamic Test: {activeSlide?.title}...</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeTestOptions.map((opt, i) => (
                      <button 
                        key={i}
                        className={styles.btnOutline} 
                        style={{ color: 'white', borderColor: 'white', justifyContent: 'flex-start' }} 
                        onClick={() => handleSendMessage(opt)}
                        aria-label={`Answer option ${String.fromCharCode(65 + i)}: ${opt}`}
                      >
                        {String.fromCharCode(65 + i)}: {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* SLIDE LEVEL TRIGGERS RENDERING */}
              {slideTriggers.filter(t => t.type === 'show_test').map((t, idx) => (
                <div key={idx} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.9)', color: 'black', padding: '1rem', borderRadius: '8px', zIndex: 10 }}>
                  <strong>Pop Quiz!</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                    {(t.data || []).map((opt: string, i: number) => (
                      <button key={i} className={styles.btnOutline} style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }} onClick={() => handleSendMessage(opt)}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          
          <div className={styles.pagination} role="navigation" aria-label="Slides">
            <button className={styles.pageBtn} onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))} aria-label="Previous slide" disabled={activeSlideIndex === 0}>
              <ChevronLeft size={16} />
            </button>
            {slides.length > 0 ? slides.map((_, i) => (
              <button 
                key={i} 
                className={`${styles.pageBtn} ${i === activeSlideIndex ? styles.active : ''}`}
                onClick={() => setActiveSlideIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === activeSlideIndex ? 'true' : undefined}
              >
                {i + 1}
              </button>
            )) : <button className={`${styles.pageBtn} ${styles.active}`} aria-current="true" aria-label="Slide 1">1</button>}
            <button className={styles.pageBtn} onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))} aria-label="Next slide" disabled={slides.length === 0 || activeSlideIndex >= slides.length - 1}>
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
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className={styles.chatArea} role="log" aria-live="polite" aria-label="Conversation">

                
                {messages.length === 0 && mode === 'listener' && videoEnabled && (
                  <div className={styles.videoWidget}>
                    <div className={styles.videoLabel}><Video size={14} /> Video</div>
                    <div className={styles.robotAvatar}><Bot size={32} /></div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No photo</div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className={styles.chatMessage}>
                    <div className={styles.messageHeader}>
                      <Bot size={16} color="#0076ff" />
                      {mode === 'listener' ? 'You speak as Listener.' : 'You speak as Avatar.'}
                    </div>
                    <div className={styles.messageBody}>
                      {mode === 'listener' 
                        ? 'Ask questions — the avatar responds based on its role and content.'
                        : 'Avatar generates questions from content for the listener. You respond as the avatar would.'
                      }
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {msg.role === 'user' ? (
                      <div className={styles.userMessage} style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.text}
                      </div>
                    ) : (
                      <div className={styles.avatarResponseContainer}>
                        <div className={styles.avatarMessage} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />

                        {/* Multimedia reaction */}
                        {msg.reactionType === 'video' && msg.reactionData && (
                          <div className={styles.reactionMedia}>
                            {isEmbeddableVideo(msg.reactionData) ? (
                              <iframe
                                className={styles.reactionVideo}
                                src={toEmbedUrl(msg.reactionData)}
                                title="Avatar video reaction"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video className={styles.reactionVideo} src={msg.reactionData} controls aria-label="Avatar video reaction" />
                            )}
                          </div>
                        )}
                        {msg.reactionType === 'slide' && msg.reactionData && (
                          <div className={styles.reactionSlideNote}>
                            <FileText size={13} /> Switched to slide {msg.reactionData}
                          </div>
                        )}

                        {/* Action Buttons Row */}
                        <div className={styles.messageActions}>
                          <button className={styles.actionBtn} onClick={() => handleAction('Confirm')}>
                            <Check size={14} /> Confirm
                          </button>
                          <button className={styles.actionBtn} onClick={() => handleAction('Reject & Edit')}>
                            <X size={14} /> Reject & Edit
                          </button>
                          <button className={styles.actionBtn} onClick={() => handleAction('Q&A saved to Knowledge Base', msg.text)}>
                            <Database size={14} /> Q&A → KB
                          </button>
                          <button className={styles.actionBtn} onClick={() => handleAction('Added as Instruction', msg.text)}>
                            <FileText size={14} /> Add as Instruction
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
                    )}
                  </div>
                ))}
                {isEvaluating && (
                  <div className={styles.avatarResponseContainer}>
                    <div className={styles.avatarMessage} aria-label="Avatar is typing">
                      <span className={styles.typingDots}><span></span><span></span><span></span></span>
                    </div>
                  </div>
                )}

                  {/* Render Message Actions only in Train Mode */}
                  {mode === 'train' && (
                  <div className={styles.editorForm}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className={styles.formLabel}>Question (From Listener)</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        <input type="checkbox" checked={scenarioInput.isTest} onChange={e => setScenarioInput({...scenarioInput, isTest: e.target.checked})} />
                        Is Test / Quiz
                      </label>
                    </div>
                    <textarea 
                      className={styles.formTextarea} 
                      placeholder="e.g., What is the ROI?"
                      value={scenarioInput.question}
                      onChange={e => setScenarioInput({...scenarioInput, question: e.target.value})}
                    />

                    {scenarioInput.isTest ? (
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        <label className={styles.formLabel}>Test Options</label>
                        {scenarioInput.testOptions.map((opt, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input 
                              type="radio" 
                              name="correctOption" 
                              checked={scenarioInput.correctOptionIndex === i} 
                              onChange={() => setScenarioInput({...scenarioInput, correctOptionIndex: i})}
                            />
                            <input 
                              type="text" 
                              className={styles.inputField} 
                              placeholder={`Option ${i+1}`}
                              value={opt}
                              onChange={e => {
                                const newOpts = [...scenarioInput.testOptions];
                                newOpts[i] = e.target.value;
                                setScenarioInput({...scenarioInput, testOptions: newOpts});
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <label className={styles.formLabel}>
                          Your Expected Answer
                          <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '0.5rem', fontWeight: 'normal' }}>
                            (Use {'{var}'} to create parameter templates)
                          </span>
                        </label>
                        <textarea 
                          className={styles.formTextarea} 
                          placeholder="e.g., The ROI is {roi_percentage}%."
                          value={scenarioInput.expectedAnswer}
                          onChange={e => setScenarioInput({...scenarioInput, expectedAnswer: e.target.value})}
                        />
                        {extractTemplateVariables(scenarioInput.expectedAnswer).length > 0 && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ opacity: 0.8 }}>Detected parameters:</span>
                            {extractTemplateVariables(scenarioInput.expectedAnswer).map(v => (
                              <span key={v} style={{ background: 'rgba(16,185,129,0.1)', padding: '0 0.4rem', borderRadius: '4px' }}>{v}</span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label className={styles.formLabel}>Reaction Type</label>
                        <select 
                          className={styles.inputField} 
                          value={scenarioInput.reactionType}
                          onChange={e => setScenarioInput({...scenarioInput, reactionType: e.target.value as any})}
                        >
                          <option value="text">Text Response</option>
                          <option value="slide">Show Slide</option>
                          <option value="video">Play Video</option>
                        </select>
                      </div>
                      {(scenarioInput.reactionType === 'slide' || scenarioInput.reactionType === 'video') && (
                        <div style={{ flex: 1 }}>
                          <label className={styles.formLabel}>{scenarioInput.reactionType === 'slide' ? 'Slide ID' : 'Video URL'}</label>
                          <input 
                            type="text" 
                            className={styles.inputField} 
                            placeholder={scenarioInput.reactionType === 'slide' ? "e.g., 2" : "e.g., https://..."}
                            value={scenarioInput.reactionData}
                            onChange={e => setScenarioInput({...scenarioInput, reactionData: e.target.value})}
                          />
                        </div>
                      )}
                    </div>

                    <div className={styles.editorActions}>
                      <button type="button" className={styles.btnOutline} onClick={() => setScenarioInput({ question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 })}>
                        <X size={16} /> Discard
                      </button>
                      <button type="button" className={styles.btnSolid} onClick={handleSaveScenario}>
                        <Plus size={16} /> Save Q&amp;A
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Box Row */}
              {mode === 'practice' && (
                <div className={styles.inputArea} style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  {messages.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                      <button 
                        className={styles.btnSolid} 
                        style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                        onClick={() => handleSendMessage(undefined, true)}
                        disabled={isEvaluating}
                      >
                        Start Practice Simulation
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                          <input 
                            type="checkbox" 
                            checked={attachSlide} 
                            onChange={e => setAttachSlide(e.target.checked)} 
                            aria-label="Attach current slide"
                          />
                          Attach current slide (Slide {activeSlide.id})
                        </label>
                      </div>

                      <div className={styles.inputBox}>
                        {voiceEnabled && (
                          <button
                            type="button"
                            className={styles.micBtn}
                            aria-label="Voice input"
                            title="Voice input"
                            onClick={() => showToast('Voice input is coming soon')}
                          >
                            <Mic size={16} />
                          </button>
                        )}
                        <input 
                          type="text" 
                          className={styles.inputField} 
                          placeholder={dialogMode === 'answering' ? "Type a message..." : "Ask the buyer..."} 
                          value={chatMessage}
                          onChange={e => setChatMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                          className={styles.sendBtn} 
                          style={{ background: chatMessage ? '#0076ff' : '#94a3b8' }}
                          onClick={() => handleSendMessage()}
                          aria-label="Send message"
                          disabled={isEvaluating}
                        >
                          <ArrowUp size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.chatArea}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
                Knowledge base settings and files would appear here.
              </p>
            </div>
          )}
        </div>
      </div>
      {showConfigModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
            <h2 style={{ color: 'white', marginTop: 0, marginBottom: '1.5rem' }}>Session Settings</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label className={styles.formLabel}>Listener Name</label>
              <input 
                type="text" 
                className={styles.inputField} 
                value={sessionConfig.listenerName}
                onChange={e => setSessionConfig({...sessionConfig, listenerName: e.target.value})}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className={styles.formLabel}>Language</label>
              <select 
                className={styles.inputField} 
                value={sessionConfig.language}
                onChange={e => setSessionConfig({...sessionConfig, language: e.target.value})}
              >
                <option value="English">English</option>
                <option value="Ukrainian">Ukrainian</option>
                <option value="Romanian">Romanian</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className={styles.formLabel}>Avatar Role (Coach)</label>
              <select 
                className={styles.inputField} 
                value={sessionConfig.coachRole}
                onChange={e => setSessionConfig({...sessionConfig, coachRole: e.target.value})}
              >
                <option value="Buyer">Buyer</option>
                <option value="Investor">Investor</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Manager">Manager</option>
                <option value="Technical">Technical Expert</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className={styles.btnSolid} onClick={() => setShowConfigModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainModeUI;
