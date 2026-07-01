'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ProbationPlayer.module.css';
import {
  probationSlides,
  STATUS_LABELS,
  type ProbationSlide,
  type StatusKind,
} from '@/data/probation-data';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  List,
  CheckCircle2,
  Loader2,
  Clock3,
  AlertTriangle,
  CalendarClock,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

const STATUS_ICON: Record<StatusKind, React.ComponentType<{ size?: number }>> = {
  done: CheckCircle2,
  progress: Loader2,
  review: Clock3,
  blocked: AlertTriangle,
  planned: CalendarClock,
};

// Безопасный рендер «жирного» markdown (**...**) без dangerouslySetInnerHTML.
function renderRich(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function StatusBadge({ kind, label }: { kind: StatusKind; label?: string }) {
  const Icon = STATUS_ICON[kind];
  return (
    <span className={`${styles.statusBadge} ${styles[`status_${kind}`]}`}>
      <Icon size={14} />
      {label ?? STATUS_LABELS[kind]}
    </span>
  );
}

function SlideContentView({ slide }: { slide: ProbationSlide }) {
  const { content } = slide;

  switch (content.kind) {
    case 'summary':
      return (
        <div className={styles.metricGrid}>
          {content.metrics.map((m) => (
            <div key={m.label} className={styles.metricCard}>
              <div className={`${styles.metricVal} ${styles[`accent_${m.accent ?? 'blue'}`]}`}>
                {m.value}
              </div>
              <div className={styles.metricLabel}>{m.label}</div>
              <div
                className={`${styles.metricAccentBar} ${styles[`accentBg_${m.accent ?? 'blue'}`]}`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      );

    case 'overview':
      return (
        <ul className={styles.overviewList}>
          {content.items.map((item) => (
            <li key={item.name} className={styles.overviewRow}>
              <span className={styles.overviewName}>{item.name}</span>
              <StatusBadge kind={item.status} />
            </li>
          ))}
        </ul>
      );

    case 'task':
      return (
        <div className={styles.taskBody}>
          <StatusBadge kind={content.statusKind} label={content.status} />
          <ul className={styles.deliverables}>
            {content.deliverables.map((d) => (
              <li key={d} className={styles.deliverable}>
                <CheckCircle2 size={16} className={styles.deliverableIcon} />
                {renderRich(d)}
              </li>
            ))}
          </ul>
          {content.links && content.links.length > 0 && (
            <div className={styles.linkRow}>
              {content.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkChip}
                >
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      );

    case 'list':
      return (
        <div className={styles.chipWrap}>
          {content.items.map((item) => (
            <div key={item} className={styles.chip}>
              {item}
            </div>
          ))}
        </div>
      );

    case 'closing':
      return (
        <ul className={styles.deliverables}>
          {content.points.map((p) => (
            <li key={p} className={styles.deliverable}>
              <ChevronRight size={16} className={styles.deliverableIcon} />
              {p}
            </li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}

export default function ProbationPlayer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'chat'>('transcript');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: 'Привет! Я Sara, ваш AI-ассистент. Есть вопросы по итогам испытательного срока? Спрашивайте!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0);
  const activeLineRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const slides = probationSlides;
  const currentSlide = slides[currentSlideIndex];
  const totalSlides = slides.length;

  const handleNext = () => {
    setCurrentSlideIndex((prev) => {
      if (prev < totalSlides - 1) {
        setProgress(0);
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => {
      if (prev > 0) {
        setProgress(0);
        return prev - 1;
      }
      return prev;
    });
  };

  // Имитация авто-проигрывания слайдов.
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentSlideIndex]);

  // Навигация с клавиатуры: ←/→ — слайды, пробел — play/pause.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Авто-скролл активной строки транскрипта в зону видимости.
  useEffect(() => {
    if (activeTab === 'transcript') {
      activeLineRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentSlideIndex, activeTab]);

  // Авто-скролл чата вниз при новом сообщении.
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInputValue('');

    setTimeout(() => {
      let botResponse =
        'Хороший вопрос! По этому направлению готовы артефакты и прототип — детали на соответствующем слайде.';
      const q = query.toLowerCase();
      if (q.includes('sara')) {
        botResponse =
          'По Sara готовы PRD, эпик и рабочий прототип, фича презентована. Сейчас — этап ресёрча.';
      } else if (q.includes('billing') || q.includes('платеж') || q.includes('платёж')) {
        botResponse =
          'Billing готов по артефактам и прототипу, но сроки смещаются из-за проблем с платёжной системой.';
      } else if (q.includes('coach') || q.includes('коуч') || q.includes('тренер')) {
        botResponse = 'Coach Role сейчас на этапе согласования UI/UX-прототипа.';
      }
      setMessages((prev) => [...prev, { role: 'bot', text: botResponse }]);
    }, 800);
  };

  return (
    <div className={styles.container}>
      <div className={styles.stage}>
        <div className={styles.slideArea}>
          <div className={`${styles.slideContent} ${styles.slideEnter}`} key={currentSlide.id}>
            <div className={styles.slideHeader}>
              <div>
                <div className={styles.slideTag}>{currentSlide.tag}</div>
                <h2 className={styles.slideTitle}>{currentSlide.title}</h2>
                {currentSlide.subtitle && (
                  <div className={styles.slideSubtitle}>{currentSlide.subtitle}</div>
                )}
              </div>
              <div className={styles.slideCounter}>
                {currentSlideIndex + 1} / {totalSlides}
              </div>
            </div>

            <div className={styles.slideBody}>
              <SlideContentView slide={currentSlide} />
              <p className={styles.slideQuote}>
                {'\u201C'}
                {currentSlide.script.substring(0, 120)}
                ...{'\u201D'}
              </p>
            </div>
          </div>

          <div className={styles.avatarContainer}>
            <img src="/sara-speaking.png" alt="AI-ассистент Sara" className={styles.avatarImg} />
            <div className={styles.avatarOverlay} />
            {isPlaying && <div className={styles.speakingRipple} />}
            {isPlaying && (
              <div className={styles.speakingRipple} style={{ animationDelay: '0.5s' }} />
            )}
          </div>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.playBtn}
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.timeInfo}>{Math.floor(progress / 10)}s / 10s</div>

          <div className={styles.navGroup}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1}
              aria-label="Следующий слайд"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sidebarTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'transcript'}
            className={`${styles.tab} ${activeTab === 'transcript' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transcript')}
          >
            <List size={16} className={styles.tabIcon} />
            Транскрипт
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'chat'}
            className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} className={styles.tabIcon} />
            AI-ассистент
          </button>
        </div>

        <div className={styles.sidebarContent}>
          {activeTab === 'transcript' ? (
            <div>
              {slides.map((s, idx) => (
                <button
                  type="button"
                  key={s.id}
                  ref={idx === currentSlideIndex ? activeLineRef : undefined}
                  className={`${styles.transcriptLine} ${idx === currentSlideIndex ? styles.transcriptLineActive : ''}`}
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setProgress(0);
                  }}
                >
                  <div className={styles.transcriptIndex}>СЛАЙД {idx + 1}</div>
                  {renderRich(s.script)}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.chatArea}>
              <div className={styles.messages}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`${styles.message} ${m.role === 'bot' ? styles.messageBot : styles.messageUser}`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className={styles.chatInputArea} onSubmit={handleSendMessage}>
                <label htmlFor="probation-chat" className={styles.srOnly}>
                  Вопрос по итогам
                </label>
                <input
                  id="probation-chat"
                  type="text"
                  className={styles.chatInput}
                  placeholder="Задайте вопрос по итогам..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className={styles.sendBtn} aria-label="Отправить">
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
