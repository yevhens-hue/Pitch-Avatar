'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './PracticePlayerUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Bot, Mic, ArrowUp, RotateCcw, X, CheckCircle, XCircle } from 'lucide-react';
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
  const [projectTitle, setProjectTitle] = useState('Тренинг');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Scenario queue
  const [scenarioQueue, setScenarioQueue] = useState<ScenarioItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  // Results
  const [showResults, setShowResults] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load project data on mount
  useEffect(() => {
    if (!projectId) return;
    getProjectById(projectId).then(p => {
      if (p) {
        setProjectTitle(p.title);
        if (p.slides) setSlides(p.slides);
      }
    });
  }, [projectId]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const activeSlide = slides[activeSlideIndex];
  const hasSlides = slides.length > 0;
  const progress = scenarioQueue.length > 0
    ? Math.round((currentIndex / scenarioQueue.length) * 100)
    : 0;

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
        // Показываем первый вопрос
        const first = queue[0];
        setMessages([{
          id: Date.now().toString(),
          role: 'avatar',
          text: first.question_text,
          isEval: true,
          expectedAnswer: first.expected_answer,
        }]);
        // Если вопрос привязан к слайду — переключить слайд
        if (first.expected_slide_id && first.expected_slide_id !== 'any' && hasSlides) {
          const idx = slides.findIndex(s => String(s.id) === String(first.expected_slide_id));
          if (idx >= 0) setActiveSlideIndex(idx);
        }
      } else {
        // Нет заготовленных вопросов — AI генерирует
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
          text: data.avatarResponse || 'Добро пожаловать! Расскажите о продукте.',
          isEval: true,
        }]);
      }
    } catch (err) {
      setMessages([{
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Ошибка соединения. Попробуйте ещё раз.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Отправка ответа ────────────────────────────────────────────────────────
  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? chatInput).trim();
    if (!text || isLoading) return;

    setChatInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
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
      };

      setMessages(prev => [...prev, avatarMsg]);

      // Логируем ответ
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

      // Переход к следующему вопросу
      const nextIndex = currentIndex + 1;
      if (nextIndex < scenarioQueue.length) {
        setCurrentIndex(nextIndex);
        const nextQ = scenarioQueue[nextIndex];
        // Переключить слайд если привязан
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
          }]);
        }, 600);
      } else if (scenarioQueue.length > 0) {
        // Все вопросы отвечены → показать результаты
        const correctCount = updatedLogs.filter(l => l.isCorrect).length;
        setFinalCorrect(correctCount);
        setTimeout(() => setShowResults(true), 1000);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Ошибка обработки ответа. Попробуйте ещё раз.',
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
    };
    recognition.onerror = () => setIsRecording(false);
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // ── Перезапуск ─────────────────────────────────────────────────────────────
  const handleRestart = () => {
    setShowResults(false);
    setIsSessionActive(false);
    setMessages([]);
    setScenarioQueue([]);
    setCurrentIndex(0);
    setSessionLogs([]);
    setFinalCorrect(0);
    setActiveSlideIndex(0);
  };

  // ─────────────────────────────────── RENDER ───────────────────────────────
  return (
    <div className={styles.container}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>Pitch Avatar</div>
        <div className={styles.headerCenter}>
          <div className={styles.projectTitle}>{projectTitle}</div>
          {isSessionActive && scenarioQueue.length > 0 && (
            <div className={styles.progressLabel}>
              Вопрос {Math.min(currentIndex + 1, scenarioQueue.length)} из {scenarioQueue.length}
            </div>
          )}
        </div>
        <button className={styles.exitBtn} onClick={() => router.back()} aria-label="Выйти">
          <X size={14} /> Выйти
        </button>
      </header>

      {/* PROGRESS BAR */}
      {isSessionActive && scenarioQueue.length > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {/* WORKSPACE */}
      <main className={styles.workspace}>

        {/* SLIDES PANEL — только если слайды есть */}
        {hasSlides && (
          <section className={styles.slidesPanel} aria-label="Слайды">
            <div className={styles.slideCard}>
              <div className={styles.slideNumber}>
                Слайд {activeSlideIndex + 1} / {slides.length}
              </div>
              <div className={styles.slideProjectName}>{projectTitle}</div>
              <div className={styles.slideHeadline}>
                {activeSlide?.title || `Слайд ${activeSlide?.id}`}
              </div>
              <div className={styles.slideBody}>
                {(activeSlide?.text || '').substring(0, 300)}
                {(activeSlide?.text || '').length > 300 ? '...' : ''}
              </div>
            </div>

            <nav className={styles.slideNav} aria-label="Навигация по слайдам">
              <button
                className={styles.slideNavBtn}
                onClick={() => setActiveSlideIndex(i => Math.max(0, i - 1))}
                disabled={activeSlideIndex === 0}
                aria-label="Предыдущий слайд"
              >
                <ChevronLeft size={16} />
              </button>
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.slideNavBtn} ${i === activeSlideIndex ? styles.active : ''}`}
                  onClick={() => setActiveSlideIndex(i)}
                  aria-label={`Слайд ${i + 1}`}
                  aria-current={i === activeSlideIndex ? 'true' : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={styles.slideNavBtn}
                onClick={() => setActiveSlideIndex(i => Math.min(slides.length - 1, i + 1))}
                disabled={activeSlideIndex >= slides.length - 1}
                aria-label="Следующий слайд"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </section>
        )}

        {/* CHAT PANEL */}
        <section
          className={hasSlides ? styles.chatPanel : styles.chatPanelFull}
          aria-label="Чат с аватаром"
        >
          {/* Chat header — аватар */}
          <div className={styles.chatHeader}>
            <div className={styles.avatarIcon} aria-hidden="true">
              <Bot size={20} />
            </div>
            <div>
              <div className={styles.avatarName}>Аватар-тренер</div>
              <div className={styles.avatarRole}>Задаёт вопросы по теме</div>
            </div>
            {isSessionActive && scenarioQueue.length > 0 && (
              <div className={styles.questionBadge}>
                {Math.min(currentIndex + 1, scenarioQueue.length)} / {scenarioQueue.length}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className={styles.messages} role="log" aria-live="polite" aria-label="Переписка">
            {!isSessionActive && (
              <div className={styles.welcomeState}>
                <div className={styles.welcomeEmoji}>🎓</div>
                <div className={styles.welcomeTitle}>Готов к тренингу?</div>
                <div className={styles.welcomeSubtitle}>
                  Аватар будет задавать вопросы по теме. Отвечайте максимально полно и получите оценку.
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.role === 'avatar' ? (
                  <div>
                    {/* Чип оценки */}
                    {msg.isEval && msg.isCorrect === true && (
                      <div className={styles.evalCorrect}>
                        <CheckCircle size={12} /> Верно!
                      </div>
                    )}
                    {msg.isEval && msg.isCorrect === false && (
                      <div className={styles.evalWrong}>
                        <XCircle size={12} /> Нужно доработать
                      </div>
                    )}
                    {/* Пузырь аватара */}
                    <div
                      className={styles.avatarBubble}
                      dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}
                    />
                    {/* Кнопка "показать правильный ответ" */}
                    {msg.isEval && msg.isCorrect === false && msg.expectedAnswer && (
                      msg.revealAnswer ? (
                        <div className={styles.expectedAnswer}>
                          <strong>Правильный ответ:</strong><br />
                          {msg.expectedAnswer}
                        </div>
                      ) : (
                        <button
                          className={styles.revealAnswerBtn}
                          onClick={() =>
                            setMessages(prev =>
                              prev.map(m => m.id === msg.id ? { ...m, revealAnswer: true } : m)
                            )
                          }
                        >
                          Показать правильный ответ
                        </button>
                      )
                    )}
                  </div>
                ) : (
                  <div className={styles.userBubble}>{msg.text}</div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className={styles.avatarBubble} style={{ maxWidth: '80px' }}>
                <span className={styles.typingDots}>
                  <span /><span /><span />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className={styles.inputArea}>
            {!isSessionActive ? (
              <>
                <button
                  className={styles.startBtn}
                  onClick={handleStartSession}
                  disabled={isLoading}
                  id="start-practice-btn"
                >
                  {isLoading ? 'Загрузка...' : '🚀 Начать тренинг'}
                </button>
                <div className={styles.startHint}>Аватар начнёт задавать вопросы</div>
              </>
            ) : (
              <div className={styles.inputRow}>
                <button
                  className={`${styles.micBtn} ${isRecording ? styles.micBtnActive : ''}`}
                  onClick={handleVoiceInput}
                  aria-label={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
                  title={isRecording ? 'Остановить запись' : 'Голосовой ввод'}
                >
                  <Mic size={16} />
                </button>
                <input
                  className={styles.chatInput}
                  type="text"
                  placeholder="Введите ответ..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  aria-label="Введите ответ"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  className={styles.sendBtn}
                  onClick={() => handleSend()}
                  disabled={!chatInput.trim() || isLoading}
                  aria-label="Отправить ответ"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* RESULTS SCREEN */}
      {showResults && (
        <div className={styles.resultsOverlay} role="dialog" aria-modal="true" aria-label="Результаты тренинга">
          <div className={styles.resultsCard}>
            <div className={styles.resultsEmoji}>
              {finalCorrect / scenarioQueue.length >= 0.8 ? '🏆' : finalCorrect / scenarioQueue.length >= 0.5 ? '👍' : '💪'}
            </div>
            <div className={styles.resultsTitle}>Тренинг завершён!</div>
            <div className={styles.resultsScore}>{Math.round((finalCorrect / scenarioQueue.length) * 100)}%</div>
            <div className={styles.resultsScoreLabel}>
              Правильных ответов: {finalCorrect} из {scenarioQueue.length}
            </div>

            {/* Breakdown */}
            <div className={styles.resultsBreakdown}>
              {sessionLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${styles.resultItem} ${log.isCorrect ? styles.resultItemCorrect : styles.resultItemWrong}`}
                >
                  {log.isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>Вопрос {i + 1}</span>
                </div>
              ))}
            </div>

            <div className={styles.resultsActions}>
              <button className={styles.retryBtn} onClick={handleRestart} id="retry-practice-btn">
                <RotateCcw size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Пройти ещё раз
              </button>
              <button className={styles.closeBtn} onClick={() => router.back()} id="close-results-btn">
                Завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticePlayerUI;
