'use client'

import React, { useState, useEffect } from 'react';
import styles from './TrainModeUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, Bot, Video, ArrowUp, ThumbsUp, ThumbsDown, Database, Zap, ChevronsUpDown, Mic, Check, FileText, CheckSquare } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getProjectById } from '@/app/actions/projects';
import { supabase } from '@/lib/supabase';
import { ROLE_TEMPLATES } from '@/types/coach';

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
  isCorrect?: boolean;
  revealAnswer?: boolean;
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
    targetSlideId: 'current' as 'current' | 'any' | 'none',
    isTest: false,
    testOptions: ['', '', ''],
    correctOptionIndex: 0
  });
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<Array<{id: string; question_text: string; expected_answer: string; expected_slide_id?: string | number}>>([]);

  // Session Config
  const [sessionConfig, setSessionConfig] = useState({
    listenerName: 'John Doe',
    language: 'Russian',
    coachRole: 'buyer',
    questionOrder: 'sequential' as 'sequential' | 'random',
    questionLimit: 5,
    showScore: 'immediate' as 'immediate' | 'end' | 'never',
    showCorrectAnswer: 'immediate' as 'immediate' | 'end' | 'never'
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

  // Practice session question queue (admin-saved scenarios)
  const [scenarioQueue, setScenarioQueue] = useState<Array<{id: string; question_text: string; expected_answer: string; expected_slide_id?: string | number}>>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionScore, setSessionScore] = useState({ total: 0, correct: 0 });
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(p => {
        if (p) {
          setProjectTitle(p.title);
          if (p.slides) setSlides(p.slides);
        }
      });
      // Load saved scenarios for Knowledge Base tab
      supabase.from('buyer_scenarios').select('id, question_text, expected_answer, expected_slide_id').eq('project_id', projectId).order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setSavedScenarios(data); });
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
          headers: { "Content-Type": "application/json", ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },
          body: JSON.stringify({
            projectId,
            roleTemplate: sessionConfig.coachRole,
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

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Speech recognition not supported in this browser');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = sessionConfig.language === 'Russian' ? 'ru-RU' : sessionConfig.language === 'Ukrainian' ? 'uk-UA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      showToast('Listening...', 'success');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatMessage(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      showToast('Failed to recognize voice.', 'error');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Handle user sending a message (Practice mode)
  const handleSendMessage = async (messageText?: string, isInitiation: boolean = false) => {
    const text = (messageText ?? chatMessage).trim();
    if (!text && !isInitiation) return;
    if (mode !== 'practice') return;

    // On initiation — build the scenario queue from saved admin questions
    if (isInitiation) {
      setIsSessionActive(true);
      setIsEvaluating(true);
      try {
        // Load all saved scenarios for this project
        const { data: allScenarios } = await supabase
          .from('buyer_scenarios')
          .select('id, question_text, expected_answer, expected_slide_id')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        let queue = allScenarios && allScenarios.length > 0 ? allScenarios : [];
        
        if (sessionConfig.questionOrder === 'random') {
          queue = queue.sort(() => Math.random() - 0.5);
        }
        
        if (sessionConfig.questionLimit > 0) {
          queue = queue.slice(0, sessionConfig.questionLimit);
        }

        setScenarioQueue(queue);
        setCurrentScenarioIndex(0);
        setSessionScore({ total: queue.length, correct: 0 });

        if (queue.length > 0) {
          // Show first admin question directly — no API call needed
          const firstQ = queue[0];
          setMessages([{
            id: Date.now().toString(),
            role: 'avatar',
            text: firstQ.question_text,
            type: 'evaluation',
            expectedAnswer: firstQ.expected_answer,
            expectedSlideId: firstQ.expected_slide_id,
          }]);
        } else {
          // No saved scenarios — fall back to AI-generated question
          const res = await fetch('/api/coach/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              slideId: activeSlide.id,
              userMessage: 'START_PRACTICE_SIMULATION',
              contextMode: 'strict',
              listenerName: sessionConfig.listenerName,
              language: sessionConfig.language,
              coachRole: sessionConfig.coachRole,
              isInitiation: true,
            }),
          });
          const data = await res.json();
          setMessages([{
            id: Date.now().toString(),
            role: 'avatar',
            text: data.avatarResponse || "Let's begin. Tell me about your product.",
            type: 'evaluation',
            expectedAnswer: data.expectedAnswer,
            expectedSlideId: data.expectedSlideId,
            testOptions: data.testOptions,
            reactionType: data.reactionType,
            reactionData: data.reactionData,
          }]);
        }
      } catch (error) {
        setMessages([{
          id: Date.now().toString(),
          role: 'avatar',
          text: 'Sorry, I am having trouble starting the session.',
          type: 'regular',
        }]);
      } finally {
        setIsEvaluating(false);
      }
      return;
    }

    // Regular user answer
    const newMessage: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    setIsEvaluating(true);

    try {
      // Determine the current scenario for evaluation
      const currentScenario = scenarioQueue[currentScenarioIndex] ?? null;

      const res = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },
        body: JSON.stringify({
          projectId,
          slideId: currentScenario?.expected_slide_id ?? activeSlide.id,
          userMessage: attachSlide ? `[Slide ${activeSlide.id} Attached] ${text}` : text,
          contextMode: 'strict',
          listenerName: sessionConfig.listenerName,
          language: sessionConfig.language,
          coachRole: sessionConfig.coachRole,
          isInitiation: false,
        }),
      });
      const data = await res.json();

      // Add evaluation feedback
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: data.avatarResponse || 'Let me review that. Could you elaborate?',
        type: 'evaluation',
        testOptions: data.testOptions,
        reactionType: data.reactionType,
        reactionData: data.reactionData,
        expectedAnswer: data.expectedAnswer,
        expectedSlideId: data.expectedSlideId,
        isCorrect: sessionConfig.showScore === 'immediate' ? data.isCorrect : undefined,
        revealAnswer: sessionConfig.showCorrectAnswer === 'immediate'
      }]);

      // Save analytics
      fetch('/api/coach/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },
        body: JSON.stringify({
          projectId,
          score: data.score || 0,
          feedback: data.feedback || '',
          isCorrect: data.isCorrect || false,
          question: currentScenario?.question_text || '',
          expectedAnswer: currentScenario?.expected_answer || '',
          userAnswer: text,
        }),
      }).catch(err => console.error('Failed to save analytics', err));

      // React to slide change
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

      // Update Session Score
      if (data.isCorrect) {
        setSessionScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      }

      // ── Advance to next admin question after a short delay ──
      const nextIndex = currentScenarioIndex + 1;
      if (nextIndex < scenarioQueue.length) {
        setCurrentScenarioIndex(nextIndex);
        setTimeout(() => {
          const nextQ = scenarioQueue[nextIndex];
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'avatar',
            text: nextQ.question_text,
            type: 'evaluation',
            expectedAnswer: nextQ.expected_answer,
            expectedSlideId: nextQ.expected_slide_id,
          }]);
        }, 800);
      } else if (scenarioQueue.length > 0) {
        // All questions answered
        if (sessionConfig.showScore !== 'never') {
          setTimeout(() => {
            const finalScore = data.isCorrect ? sessionScore.correct + 1 : sessionScore.correct;
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: 'avatar',
              text: `✅ Тренировка завершена!\n\n**Ваш результат:** ${finalScore} из ${sessionScore.total} правильных ответов.`,
              type: 'regular',
            }]);
          }, 800);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: 'avatar',
              text: `✅ Тренировка завершена! Спасибо за участие.`,
              type: 'regular',
            }]);
          }, 800);
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Sorry, I am having trouble connecting to the evaluation engine right now.',
        type: 'regular',
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
      const session = (await supabase.auth.getSession()).data.session;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const payload = {
        projectId,
        questionText: scenarioInput.question,
        expectedAnswer: scenarioInput.expectedAnswer,
        expectedSlideId: scenarioInput.targetSlideId === 'current' ? activeSlide.id : (scenarioInput.targetSlideId === 'any' ? 'any' : null),
        saveTarget: 'scenario',
        reactionType: scenarioInput.reactionType,
        reactionData: scenarioInput.reactionData,
        isTest: scenarioInput.isTest,
        testOptions: scenarioInput.isTest ? scenarioInput.testOptions : undefined,
        correctOptionIndex: scenarioInput.isTest ? scenarioInput.correctOptionIndex : undefined,
        orderIndex: savedScenarios.length
      };

      const res = await fetch('/api/coach/save-to-rag', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        showToast(`Error ${res.status}: ${errBody?.error || 'Failed to save'}`, 'error');
        return;
      }
      
      showToast('Training scenario saved successfully!', 'success');
      // Add to local list immediately (optimistic update)
      setSavedScenarios(prev => [{ 
        id: Date.now().toString(), 
        question_text: scenarioInput.question, 
        expected_answer: scenarioInput.expectedAnswer,
        expected_slide_id: scenarioInput.targetSlideId === 'current' ? activeSlide.id : (scenarioInput.targetSlideId === 'any' ? 'any' : undefined)
      }, ...prev]);
      setScenarioInput({ 
        question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'current',
        isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 
      });
      setMessages([]);
    } catch (err) {
      console.error('Save scenario error:', err);
      showToast('Network error. Check console for details.', 'error');
    }
  };

  const handleAction = async (actionName: string, messageText?: string) => {
    if (actionName === 'Q&A saved to Knowledge Base' || actionName === 'Added as Instruction') {
      try {
        const res = await fetch('/api/coach/save-to-rag', {
          method: 'POST',
          headers: { "Content-Type": "application/json", ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },
          body: JSON.stringify({
            projectId,
            questionText: 'Learned from conversation context',
            expectedAnswer: messageText || 'Auto-saved interaction',
            expectedSlideId: activeSlide.id,
            saveTarget: actionName.includes('Storage') ? 'rag' : 'scenario'
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
            {mode === 'train' && (
              <>
                <button 
                  className={styles.btnOutline} 
                  onClick={() => window.open(`/play/${projectId}`, '_blank')}
                  title="Ссылка для испытуемого"
                >
                  🔗 Ссылка испытуемого
                </button>
                <button className={styles.btnOutline} onClick={() => setShowConfigModal(true)}><Zap size={16} /> Настройки</button>
                <button className={styles.btnOutline} onClick={() => setScenarioInput({ 
                  question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'any',
                  isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 
                })}><X size={16} /> Сбросить</button>
                <button className={styles.btnSolid} onClick={handleSaveScenario}><Plus size={16} /> Сохранить Q&A</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODE TOGGLE BAR */}
      <div className={styles.modeBar}>
        <div className={styles.modeToggle}>
          <span>Режим:</span>
          <div className={styles.segmentedControl}>
            <button 
              className={`${styles.segmentBtn} ${mode === 'practice' ? styles.active : ''}`}
              onClick={() => { setMode('practice'); setMessages([]); setIsSessionActive(false); }}
              aria-pressed={mode === 'practice'}
              title="Симуляция: тест с позиции испытуемого"
            >
              🎯 Предпросмотр сессии
            </button>
            <button 
              className={`${styles.segmentBtn} ${mode === 'train' ? styles.active : ''}`}
              onClick={() => { setMode('train'); setMessages([]); setIsSessionActive(false); setGenerateFromContent(false); setScenarioInput(prev => ({ ...prev, question:'', expectedAnswer:'' })); }}
              aria-pressed={mode === 'train'}
              title="Настройка вопросов и поведения аватара"
            >
              ⚙️ Настройка (Тренер)
            </button>
          </div>
          
          {mode === 'train' && (
            <label className={styles.generateToggle}>
              <div className={styles.switch}>
                <input type="checkbox" checked={generateFromContent} onChange={handleGenerateQuestionToggle} disabled={isGeneratingQuestion} />
                <span className={styles.slider}></span>
              </div>
              {isGeneratingQuestion ? 'Генерация...' : 'Сгенерировать вопрос из контента'}
            </label>
          )}
        </div>
        
        <div className={styles.subtext}>
          {mode === 'practice' 
            ? 'Предпросмотр: как видит сессию испытуемый. Аватар задаёт вопросы.'
            : 'Режим тренера: добавляйте вопросы, ожидаемые ответы и настраивайте поведение аватара.'
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

                
                {messages.length === 0 && mode === 'practice' && videoEnabled && (
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
                      {mode === 'practice' ? 'You speak as Listener.' : 'You speak as Avatar.'}
                    </div>
                    <div className={styles.messageBody}>
                      {mode === 'practice' 
                        ? 'Ask questions — the avatar responds based on its role and content.'
                        : 'Avatar generates questions from content for the listener. You respond as the avatar would.'
                      }
                    </div>
                  </div>
                )}

                {/* Practice mode: question progress indicator */}
                {mode === 'practice' && scenarioQueue.length > 0 && messages.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', margin: '0 0 0.5rem', background: 'rgba(0,118,255,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <CheckSquare size={13} color="#0076ff" />
                    Вопрос {Math.min(currentScenarioIndex + 1, scenarioQueue.length)} из {scenarioQueue.length}
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
                        {msg.type === 'evaluation' && (
                          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            {msg.isCorrect === true && <span style={{ color: '#22c55e' }}>🟢 Отлично</span>}
                            {msg.isCorrect === false && <span style={{ color: '#ef4444' }}>🔴 Нужно доработать</span>}
                            {!msg.isCorrect && msg.isCorrect !== false && <span style={{ color: '#3b82f6' }}>ℹ️ AI Coach Feedback</span>}
                          </div>
                        )}
                        <div className={styles.avatarMessage} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                        
                        {msg.type === 'evaluation' && msg.isCorrect === false && msg.expectedAnswer && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {!msg.revealAnswer ? (
                              <button 
                                onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, revealAnswer: true } : m))}
                                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', alignSelf: 'flex-start' }}
                              >
                                Show Correct Answer
                              </button>
                            ) : (
                              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                                <strong>Expected Answer:</strong><br />
                                {msg.expectedAnswer}
                              </div>
                            )}
                          </div>
                        )}

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

                        {mode === 'train' && (
                          <>
                            {/* Action Buttons Row */}
                            <div className={styles.messageActions}>
                              <button className={styles.actionBtn} onClick={() => handleAction('Confirm')}>
                                <Check size={14} /> Confirm
                              </button>
                              <button className={styles.actionBtn} onClick={() => handleAction('Reject & Edit')}>
                                <X size={14} /> Reject & Edit
                              </button>
                              <button className={styles.actionBtn} onClick={() => handleAction('Q&A saved to Storage', msg.text)}>
                                <Database size={14} /> Q&A → Storage
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
                          </>
                        )}
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
                      <label className={styles.formLabel}>Вопрос от аватара к испытуемому</label>
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
                        <label className={styles.formLabel}>Правильный ответ (для оценки испытуемого)</label>
                        <textarea 
                          className={styles.formTextarea} 
                          placeholder="Что испытуемый должен ответить..."
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

                    <div style={{ marginBottom: '1rem' }}>
                      <label className={styles.formLabel}>Привязка к слайду (необязательно)</label>
                      <select 
                        className={styles.inputField} 
                        style={{ appearance: 'auto', paddingRight: '2rem' }}
                        value={scenarioInput.targetSlideId}
                        onChange={e => setScenarioInput({...scenarioInput, targetSlideId: e.target.value as 'current' | 'any' | 'none'})}
                      >
                        <option value="any">Без привязки (любой слайд)</option>
                        <option value="current">Текущий слайд ({activeSlide.id})</option>
                        <option value="none">Только чат (нет слайда)</option>
                      </select>
                    </div>

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
                      <button type="button" className={styles.btnOutline} onClick={() => setScenarioInput({ question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'current', isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 })}>
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
                  
                  {!isSessionActive ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', margin: '2rem 0' }}>
                      {savedScenarios.length > 0 && (
                        <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckSquare size={14} color="#0076ff" />
                          {savedScenarios.length} вопросов от админа будут заданы по очереди
                        </div>
                      )}
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
                            onClick={handleVoiceInput}
                            style={{ color: isRecording ? '#ef4444' : 'currentColor' }}
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
                Storage settings and files would appear here.
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Listener Name</label>
              <input 
                type="text" 
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                value={sessionConfig.listenerName}
                onChange={e => setSessionConfig({...sessionConfig, listenerName: e.target.value})}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Язык сессии</label>
              <select 
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                value={sessionConfig.language}
                onChange={e => setSessionConfig({...sessionConfig, language: e.target.value})}
              >
                <option value="Russian">Русский</option>
                <option value="Ukrainian">Украинский</option>
                <option value="English">English</option>
                <option value="Romanian">Romanian</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Avatar Role (Coach)</label>
              <select 
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                value={sessionConfig.coachRole}
                onChange={e => setSessionConfig({...sessionConfig, coachRole: e.target.value})}
              >
                {ROLE_TEMPLATES.map(t => (
                  <option key={t.role} value={t.role}>{t.label} ({t.role})</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Question Order</label>
                <select 
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                  value={sessionConfig.questionOrder}
                  onChange={e => setSessionConfig({...sessionConfig, questionOrder: e.target.value as 'sequential' | 'random'})}
                >
                  <option value="sequential">Sequential</option>
                  <option value="random">Random</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Questions Limit</label>
                <input 
                  type="number"
                  min="0" 
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                  value={sessionConfig.questionLimit}
                  onChange={e => setSessionConfig({...sessionConfig, questionLimit: parseInt(e.target.value, 10) || 0})}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Show Score</label>
                <select 
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                  value={sessionConfig.showScore}
                  onChange={e => setSessionConfig({...sessionConfig, showScore: e.target.value as 'immediate' | 'end' | 'never'})}
                >
                  <option value="immediate">Immediately</option>
                  <option value="end">End of Session</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Show Correct Answer</label>
                <select 
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', outline: 'none', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.95rem' }}
                  value={sessionConfig.showCorrectAnswer}
                  onChange={e => setSessionConfig({...sessionConfig, showCorrectAnswer: e.target.value as 'immediate' | 'end' | 'never'})}
                >
                  <option value="immediate">Immediately</option>
                  <option value="end">End of Session</option>
                  <option value="never">Never</option>
                </select>
              </div>
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
