'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './PracticePlayerUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronDown, ThumbsUp, MessageSquare, Share2, Settings, Maximize, VolumeX, Volume2, Mic, User, CheckCircle, XCircle, Send, Bot, CheckSquare, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getProjectById } from '@/app/actions/projects';
import { Project } from '@/types/project';
import { useToast } from '@/components/ui/ToastProvider';

interface Slide {
  id: string | number;
  text?: string;
  title?: string;
  [key: string]: any;
}

interface Message {
  id: string;
  role: 'user' | 'avatar';
  text: string;
  isEval?: boolean;
  isCorrect?: boolean;
  expectedAnswer?: string;
  expectedSlideId?: string | number;
  revealAnswer?: boolean;
  evaluation?: any;
  timestamp: string;
  isFinalResult?: boolean;
  finalScore?: number;
  finalLogs?: SessionLog[];
}

interface ScenarioItem {
  id: string;
  question_text: string;
  expected_answer: string;
  expected_slide_id?: string | number;
  custom_actions?: any;
}

interface SessionLog {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  score?: number;
}

interface PracticePlayerUIProps {
  projectId: string;
}

const PracticePlayerUI: React.FC<PracticePlayerUIProps> = ({ projectId }) => {
  const router = useRouter();
  const { showToast } = useToast();

  // Project data
  const [projectTitle, setProjectTitle] = useState('Loading...');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const isSessionActiveRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [scenarioQueue, setScenarioQueue] = useState<ScenarioItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [settings, setSettings] = useState<any>({ maxQuestions: 5, questionDelivery: 'random', evaluationMode: 'strict' });
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (!isSessionActive || timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          clearInterval(interval);
          // Auto end session
          const totalScore = sessionLogs.reduce((acc, log) => acc + (log.score || 0), 0);
          const avgScore = sessionLogs.length > 0 ? Math.round(totalScore / sessionLogs.length) : 0;
          setFinalScore(avgScore);
          setMessages(m => [...m, {
            id: Date.now().toString(),
            role: 'avatar',
            text: 'Time is up! Training complete.',
            isEval: false,
            isFinalResult: true,
            finalScore: avgScore,
            finalLogs: sessionLogs,
            timestamp: formatTime()
          }]);
          setIsSessionActive(false);
          isSessionActiveRef.current = false;
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, timeRemaining, sessionLogs]);

  // Results
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US');
  };

  // Fetch author info if possible
  const [authorInfo, setAuthorInfo] = useState({ name: 'Project author', email: '' });

  // Load project data on mount
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const p = await getProjectById(projectId);
        if (p) {
          setProjectTitle(p.title);
          if (p.slides) setSlides(p.slides);

          const uid = (p as Project & { userId?: string }).userId;
          if (uid) {
            const { data } = await supabase.from('profiles').select('full_name, email').eq('id', uid).single();
            if (data) {
              setAuthorInfo({ name: data.full_name || 'Author', email: data.email || '' });
            }
          }
          
          // Fetch coach settings
          const { data: cSettings } = await supabase.from('coach_settings').select('*').eq('project_id', projectId).single();
          if (cSettings) {
            setSettings({
              maxQuestions: cSettings.max_questions || 5,
              questionDelivery: cSettings.question_delivery || 'random',
              evaluationMode: cSettings.evaluation_mode || 'strict',
              feedbackMode: cSettings.feedback_mode || 'immediate',
            });
          }
        }
      } catch {
        // ignore fetch errors
      }
    })();
  }, [projectId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeSlide = slides[activeSlideIndex];
  const hasSlides = slides.length > 0;
  const progressPercent = slides.length > 0 ? Math.round(((activeSlideIndex + 1) / slides.length) * 100) : 100;

  // ── Запуск сессии ──────────────────────────────────────────────────────────
  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      // Fetch project metadata to get the canonical coachScenarios list
      // (this is what the Coach Q&A panel shows, it's the source of truth)
      const { data: projectData } = await supabase
        .from('projects')
        .select('metadata')
        .eq('id', projectId)
        .single();

      const metaScenarios: Array<{ id: string; questionText?: string }> =
        (projectData?.metadata?.coachScenarios as Array<{ id: string; questionText?: string }> | undefined) || [];

      const coachSettings = (projectData?.metadata?.coachSettings as any) || {};
      const delivery: string = coachSettings.questionDelivery || settings?.questionDelivery || 'sequential';
      const limit: number = coachSettings.maxQuestions ?? settings?.maxQuestions ?? 0;

      const { data: allScenarios } = await supabase
        .from('buyer_scenarios')
        .select('id, question_text, expected_answer, expected_slide_id, custom_actions, order_index')
        .eq('project_id', projectId)
        .not('question_text', 'is', null)
        .not('question_text', 'eq', '')
        .not('question_text', 'eq', 'Question?');

      const rawQueue: ScenarioItem[] = allScenarios && allScenarios.length > 0 ? allScenarios : [];

      let queue: ScenarioItem[];

      if (metaScenarios.length > 0) {
        // Build queue respecting the items from metadata.coachScenarios
        // Match by id first, fallback to question_text (handles UUID regeneration)
        const ordered: ScenarioItem[] = [];
        const remaining = [...rawQueue];
        for (const meta of metaScenarios) {
          const mText = meta.questionText?.trim();
          const idx = remaining.findIndex(s =>
            s.id === meta.id || (mText && s.question_text?.trim() === mText)
          );
          if (idx !== -1) {
            ordered.push(remaining[idx]);
            remaining.splice(idx, 1);
          }
        }
        queue = ordered;
      } else {
        queue = [...rawQueue];
      }

      // Always sort by expected slide to synchronize questions with the presentation flow naturally
      queue = queue.sort((a, b) => {
        const slideIndexA = a.expected_slide_id === 'any' || !a.expected_slide_id ? 9999 : slides.findIndex(s => String(s.id) === String(a.expected_slide_id));
        const slideIndexB = b.expected_slide_id === 'any' || !b.expected_slide_id ? 9999 : slides.findIndex(s => String(s.id) === String(b.expected_slide_id));
        if (slideIndexA !== slideIndexB) return slideIndexA - slideIndexB;
        return ((a as any).order_index ?? 0) - ((b as any).order_index ?? 0);
      });

      if (delivery === 'random') {
        queue = queue.sort(() => Math.random() - 0.5);
      }
      
      if (limit > 0) {
        queue = queue.slice(0, limit);
      }

      setScenarioQueue(queue);
      setCurrentIndex(0);
      setSessionLogs([]);
      setMessages([]);
      setIsSessionActive(true);
      isSessionActiveRef.current = true;
      if (coachSettings?.sessionDurationLimit) {
        setTimeRemaining(coachSettings.sessionDurationLimit * 60);
      } else {
        setTimeRemaining(null);
      }

      if (queue.length > 0) {
        const first = queue[0];
        setMessages([{
          id: Date.now().toString(),
          role: 'avatar',
          text: first.question_text,
          isEval: true,
          expectedAnswer: first.expected_answer,
          timestamp: formatTime()
        }]);
        
        if (first.expected_slide_id && first.expected_slide_id !== 'any' && hasSlides) {
          const idx = slides.findIndex(s => String(s.id) === String(first.expected_slide_id));
          if (idx >= 0) setActiveSlideIndex(idx);
        }
      } else {
        const res = await fetch('/api/coach/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            slideId: activeSlide?.id,
            userMessage: 'START_PRACTICE_SIMULATION',
            isInitiation: true,
            language: 'English',
          }),
        });
        const data = await res.json();
        setMessages([{
          id: Date.now().toString(),
          role: 'avatar',
          text: data.avatarResponse || 'Hi! I am your AI assistant, ready to help.',
          isEval: true,
          timestamp: formatTime()
        }]);
      }
    } catch (err) {
      setMessages([{
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Connection error. Please try again.',
        timestamp: formatTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Отправка ответа ────────────────────────────────────────────────────────
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? chatInput).trim();
    
    // Если сессия еще не активна, и пользователь что-то пишет, стартуем ее автоматически
    if (!isSessionActiveRef.current) {
      setChatInput('');
      await handleStartSession();
      
      // Since handleStartSession sets isSessionActiveRef.current to true, we can now safely
      // process this message by manually calling the API or just waiting for the next render.
      // For simplicity, we just fetch directly here.
      if (text) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/coach/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId,
              slideId: activeSlide?.id,
              userMessage: text,
              isInitiation: false,
              language: 'English',
            }),
          });
          const data = await res.json();
          setMessages(prev => [
            ...prev,
            { 
              id: Date.now().toString(), 
              role: 'user', 
              text, 
              timestamp: formatTime(),
              isEval: settings.feedbackMode !== 'end',
              isCorrect: data.isCorrect,
              evaluation: data.evaluation,
              expectedAnswer: scenarioQueue[currentIndex]?.expected_answer,
              expectedSlideId: scenarioQueue[currentIndex]?.expected_slide_id
            },
            {
              id: (Date.now() + 1).toString(),
              role: 'avatar',
              text: data.avatarResponse || 'Understood.',
              timestamp: formatTime()
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    if (!text || isLoading) return;

    setChatInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: formatTime() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsLoading(true);

    try {
      const currentScenario = scenarioQueue[currentIndex] ?? null;

      const res = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          slideId: currentScenario?.expected_slide_id ?? activeSlide?.id,
          userMessage: text,
          isInitiation: false,
          language: 'English',
          activeScenarioId: currentScenario?.id,
        }),
      });
      const data = await res.json();

      const avatarMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'avatar',
        text: data.avatarResponse || 'Understood. Next question.',
        isEval: !!currentScenario,
        isCorrect: data.isCorrect,
        expectedAnswer: currentScenario?.expected_answer,
        expectedSlideId: currentScenario?.expected_slide_id,
        evaluation: data.evaluation,
        timestamp: formatTime()
      };

      setMessages(prev => [...prev, avatarMsg]);

      setMessages(prev => prev.map(m => m.id === userMsg.id ? {
        ...m,
        isEval: settings.feedbackMode !== 'end',
        isCorrect: data.isCorrect,
        evaluation: data.evaluation,
        expectedAnswer: currentScenario?.expected_answer,
        expectedSlideId: currentScenario?.expected_slide_id
      } : m));

      const newLog: SessionLog = {
        question: currentScenario?.question_text || '',
        userAnswer: text,
        isCorrect: data.isCorrect ?? false,
        score: data.score ?? (data.isCorrect ? 100 : 0),
      };
      const updatedLogs = [...sessionLogs, newLog];
      setSessionLogs(updatedLogs);

      // Analytics
      fetch('/api/coach/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          score: data.score || 0,
          isCorrect: data.isCorrect || false,
          feedback: data.feedback || '',
          question: currentScenario?.question_text || '',
          expectedAnswer: currentScenario?.expected_answer || '',
          userAnswer: text,
        }),
      }).catch(() => {});

      // Next вопрос
      const nextIndex = currentIndex + 1;
      if (nextIndex < scenarioQueue.length) {
        setCurrentIndex(nextIndex);
        const nextQ = scenarioQueue[nextIndex];
        
        if (nextQ.expected_slide_id && nextQ.expected_slide_id !== 'any' && hasSlides) {
          const idx = slides.findIndex(s => String(s.id) === String(nextQ.expected_slide_id));
          if (idx >= 0) setActiveSlideIndex(idx);
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'avatar',
            text: nextQ.question_text,
            isEval: true,
            expectedAnswer: nextQ.expected_answer,
            timestamp: formatTime()
          }]);
        }, 1500);
      } else if (scenarioQueue.length > 0) {
        // Финал
        const totalScore = updatedLogs.reduce((acc, log) => acc + (log.score || 0), 0);
        const avgScore = updatedLogs.length > 0 ? Math.round(totalScore / updatedLogs.length) : 0;
        setFinalScore(avgScore);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 3).toString(),
            role: 'avatar',
            text: 'Training complete!',
            isEval: false,
            isFinalResult: true,
            finalScore: avgScore,
            finalLogs: updatedLogs,
            timestamp: formatTime()
          }]);
        }, 2000);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Error processing response. Please try again.',
        timestamp: formatTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Voice input ─────────────────────────────────────────────────────────
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setChatInput(prev => prev ? `${prev} ${t}` : t);
      // Авто-отправка после распознавания
      setTimeout(() => handleSend(t), 300);
    };
    recognition.onerror = () => setIsRecording(false);
    
    if (isRecording) recognition.stop();
    else recognition.start();
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) setActiveSlideIndex(activeSlideIndex + 1);
  };

  const handleRestart = () => {
    setShowResults(false);
    setIsSessionActive(false);
    isSessionActiveRef.current = false;
    setMessages([]);
    setScenarioQueue([]);
    setCurrentIndex(0);
    setSessionLogs([]);
    setActiveSlideIndex(0);
    setFinalScore(0);
    handleStartSession();
  };

  const handleCloseResults = () => {
    setIsSessionActive(false);
    setShowResults(false);
    setCurrentIndex(0);
    setMessages([]);
    setFinalScore(0);
    setSessionLogs([]);
  };

  // ─────────────────────────────────── RENDER ───────────────────────────────
  const isLastSlide = slides.length === 0 || activeSlideIndex === slides.length - 1;

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span>P</span>itch <span>Avatar</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <select className={styles.langSelect}>
            <option>English</option>
            <option>Russian</option>
          </select>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className={styles.workspace}>
        
        {/* LEFT PANEL: Slide & Author */}
        <div className={styles.leftPanel}>
          <div className={styles.playerContainer}>
            <div className={styles.slidePreview}>
               {(activeSlide?.image_url || activeSlide?.thumbnailUrl) ? (
                  <img src={activeSlide.image_url || activeSlide.thumbnailUrl} alt={activeSlide.title || "Slide"} className={styles.slideImage} />
               ) : (
                  <>
                     <div className={styles.slideTitle}>{activeSlide?.title || projectTitle}</div>
                     <div className={styles.slideHeadline}>{activeSlide?.text || "No text on slide"}</div>
                  </>
               )}
            </div>
            
            <div className={styles.playerControlsArea}>
               <div className={styles.segmentedProgressBar}>
                 {slides.map((s, idx) => (
                   <div 
                     key={s.id || idx} 
                     className={idx <= activeSlideIndex ? styles.progressSegmentActive : styles.progressSegment}
                   />
                 ))}
               </div>
               <div className={styles.playerControls}>
                 <div className={styles.playerControlsLeft}>
                   <button className={styles.playerControlBtn} onClick={handlePrevSlide} disabled={activeSlideIndex === 0} aria-label="Previous Slide"><ChevronLeft size={18} /></button>
                   <button className={styles.playerControlBtn} aria-label="Play"><Play size={18} /></button>
                   <button className={styles.playerControlBtn} onClick={handleNextSlide} disabled={isLastSlide} aria-label="Next Slide"><ChevronRight size={18} /></button>
                   <span className={styles.playerTime}>00:00/01:20</span>
                 </div>
                 <div className={styles.playerControlsRight}>
                   <button className={styles.playerControlBtn} onClick={() => showToast('Presentation settings', 'info')} aria-label="Settings">
                     <Settings size={18} />
                   </button>
                   <button className={styles.playerControlBtn} onClick={() => showToast('Fullscreen mode', 'info')} aria-label="Fullscreen">
                     <Maximize size={18} />
                   </button>
                 </div>
               </div>
            </div>
          </div>

          <div className={styles.authorFooter}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}><User size={20} /></div>
              <div className={styles.authorDetails}>
                <div className={styles.authorName}>{authorInfo.name}</div>
                {authorInfo.email && <div className={styles.authorEmail}>{authorInfo.email}</div>}
              </div>
            </div>
            <div className={styles.footerActions}>
              <button className={styles.iconBtn} aria-label="Like" onClick={() => showToast('Like sent!', 'success')}><ThumbsUp size={16} /></button>
              <button className={styles.iconBtn} aria-label="Comment" onClick={() => showToast('Comment form', 'info')}><MessageSquare size={16} /></button>
              <button className={styles.iconBtn} aria-label="Share" onClick={() => showToast('Link copied', 'success')}><Share2 size={16} /></button>
              <button className={styles.callPresenterBtn} onClick={() => showToast('Presenter notified!', 'success')}>Call presenter</button>
              <button className={styles.slidesDropdown} onClick={() => showToast('Slides list (in development)', 'info')}>Slides <ChevronDown size={14}/></button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Video & Chat */}
        <div className={styles.rightPanel}>
          
          <div className={styles.videoWidget}>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" alt="Avatar" className={styles.videoImg} />
            <button className={styles.muteIcon} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className={styles.imStatus}>IM</div>
            <div className={styles.videoLabel}>Chat Avatar [{formatDate()}]</div>
          </div>

          <div className={styles.chatArea}>
            {isSessionActive && messages.length > 0 && (
              <div className={styles.chatSessionHeader}>
                <span className={styles.chatSessionTitle}>Тренування · Question {currentIndex + 1}/{settings.maxQuestions || 12}</span>
                <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {timeRemaining !== null && (
                    <span className={styles.scorePill} style={{ color: timeRemaining < 60 ? '#ef4444' : 'inherit' }}>
                       ⏱ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  <span className={styles.scorePill}>4/5 · 80% <span className={styles.scorePillBadge}>NEW</span></span>
                </span>
              </div>
            )}
            {!isSessionActive && messages.length === 0 ? (
               <div className={styles.introCard}>
                  <div className={styles.introIcon}><Bot size={36} /></div>
                  <h3 className={styles.introTitle}>
                    {isLastSlide ? 'Ready for practice?' : 'Presentation Mode'}
                  </h3>
                  <p className={styles.introDesc}>
                    {isLastSlide 
                      ? 'The avatar will ask questions sequentially — answer as accurately as possible. After answering, you will receive feedback from the AI coach.' 
                      : 'Review the slides. On the last slide, you will be able to start practice with the AI coach.'}
                  </p>
                  
                  {isLastSlide && (
                    <button
                      className={styles.introStart}
                      onClick={handleStartSession}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Starting...' : 'Start practice'}
                    </button>
                  )}
               </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={msg.id} className={styles.chatBubbleWrap} style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div className={styles.chatHeader}>
                      {msg.role === 'avatar' ? `Chat Avatar [${formatDate()}]` : 'You'}
                      <span style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>{msg.timestamp}</span>
                    </div>
                    
                    <div className={msg.role === 'user' ? styles.userBubbleWrap : styles.avatarBubbleWrap}>
                      <div className={msg.role === 'user' ? styles.userBubble : styles.avatarBubble}>
                        <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                      </div>
                      
                      {msg.role === 'user' && msg.isEval && (msg.evaluation || msg.isCorrect !== undefined) && (
                        <div className={`${styles.evalBox} ${msg.isCorrect === true ? styles.evalBoxCorrect : msg.isCorrect === false ? styles.evalBoxWrong : styles.evalBoxPartial}`}>
                          {msg.evaluation ? (
                            <>
                              <div className={styles.evalStatusText}>
                                {msg.evaluation.result === 'Correct' ? 'Відмінно' : 
                                 msg.evaluation.result === 'Partially Correct' ? 'Майже' : 'Помилка'}
                                {' '}{msg.evaluation.score ? `(${msg.evaluation.score}/100)` : ''}
                              </div>
                              <div className={styles.evalFeedbackText}>
                                <b>Правильна відповідь:</b> {msg.expectedAnswer || msg.evaluation.feedback || 'Точна відповідь відсутня'}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className={styles.evalStatusText}>
                                {msg.isCorrect ? 'Correct' : 'Error'}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                       
                       {msg.role === 'user' && msg.isEval && msg.isCorrect === false && msg.expectedAnswer && !msg.evaluation && (
                         msg.revealAnswer ? (
                           <div className={styles.expectedAnswer}>{msg.expectedAnswer}</div>
                         ) : (
                           <div>
                              <button className={styles.revealAnswerBtn} onClick={() => {
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, revealAnswer: true } : m));
                                if (msg.expectedSlideId && msg.expectedSlideId !== 'any' && hasSlides) {
                                  const idx = slides.findIndex(s => String(s.id) === String(msg.expectedSlideId));
                                  if (idx >= 0) setActiveSlideIndex(idx);
                                }
                              }}>
                                 Show answer
                              </button>
                           </div>
                         )
                       )}
                         
                         {msg.isFinalResult && msg.finalLogs && (
                            <div className={styles.evalBox} style={{ backgroundColor: '#f0f4ff', borderColor: '#d0e0ff', marginTop: 12 }}>
                              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0055ff', textAlign: 'center', marginBottom: 16 }}>
                                {msg.finalScore}% Average Score
                              </div>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>Question Breakdown:</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {msg.finalLogs.map((log, lidx) => (
                                  <div key={lidx} className={`${styles.resultLogItem} ${log.isCorrect ? styles.correct : styles.incorrect}`} style={{ padding: 12, borderRadius: 8, backgroundColor: 'white', borderLeft: `4px solid ${log.isCorrect ? '#22c55e' : '#ef4444'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', wordBreak: 'break-word' }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Q: {log.question}</div>
                                    <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>Your Answer: <span style={{ color: '#333' }}>{log.userAnswer}</span></div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: log.isCorrect ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      {log.isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                      {log.isCorrect ? 'Correct' : 'Error'}
                                      <span style={{ marginLeft: 4, opacity: 0.7 }}>({log.score}%)</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button 
                                className={styles.retryBtn} 
                                onClick={handleRestart}
                                style={{ marginTop: 20, width: '100%' }}
                              >
                                Try Again
                              </button>
                            </div>
                         )}
                      </div>
                    </div>
                ))}
                
                {isLoading && (
                   <div className={styles.chatBubbleWrap} style={{ alignItems: 'flex-start' }}>
                      <div className={styles.chatHeader}>Chat Avatar [{formatDate()}]</div>
                      <div className={styles.avatarBubble}>
                         <span className={styles.typingDots}><span /><span /><span /></span>
                      </div>
                   </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          <div className={styles.inputArea}>
            <form className={styles.inputBox} onSubmit={(e) => { e.preventDefault(); handleSend(chatInput); }}>
              <input 
                type="text"
                className={styles.inputField} 
                placeholder={!isSessionActive ? "Start practice to chat..." : "Send a message..."}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isLoading || !isSessionActive}
              />
              <button type="button" className={styles.micBtn} onClick={handleVoiceInput} aria-label="Enable microphone" disabled={!isSessionActive}>
                <Mic size={16} color={isRecording ? 'red' : 'currentColor'} />
              </button>
              <button type="submit" className={styles.sendBtn} disabled={!isSessionActive || !chatInput.trim() || isLoading} aria-label="Send">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* RESULTS OVERLAY (Disabled, rendering in chat instead) */}

    </div>
  );
};

export default PracticePlayerUI;
