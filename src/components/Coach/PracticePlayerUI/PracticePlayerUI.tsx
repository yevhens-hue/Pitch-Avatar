'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './PracticePlayerUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronDown, ThumbsUp, MessageSquare, Share2, Settings, Maximize, VolumeX, Volume2, Mic, User, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getProjectById } from '@/app/actions/projects';

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
  revealAnswer?: boolean;
  timestamp: string;
}

interface ScenarioItem {
  id: string;
  question_text: string;
  expected_answer: string;
  expected_slide_id?: string | number;
}

interface SessionLog {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface PracticePlayerUIProps {
  projectId: string;
}

const PracticePlayerUI: React.FC<PracticePlayerUIProps> = ({ projectId }) => {
  const router = useRouter();

  // Project data
  const [projectTitle, setProjectTitle] = useState('Loading...');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Scenario queue
  const [scenarioQueue, setScenarioQueue] = useState<ScenarioItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  // Results
  const [showResults, setShowResults] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('ru-RU');
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch author info if possible
  const [authorInfo, setAuthorInfo] = useState({ name: 'Автор проекта', email: '' });

  // Load project data on mount
  useEffect(() => {
    if (!projectId) return;
    getProjectById(projectId).then(p => {
      if (p) {
        setProjectTitle(p.title);
        if (p.slides) setSlides(p.slides);
        
        // Use a generic placeholder until full user profiles are joined
        if (p.user_id) {
          supabase.from('profiles').select('full_name, email').eq('id', p.user_id).single()
            .then(({ data }) => {
              if (data) {
                setAuthorInfo({ name: data.full_name || 'Автор', email: data.email || '' });
              }
            }).catch(() => {});
        }
      }
    });
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
      const { data: allScenarios } = await supabase
        .from('buyer_scenarios')
        .select('id, question_text, expected_answer, expected_slide_id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      let queue: ScenarioItem[] = allScenarios && allScenarios.length > 0 ? allScenarios : [];

      setScenarioQueue(queue);
      setCurrentIndex(0);
      setSessionLogs([]);
      setMessages([]);
      setIsSessionActive(true);

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
            language: 'Russian',
          }),
        });
        const data = await res.json();
        setMessages([{
          id: Date.now().toString(),
          role: 'avatar',
          text: data.avatarResponse || 'Привет! Я AI ассистент, готов помочь вам.',
          isEval: true,
          timestamp: formatTime()
        }]);
      }
    } catch (err) {
      setMessages([{
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Ошибка соединения. Попробуйте ещё раз.',
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
    if (!isSessionActive) {
      setChatInput('');
      await handleStartSession();
      // После старта симулируем отправку этого же сообщения через небольшую задержку
      setTimeout(() => {
         setChatInput(text);
         // Recursion guarded by isSessionActive being true now
      }, 500);
      return;
    }

    if (!text || isLoading) return;

    setChatInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: formatTime() };
    setMessages(prev => [...prev, userMsg]);
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
          language: 'Russian',
        }),
      });
      const data = await res.json();

      const avatarMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'avatar',
        text: data.avatarResponse || 'Понял. Следующий вопрос.',
        isEval: !!currentScenario,
        isCorrect: data.isCorrect,
        expectedAnswer: currentScenario?.expected_answer,
        timestamp: formatTime()
      };

      setMessages(prev => [...prev, avatarMsg]);

      const newLog: SessionLog = {
        question: currentScenario?.question_text || '',
        userAnswer: text,
        isCorrect: data.isCorrect ?? false,
      };
      const updatedLogs = [...sessionLogs, newLog];
      setSessionLogs(updatedLogs);

      // Аналитика
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

      // Следующий вопрос
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
        const correctCount = updatedLogs.filter(l => l.isCorrect).length;
        setFinalCorrect(correctCount);
        setTimeout(() => setShowResults(true), 2000);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Ошибка обработки ответа. Попробуйте ещё раз.',
        timestamp: formatTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Голосовой ввод ─────────────────────────────────────────────────────────
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Голосовой ввод не поддерживается в этом браузере');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setChatInput(prev => prev ? `${prev} ${t}` : t);
      // Авто-отправка после распознавания (опционально, но удобно для тренировки)
      setTimeout(() => handleSend(t), 300);
    };
    recognition.onerror = () => setIsRecording(false);
    
    if (isRecording) recognition.stop();
    else recognition.start();
  };

  const handleRestart = () => {
    setShowResults(false);
    setIsSessionActive(false);
    setMessages([]);
    setScenarioQueue([]);
    setCurrentIndex(0);
    setSessionLogs([]);
    setFinalCorrect(0);
    setActiveSlideIndex(0);
    handleStartSession();
  };

  // ─────────────────────────────────── RENDER ───────────────────────────────
  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span style={{color: '#0076ff', fontSize: '1.4rem'}}>P</span>itch <span>Avatar</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <select className={styles.langSelect}>
            <option>Английский</option>
            <option>Русский</option>
          </select>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className={styles.workspace}>
        
        {/* LEFT COLUMN: Slide & Author */}
        <div className={styles.leftCol}>
          <div className={styles.presentationBox}>
            <div className={styles.slideContent}>
               {!isSessionActive && messages.length === 0 ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '100%'}}>
                     <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '40px', width: 'fit-content'}}>
                        <span style={{fontSize: '2rem', fontWeight: 'bold'}}>Hi 👋</span>
                     </div>
                     <div style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem 2rem', borderRadius: '24px', width: 'fit-content'}}>
                        <div style={{color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>I'm an AI assistant, here to help you.</div>
                        <div style={{color: '#e2e8f0', fontSize: '1rem'}}>Talk to me through voice or text, whichever<br/>works for you.</div>
                     </div>
                     <div style={{background: 'rgba(255,255,255,0.05)', padding: '1.5rem 2rem', borderRadius: '24px', width: 'fit-content', marginLeft: '4rem'}}>
                        <div style={{color: '#38bdf8', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Want to switch to another language?</div>
                        <div style={{color: '#e2e8f0', fontSize: '1rem'}}>Just hit the toggle in the top right corner so I<br/>can understand you better.</div>
                     </div>
                     <div style={{textAlign: 'right', marginTop: '2rem', fontSize: '1.2rem', fontWeight: 'bold', paddingRight: '2rem'}}>
                        Ready when you're! 😉
                     </div>
                  </div>
               ) : (
                  <>
                     <div className={styles.slideTitle}>{activeSlide?.title || projectTitle}</div>
                     <div className={styles.slideBody}>{activeSlide?.text || "Нет текста на слайде"}</div>
                  </>
               )}
            </div>
            
            <div className={styles.presentationFooter}>
               <div style={{color: '#fff'}}>{activeSlideIndex + 1}/{Math.max(1, slides.length)}</div>
               <div className={styles.progressBarWrapper}>
                 <div className={styles.progressFill} style={{width: `${progressPercent}%`}}></div>
               </div>
               <div className={styles.slideControls}>
                 <Settings size={18} className={styles.slideIcon} />
                 <Maximize size={18} className={styles.slideIcon} />
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
              <button className={styles.iconBtn} aria-label="Like"><ThumbsUp size={16} /></button>
              <button className={styles.iconBtn} aria-label="Comment"><MessageSquare size={16} /></button>
              <button className={styles.iconBtn} aria-label="Share"><Share2 size={16} /></button>
              <button className={styles.callPresenterBtn}>Позвать презентера</button>
              <button className={styles.slidesDropdown}>Слайды <ChevronDown size={14}/></button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Video & Chat */}
        <div className={styles.rightCol}>
          
          <div className={styles.videoBox}>
            {/* Имитация видео аватара. На практике тут будет <video> или WebRTC стрим */}
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop" alt="Avatar" className={styles.videoImg} />
            <button className={styles.muteIcon} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className={styles.imStatus}>IM</div>
            <div className={styles.videoLabel}>Chat Avatar [{formatDate()}]</div>
          </div>

          <div className={styles.chatWrapper}>
            <div className={styles.messagesArea}>
              
              {messages.map((msg, i) => (
                <div key={msg.id} className={styles.chatBubbleWrap} style={{ alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className={styles.chatHeader}>
                    {msg.role === 'avatar' ? `Chat Avatar [${formatDate()}]` : 'Вы'}
                    <span style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>{msg.timestamp}</span>
                  </div>
                  
                  <div className={msg.role === 'user' ? styles.userBubble : styles.avatarBubble}>
                     <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                     
                     {msg.isEval && msg.isCorrect === true && (
                       <div className={styles.evalCorrect}><CheckCircle size={14} /> Верно</div>
                     )}
                     
                     {msg.isEval && msg.isCorrect === false && (
                       <div className={styles.evalWrong}><XCircle size={14} /> Ошибка</div>
                     )}
                     
                     {msg.isEval && msg.isCorrect === false && msg.expectedAnswer && (
                       msg.revealAnswer ? (
                         <div className={styles.expectedAnswer}>{msg.expectedAnswer}</div>
                       ) : (
                         <div>
                            <button className={styles.revealAnswerBtn} onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, revealAnswer: true } : m))}>
                               Показать ответ
                            </button>
                         </div>
                       )
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
            </div>
            
            <div className={styles.inputArea}>
              <input 
                type="text" 
                className={styles.chatInput} 
                placeholder="Send a message" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                className={`${styles.micBtn} ${isRecording ? styles.micBtnActive : ''}`} 
                onClick={handleVoiceInput}
              >
                <Mic size={18} />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* RESULTS OVERLAY */}
      {showResults && (
        <div className={styles.resultsOverlay}>
          <div className={styles.resultsCard} style={{ width: '600px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className={styles.resultsScore}>{Math.round((finalCorrect / Math.max(1, scenarioQueue.length)) * 100)}%</div>
            <div style={{color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.2rem'}}>
              Правильных ответов: {finalCorrect} из {scenarioQueue.length}
            </div>
            
            <div style={{ textAlign: 'left', width: '100%', marginBottom: '2rem' }}>
               <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Разбор по вопросам:</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {sessionLogs.map((log, idx) => (
                   <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${log.isCorrect ? '#22c55e' : '#ef4444'}` }}>
                     <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                        В: {log.question}
                     </div>
                     <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Ваш ответ: <span style={{ color: '#334155' }}>{log.userAnswer}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: log.isCorrect ? '#22c55e' : '#ef4444' }}>
                        {log.isCorrect ? <><CheckCircle size={14} /> Верно</> : <><XCircle size={14} /> Ошибка</>}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className={styles.resultsActions} style={{ justifyContent: 'center' }}>
              <button className={styles.retryBtn} onClick={handleRestart}>Пройти ещё раз</button>
              <button className={styles.closeBtn} onClick={() => router.back()}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PracticePlayerUI;
