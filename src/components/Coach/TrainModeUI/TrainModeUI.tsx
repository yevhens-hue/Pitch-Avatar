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

interface Message {
  id: string;
  role: 'user' | 'avatar';
  text: string;
  type?: 'evaluation' | 'regular';
  isGenerating?: boolean;
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
    language: 'English'
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Player State (Listener Mode)
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

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
          setScenarioInput({
            question: q.questionText,
            expectedAnswer: q.expectedAnswer
          });
          
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
      setScenarioInput({ question: '', expectedAnswer: '' });
      setMessages([]);
    }
  };

  // Handle user sending a message (Listener mode)
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || mode !== 'listener') return;
    
    const newMessage: Message = { id: Date.now().toString(), role: 'user', text: chatMessage };
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slideId: activeSlide.id,
          userMessage: newMessage.text,
          contextMode: 'strict',
          listenerName: sessionConfig.listenerName,
          language: sessionConfig.language
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: data.avatarResponse || 'Let me review that. Could you elaborate?',
        type: 'evaluation'
      }]);
      
      // If the avatar responds with a slide change reaction
      if (data.reactionType === 'slide' && data.reactionData) {
         // Optionally, we could change the active slide here, e.g. setActiveSlideIndex
         showToast(`Avatar changed presentation to slide ${data.reactionData}`);
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
              className={`${styles.segmentBtn} ${mode === 'listener' ? styles.active : ''}`}
              onClick={() => { setMode('listener'); setMessages([]); }}
            >
              You speak as Listener
            </button>
            <button 
              className={`${styles.segmentBtn} ${mode === 'avatar' ? styles.active : ''}`}
              onClick={() => { setMode('avatar'); setMessages([]); setGenerateFromContent(false); setScenarioInput({question:'', expectedAnswer:''}); }}
            >
              You speak as Avatar
            </button>
          </div>
          
          {mode === 'avatar' && (
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
            
            {/* Slide Test Overlay (simulated for demonstration) */}
            {mode === 'listener' && activeTab === 'chat' && (
              <div style={{ position: 'absolute', bottom: 40, left: 20, right: 20, background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.5rem' }}>Dynamic Test: {activeSlide.text.substring(0, 30)}...</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className={styles.btnOutline} style={{ color: 'white', borderColor: 'white', justifyContent: 'flex-start' }} onClick={() => { setChatMessage("Option A"); handleSendMessage(); }}>A: Option 1</button>
                  <button className={styles.btnOutline} style={{ color: 'white', borderColor: 'white', justifyContent: 'flex-start' }} onClick={() => { setChatMessage("Option B"); handleSendMessage(); }}>B: Option 2</button>
                  <button className={styles.btnOutline} style={{ color: 'white', borderColor: 'white', justifyContent: 'flex-start' }} onClick={() => { setChatMessage("Option C"); handleSendMessage(); }}>C: Option 3</button>
                </div>
              </div>
            )}
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
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className={styles.chatArea}>
                
                {messages.length === 0 && mode === 'listener' && (
                  <div className={styles.videoWidget}>
                    <div className={styles.videoLabel}><Video size={14} /> Video</div>
                    <div className={styles.robotAvatar}><Bot size={32} /></div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No photo</div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className={styles.chatMessage}>
                    <div className={styles.messageHeader}>
                      <Bot size={16} color="#3b82f6" />
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
                    <div className={styles.avatarMessage}><i>Thinking...</i></div>
                  </div>
                )}

                {/* Specific tools based on mode */}
                {mode === 'avatar' && (
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
                        <label className={styles.formLabel}>Your Expected Answer</label>
                        <textarea 
                          className={styles.formTextarea} 
                          placeholder="e.g., The ROI is 200% within the first year."
                          value={scenarioInput.expectedAnswer}
                          onChange={e => setScenarioInput({...scenarioInput, expectedAnswer: e.target.value})}
                        />
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
                  </div>
                )}
              </div>

              {/* Input Box Row */}
              {mode === 'listener' && (
                <div className={styles.inputArea}>
                  <div className={styles.inputBox}>
                    <input 
                      type="text" 
                      className={styles.inputField} 
                      placeholder="Напишите сообщение..." 
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      className={styles.sendBtn} 
                      style={{ background: chatMessage ? '#3b82f6' : '#94a3b8' }}
                      onClick={handleSendMessage}
                    >
                      <ArrowUp size={16} />
                    </button>
                  </div>
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
