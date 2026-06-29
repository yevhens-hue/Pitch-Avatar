'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './TrainModeUI.module.css';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, Bot, ArrowUp, ArrowDown, Database, Zap, ChevronsUpDown, Mic, Check, FileText, CheckSquare, Globe, Upload, Type, CheckCircle, XCircle } from 'lucide-react';
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

interface SessionLog {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
}

/** Действия тренера над сообщением аватара. */
type MessageAction = 'confirm' | 'reject' | 'save-storage' | 'save-instruction';

const ACTION_LABELS: Record<MessageAction, string> = {
  confirm: 'Confirmed',
  reject: 'Rejected — please edit the question',
  'save-storage': 'Q&A saved to storage',
  'save-instruction': 'Added as instruction',
};

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

/**
 * Safely render avatar text. Supports only `**bold**` markdown.
 * Text is rendered as React nodes (never as raw HTML), so any markup in the
 * payload is treated as plain text — eliminating the XSS surface that
 * `dangerouslySetInnerHTML` used to expose.
 */
const renderFormattedText = (text: string): React.ReactNode => {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <b key={i}>{bold[1]}</b>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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
  scenarioProgress?: { current: number, total: number };
}

const TrainModeUI: React.FC<TrainModeUIProps> = ({ projectId, slides: initialSlides, onExit }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('train');
  const [projectTitle, setProjectTitle] = useState('Loading...');
  const [slides, setSlides] = useState<Slide[]>(initialSlides ?? []);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Controls state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [generateFromContent, setGenerateFromContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'scenarios' | 'knowledge'>('chat');
  const [kbInputType, setKbInputType] = useState<'url' | 'file' | 'text'>('url');
  const [kbInputValue, setKbInputValue] = useState('');

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
    showCorrectAnswer: 'immediate' as 'immediate' | 'end' | 'never',
    buyerPersona: 'none' as 'skeptic' | 'budget_controller' | 'technical' | 'friendly' | 'negotiator' | 'none',
    startMode: 'avatar_asks_first' as 'avatar_asks_first' | 'seller_asks_first'
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Player State (Practice Mode)
  const [chatMessage, setChatMessage] = useState('');
  const [attachSlide, setAttachSlide] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  // Auto-scroll anchor for the chat log + a synchronous tally of correct
  // answers (used for the final score to avoid relying on stale setState).
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const correctCountRef = useRef(0);

  // A11y refs: settings modal (focus-trap) + tab buttons (roving focus).
  const modalRef = useRef<HTMLDivElement>(null);
  const chatTabRef = useRef<HTMLButtonElement>(null);
  const scenariosTabRef = useRef<HTMLButtonElement>(null);
  const kbTabRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation for the right-panel tablist (← → Home End).
  const handleMoveScenario = async (id: string, direction: 'up' | 'down') => {
    const idx = savedScenarios.findIndex(s => s.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === savedScenarios.length - 1) return;
    
    const newScenarios = [...savedScenarios];
    const temp = newScenarios[idx];
    newScenarios[idx] = newScenarios[direction === 'up' ? idx - 1 : idx + 1];
    newScenarios[direction === 'up' ? idx - 1 : idx + 1] = temp;
    
    setSavedScenarios(newScenarios);
    
    try {
      // Optimistic update to DB using order_index if it exists
      for (let i = 0; i < newScenarios.length; i++) {
        const { error } = await supabase
          .from('buyer_scenarios')
          .update({ order_index: i })
          .eq('id', newScenarios[i].id);
        if (error) console.warn('Could not update order_index (may be missing column):', error);
      }
    } catch (e) {
      console.log('Order update failed', e);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order: Array<'chat' | 'scenarios' | 'knowledge'> = ['chat', 'scenarios', 'knowledge'];
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const idx = order.indexOf(activeTab);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % order.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + order.length) % order.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = order.length - 1;
    const nextTab = order[next];
    setActiveTab(nextTab);
    (nextTab === 'chat' ? chatTabRef : kbTabRef).current?.focus();
  };

  // Practice session question queue (admin-saved scenarios)
  const [scenarioQueue, setScenarioQueue] = useState<Array<{id: string; question_text: string; expected_answer: string; expected_slide_id?: string | number}>>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionScore, setSessionScore] = useState({ total: 0, correct: 0 });
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Train Mode Check Answer panel state
  const [testAnswer, setTestAnswer] = useState('');
  const [testResult, setTestResult] = useState<{isCorrect?: boolean, avatarResponse?: string} | null>(null);

  const handleCheckAnswer = async () => {
    if (!testAnswer || !scenarioInput.expectedAnswer) {
      showToast('Введите ожидаемый ответ и тестовый ответ для проверки', 'error');
      return;
    }
    
    setTestResult({ avatarResponse: 'Evaluating...' });
    
    try {
      const payload = {
        projectId,
        userMessage: testAnswer,
        history: [],
        expectedAnswer: scenarioInput.expectedAnswer,
        expectedSlideId: scenarioInput.targetSlideId,
        questionText: scenarioInput.question
      };

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTestResult({
        isCorrect: data.isCorrect,
        avatarResponse: data.avatarResponse || 'No feedback provided'
      });
    } catch (err) {
      setTestResult({ avatarResponse: 'Evaluation failed' });
    }
  };

  useEffect(() => {
    if (projectId) {
      getProjectById(projectId).then(p => {
        if (p) {
          setProjectTitle(p.title);
          if (p.slides) setSlides(p.slides);
        }
      });
      // Load saved scenarios for Knowledge Base tab
      supabase.from('buyer_scenarios').select('id, question_text, expected_answer, expected_slide_id, order_index').eq('project_id', projectId).order('order_index', { ascending: true })
        .then(({ data }) => { if (data) setSavedScenarios(data); });
    }
  }, [projectId]);

  const activeSlide = slides[activeSlideIndex] || { id: 1, text: 'No slide content' };
  const activeSlideText = activeSlide.text || '';
  const slideHeading = (activeSlide.title || '').trim();

  // Keep the chat scrolled to the latest message / typing indicator.
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isEvaluating, activeTab]);

  // Settings modal a11y: close on Escape, trap Tab focus inside the dialog,
  // move focus in on open and restore it to the trigger on close.
  useEffect(() => {
    if (!showConfigModal) return;
    const node = modalRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(el => el.offsetParent !== null)
        : [];

    // Move focus into the dialog.
    (getFocusable()[0] ?? node)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowConfigModal(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previouslyFocused?.focus();
    };
  }, [showConfigModal]);

  // Build a condensed list of slide page items so the pagination never
  // overflows horizontally, even with many slides (ellipsis windowing).
  const getPaginationItems = (current: number, total: number): Array<number | 'ellipsis'> => {
    if (total <= 9) return Array.from({ length: total }, (_, i) => i);
    const pages = new Set<number>([0, total - 1, current]);
    for (let i = current - 1; i <= current + 1; i++) {
      if (i >= 0 && i < total) pages.add(i);
    }
    const sorted = Array.from(pages).sort((a, b) => a - b);
    const items: Array<number | 'ellipsis'> = [];
    let prev = -1;
    for (const page of sorted) {
      if (prev >= 0 && page - prev > 1) items.push('ellipsis');
      items.push(page);
      prev = page;
    }
    return items;
  };

  // Parse slide-level triggers (MediaData Triggers MVP)
  const [slideTriggers, setSlideTriggers] = useState<any[]>([]);
  useEffect(() => {
    if (activeSlide?.metadata?.triggers && Array.isArray(activeSlide.metadata.triggers)) {
      setSlideTriggers(activeSlide.metadata.triggers);
      // Execute auto-triggers
      activeSlide.metadata.triggers.forEach((trigger: any) => {
        if (trigger.type === 'alert' && trigger.delay) {
          setTimeout(() => showToast(trigger.message || 'Trigger activated!'), trigger.delay);
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
            { id: Date.now().toString(), role: 'user', text: `[Mode: аватар генерирует вопросы out of контента]\n${q.questionText}`, type: 'regular' }
          ]);
        }
      } catch (err) {
        showToast('Failed to generate question', 'error');
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
      showToast('Speech recognition is not supported in this browser', 'error');
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
        correctCountRef.current = 0;

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
            scenarioProgress: { current: 1, total: queue.length },
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
            text: data.avatarResponse || 'Let's start. Tell me about your product.',
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
          text: 'Failed to start the session. Please try again.',
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
          userMessage: attachSlide ? `[Прикреплён слайд ${activeSlide.id}] ${text}` : text,
          contextMode: 'strict',
          listenerName: sessionConfig.listenerName,
          language: sessionConfig.language,
          coachRole: sessionConfig.coachRole,
          isInitiation: false,
          activeScenarioId: currentScenario?.id,
        }),
      });
      const data = await res.json();

      // Add evaluation feedback
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: data.avatarResponse || 'Let's discuss in detail. Can you explain?',
        type: 'evaluation',
        evaluation: sessionConfig.showScore === 'immediate' ? data.evaluation : undefined,
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

      // Update Session Score — keep a synchronous ref alongside the state so
      // the final tally never depends on the asynchronous setState value.
      if (data.isCorrect) {
        correctCountRef.current += 1;
        setSessionScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      }

      const newLog: SessionLog = {
        question: currentScenario?.question_text || '',
        userAnswer: text,
        isCorrect: data.isCorrect ?? false,
        score: data.evaluation?.score ?? (data.isCorrect ? 100 : 0),
      };
      
      setSessionLogs(prev => {
        const next = [...prev, newLog];
        // Calculate average score after adding the new log
        const totalScore = next.reduce((acc, log) => acc + (log.score || 0), 0);
        const avgScore = next.length > 0 ? Math.round(totalScore / next.length) : 0;
        setFinalScore(avgScore);
        return next;
      });

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
            scenarioProgress: { current: nextIndex + 1, total: scenarioQueue.length },
          }]);
        }, 800);
      } else if (scenarioQueue.length > 0) {
        // All questions answered — the closing message differs per setting:
        //  • 'immediate' → score was already shown inline after each answer
        //  • 'end'       → reveal the full tally only now
        //  • 'never'     → no score at all
        const total = scenarioQueue.length;
        const correct = correctCountRef.current;
        let finalText: string;
        if (sessionConfig.showScore === 'end') {
          finalText = `✅ Practice completed!\n\n**Your result:** ${correct} out of ${total} correct answers.`;
        } else if (sessionConfig.showScore === 'immediate') {
          finalText = `✅ Practice completed! The score was shown after each answer.`;
        } else {
          finalText = `✅ Practice completed! Thank you for participating.`;
        }
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'avatar',
            text: finalText,
            type: 'regular',
          }]);
          
          setTimeout(() => setShowResults(true), 1500);
        }, 800);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'avatar',
        text: 'Failed to contact the evaluation system. Please try again later.',
        type: 'regular',
      }]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveScenario = async (saveTarget: 'rag' | 'scenario' = 'scenario') => {
    if (!scenarioInput.question.trim()) {
      showToast('Enter a question to train the model.', 'error');
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
        saveTarget: saveTarget,
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
        showToast(`Error ${res.status}: ${errBody?.error || 'failed to save'}`, 'error');
        return;
      }

      showToast(`Successfully saved (${saveTarget === 'rag' ? 'RAG' : 'Scenario'})!`, 'success');
      // Add to local list immediately (optimistic update)
      setSavedScenarios(prev => [{
        id: Date.now().toString(),
        question_text: scenarioInput.question,
        expected_answer: scenarioInput.expectedAnswer,
        expected_slide_id: scenarioInput.targetSlideId === 'current' ? activeSlide.id : (scenarioInput.targetSlideId === 'any' ? 'any' : undefined),
        save_target: saveTarget
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

  const handleAction = async (action: MessageAction, messageText?: string) => {
    if (action === 'save-storage' || action === 'save-instruction') {
      try {
        const res = await fetch('/api/coach/save-to-rag', {
          method: 'POST',
          headers: { "Content-Type": "application/json", ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },
          body: JSON.stringify({
            projectId,
            questionText: 'Learned from conversation context',
            expectedAnswer: messageText || 'Auto-saved interaction',
            expectedSlideId: activeSlide.id,
            saveTarget: action === 'save-storage' ? 'rag' : (action === 'save-instruction' ? 'instruction' : 'scenario')
          })
        });
        if (!res.ok) throw new Error('Save failed');
        showToast(ACTION_LABELS[action], 'success');
      } catch (err) {
        showToast(`Не удалось: ${ACTION_LABELS[action]}`, 'error');
      }
    } else {
      showToast(ACTION_LABELS[action]);
    }
  };

  // Determine active test options
  const lastMessage = messages[messages.length - 1];
  const activeTestOptions = (mode === 'practice' && lastMessage?.testOptions) ? lastMessage.testOptions : null;

  const renderChatBody = () => (
    <>
      {/* Train-mode intro note */}
      {messages.length === 0 && mode === 'train' && (
        <div className={styles.chatMessage}>
          <div className={styles.messageHeader}>
            <Bot size={16} />
            You are acting as the avatar.
          </div>
          <div className={styles.messageBody}>
            The avatar generates questions from the content for the trainee. You answer as the avatar would.
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.scenarioProgress && (
            <div className={styles.progressPill}>
              <CheckSquare size={13} />
              Question {msg.scenarioProgress.current} out of {msg.scenarioProgress.total}
            </div>
          )}
          {msg.role === 'user' ? (
            <div className={styles.userMessage}>
              {msg.text}
            </div>
          ) : (
            <div className={styles.avatarResponseContainer}>
              {msg.type === 'evaluation' && msg.evaluation ? (
                <div className={styles.evalBox}>
                  <div className={styles.evalStatus} style={{
                    color: msg.evaluation.result === 'Correct' ? '#22c55e' : 
                           msg.evaluation.result === 'Partially Correct' ? '#eab308' : '#ef4444'
                  }}>
                    {msg.evaluation.result === 'Correct' ? <CheckCircle size={14} /> : 
                     msg.evaluation.result === 'Partially Correct' ? <CheckCircle size={14} /> : 
                     <XCircle size={14} />}
                    <span style={{ marginLeft: 4, fontWeight: 600 }}>
                      {msg.evaluation.result === 'Correct' ? 'Correct' : 
                       msg.evaluation.result === 'Partially Correct' ? 'Partially Correct' : 'Error'}
                      {' '}({msg.evaluation.score}/100)
                    </span>
                  </div>
                  
                  {msg.evaluation.feedback && (
                    <div className={styles.evalFeedback}>{msg.evaluation.feedback}</div>
                  )}
                  
                  <div className={styles.evalStats}>
                    <div className={styles.evalStat}>Product knowledge: <span>{msg.evaluation.productKnowledge}%</span></div>
                    <div className={styles.evalStat}>Objection handling: <span>{msg.evaluation.objectionHandling}%</span></div>
                    <div className={styles.evalStat}>Needs identification: <span>{msg.evaluation.needsIdentification}%</span></div>
                    <div className={styles.evalStat}>Value presentation: <span>{msg.evaluation.valuePresentation}%</span></div>
                    <div className={styles.evalStat}>Slides: <span>{msg.evaluation.slideUsage}%</span></div>
                  </div>
                </div>
              ) : msg.type === 'evaluation' ? (
                <>
                  {msg.isCorrect === true && (
                    <div className={styles.evalCorrect}><CheckCircle size={14} /> Correct</div>
                  )}
                  {msg.isCorrect === false && (
                    <div className={styles.evalWrong}><XCircle size={14} /> Error</div>
                  )}
                </>
              ) : null}
              <div className={styles.avatarMessage}>{renderFormattedText(msg.text)}</div>

              {msg.type === 'evaluation' && msg.isCorrect === false && msg.expectedAnswer && (
                <div className={styles.revealWrap}>
                  {!msg.revealAnswer ? (
                    <button
                      className={styles.revealBtn}
                      onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, revealAnswer: true } : m))}
                    >
                      Показать правильный ответ
                    </button>
                  ) : (
                    <div className={styles.revealBox}>
                      <span className={styles.revealLabel}>Правильный ответ</span>
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
                      title="Video-реакция аватара"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video className={styles.reactionVideo} src={msg.reactionData} controls aria-label="Video-реакция аватара" />
                  )}
                </div>
              )}
              {msg.reactionType === 'slide' && msg.reactionData && (
                <div className={styles.reactionSlideNote}>
                  <FileText size={13} /> Переход на слайд {msg.reactionData}
                </div>
              )}

              {mode === 'train' && (
                <>
                  {/* Action Buttons Row */}
                  <div className={styles.messageActions}>
                    <button className={styles.actionBtn} onClick={() => handleAction('confirm')}>
                      <Check size={14} /> Подтвердить
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleAction('reject')}>
                      <X size={14} /> Отклонить и out ofменить
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleAction('save-storage', msg.text)}>
                      <Database size={14} /> Q&A → Хранилище
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleAction('save-instruction', msg.text)}>
                      <FileText size={14} /> Как инструкция
                    </button>
                  </div>

                  {/* Answer with Avatar Voice Widget */}
                  <div className={styles.voiceBar}>
                    <div className={styles.voiceDragIcon}>
                      <ChevronsUpDown size={14} />
                    </div>
                    <div className={styles.voiceTextWrapper}>
                      <Mic size={16} />
                      <span>Ответить голосом аватара</span>
                    </div>
                    <div className={styles.tagGroup}>
                      <span className={styles.tagReaction}>Реакция</span>
                      <span className={styles.tagTraining}>Обучение</span>
                    </div>
                    <div className={styles.voiceControls}>
                      <button className={styles.controlIconBtn} aria-label="Принять"><Check size={14} /></button>
                      <button className={styles.controlIconBtn} aria-label="Отклонить"><X size={14} /></button>
                    </div>
                  </div>

                  <button className={styles.addReactionBtn}>
                    <Plus size={16} /> Добавить реакцию
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {isEvaluating && (
        <div className={styles.avatarResponseContainer}>
          <div className={styles.avatarMessage} aria-label="Аватар печатает">
            <span className={styles.typingDots}><span></span><span></span><span></span></span>
          </div>
        </div>
      )}

      {/* Avatar-mode editor */}
      {mode === 'train' && (
        <div className={styles.editorForm}>
          <div className={styles.editorHeader}>
            <label className={styles.formLabel}>Question from avatar to trainee</label>
            <label className={styles.editorTestToggle}>
              <input type="checkbox" checked={scenarioInput.isTest} onChange={e => setScenarioInput({...scenarioInput, isTest: e.target.checked})} />
              Test / Quiz
            </label>
          </div>
          <textarea
            className={styles.formTextarea}
            placeholder="e.g.: What is the ROI of the solution?"
            value={scenarioInput.question}
            onChange={e => setScenarioInput({...scenarioInput, question: e.target.value})}
          />

          {scenarioInput.isTest ? (
            <div className={styles.testOptionsBox}>
              <label className={styles.formLabel}>Варианты ответа</label>
              {scenarioInput.testOptions.map((opt, i) => (
                <div key={i} className={styles.testOptionRow}>
                  <input
                    type="radio"
                    name="correctOption"
                    checked={scenarioInput.correctOptionIndex === i}
                    onChange={() => setScenarioInput({...scenarioInput, correctOptionIndex: i})}
                    aria-label={`Правильный вариант ${i + 1}`}
                  />
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder={`Вариант ${i + 1}`}
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
              <label className={styles.formLabel}>Correct answer (for evaluating trainee)</label>
              <textarea
                className={styles.formTextarea}
                placeholder="Что испытуемый должен ответить…"
                value={scenarioInput.expectedAnswer}
                onChange={e => setScenarioInput({...scenarioInput, expectedAnswer: e.target.value})}
              />
              {extractTemplateVariables(scenarioInput.expectedAnswer).length > 0 && (
                <div className={styles.paramHint}>
                  <span className={styles.paramHintLabel}>Найдены параметры:</span>
                  {extractTemplateVariables(scenarioInput.expectedAnswer).map(v => (
                    <span key={v} className={styles.paramTag}>{v}</span>
                  ))}
                </div>
              )}
            </>
          )}

          <div className={styles.fieldBlock}>
            <label className={styles.formLabel}>Slide binding (optional)</label>
            <select
              className={styles.inputField}
              value={scenarioInput.targetSlideId}
              onChange={e => setScenarioInput({...scenarioInput, targetSlideId: e.target.value as 'current' | 'any' | 'none'})}
            >
              <option value="any">Без привязки (любой слайд)</option>
              <option value="current">Current slide ({activeSlide.id})</option>
              <option value="none">Только чат (без слайда)</option>
            </select>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldCol}>
              <label className={styles.formLabel}>Reaction type</label>
              <select
                className={styles.inputField}
                value={scenarioInput.reactionType}
                onChange={e => setScenarioInput({...scenarioInput, reactionType: e.target.value as any})}
              >
                <option value="text">Text response</option>
                <option value="slide">Показать слайд</option>
                <option value="video">Проиграть видео</option>
              </select>
            </div>
            {(scenarioInput.reactionType === 'slide' || scenarioInput.reactionType === 'video') && (
              <div className={styles.fieldCol}>
                <label className={styles.formLabel}>{scenarioInput.reactionType === 'slide' ? 'ID слайда' : 'URL видео'}</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder={scenarioInput.reactionType === 'slide' ? 'напр.: 2' : 'напр.: https://…'}
                  value={scenarioInput.reactionData}
                  onChange={e => setScenarioInput({...scenarioInput, reactionData: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className={styles.editorActions}>
            <button type="button" className={styles.btnOutline} onClick={() => setScenarioInput({ question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'current', isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 })}>
              <X size={16} /> Cancel
            </button>
            <button type="button" className={styles.btnSolid} onClick={() => handleSaveScenario('rag')}>
              <Database size={16} /> Save to RAG
            </button>
            <button type="button" className={styles.btnSolid} onClick={() => handleSaveScenario('scenario')}>
              <Plus size={16} /> Save as Scenario
            </button>
          </div>

          {/* Test Answer Panel */}
          <div className={styles.testPanel}>
            <h4 className={styles.testPanelTitle}>Answer evaluation testing</h4>
            <p className={styles.testPanelDesc}>
              Check how the system will evaluate the student's test answer based on your expected answer.
            </p>
            <div className={styles.fieldBlock}>
              <textarea
                className={styles.inputField}
                placeholder="Enter student's test answer..."
                value={testAnswer}
                onChange={e => setTestAnswer(e.target.value)}
                rows={2}
              />
            </div>
            <div className={styles.testPanelActions}>
              <button 
                type="button" 
                className={styles.btnOutline} 
                onClick={handleCheckAnswer}
                disabled={testResult?.avatarResponse === 'Evaluating...' || !scenarioInput.question || !testAnswer}
              >
                {testResult?.avatarResponse === 'Evaluating...' ? 'Проверка...' : 'Check answer'}
              </button>
            </div>
            {testResult && testResult.avatarResponse !== 'Evaluating...' && (
              <div className={`${styles.testFeedback} ${testResult.isCorrect ? styles.testFeedbackOk : styles.testFeedbackBad}`}>
                <div className={styles.testFeedbackTitle}>
                  {testResult.isCorrect ? '✅ Ответ засчитан' : '❌ Ответ не засчитан'}
                </div>
                <p>{testResult.avatarResponse}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={chatBottomRef} />
    </>
  );

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => (onExit ? onExit() : router.back())} aria-label="Youйти out of режима тренировки">
            <ChevronLeft size={18} />
            Назад
          </button>
          <div className={styles.title}>
            Practice — {projectTitle}
            <span className={styles.badge}>
              <span aria-hidden="true">✨</span> Practice
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.checkboxes}>
            <label className={styles.checkboxLabel} htmlFor="toggle-voice">
              <div className={styles.switch}>
                <input id="toggle-voice" type="checkbox" checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} aria-label="Включить голос" />
                <span className={styles.slider}></span>
              </div>
              Voice
            </label>
            <label className={styles.checkboxLabel} htmlFor="toggle-video">
              <div className={styles.switch}>
                <input id="toggle-video" type="checkbox" checked={videoEnabled} onChange={e => setVideoEnabled(e.target.checked)} aria-label="Включить видео" />
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
                  🔗 Trainee Link
                </button>
                <button className={styles.btnOutline} onClick={() => setShowConfigModal(true)}><Zap size={16} /> Settings</button>
                <button className={styles.btnOutline} onClick={() => setScenarioInput({
                  question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'any',
                  isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0
                })}><X size={16} /> Reset</button>

              </>
            )}
          </div>
        </div>
      </header>

      {/* MODE TOGGLE BAR */}
      <div className={styles.modeBar}>
        <div className={styles.modeToggle}>
          <span>Mode:</span>
          <div className={styles.segmentedControl}>
            <button
              className={`${styles.segmentBtn} ${mode === 'train' ? styles.active : ''}`}
              onClick={() => { setMode('train'); setMessages([]); setIsSessionActive(false); setGenerateFromContent(false); setScenarioInput(prev => ({ ...prev, question:'', expectedAnswer:'' })); }}
              aria-pressed={mode === 'train'}
              title="Configure questions and avatar behavior"
            >
              ⚙️ Coach
            </button>
            <button
              className={`${styles.segmentBtn} ${mode === 'practice' ? styles.active : ''}`}
              onClick={() => { setMode('practice'); setMessages([]); setIsSessionActive(false); }}
              aria-pressed={mode === 'practice'}
              title="Simulation: test from trainee's perspective"
            >
              🎯 Session Preview
            </button>
          </div>

          {mode === 'train' && (
            <label className={styles.generateToggle}>
              <div className={styles.switch}>
                <input type="checkbox" checked={generateFromContent} onChange={handleGenerateQuestionToggle} disabled={isGeneratingQuestion} />
                <span className={styles.slider}></span>
              </div>
              {isGeneratingQuestion ? 'Generating...' : 'Generate question from content'}
            </label>
          )}
        </div>

        <div className={styles.subtext}>
          {mode === 'practice'
            ? 'Preview: how the trainee sees the session. The avatar asks questions.'
            : 'Coach Mode: add questions, expected answers, and configure avatar behavior.'
          }
        </div>
      </div>

      {/* WORKSPACE */}
      <div className={styles.workspace}>
        {/* LEFT PANEL */}
        <main className={styles.leftPanel}>
          <div className={styles.slidePreview}>
            <div className={styles.slidePill}>Slide {activeSlideIndex + 1} / {Math.max(1, slides.length)}</div>
            <div className={styles.slideTitle}>{projectTitle}</div>
            {slides.length === 0 ? (
              <div className={styles.slideEmpty}>
                <FileText size={40} strokeWidth={1.5} />
                <div>No slides uploaded for the project yet.</div>
              </div>
            ) : (activeSlide?.image_url || activeSlide?.thumbnailUrl) ? (
              <img src={activeSlide.image_url || activeSlide.thumbnailUrl} alt={slideHeading || "Slide"} className={styles.slideImage} />
            ) : (
              <>
                {slideHeading && <h2 className={styles.slideHeadline}>{slideHeading}</h2>}
                <div className={styles.slideSubheadline}>
                  {activeSlideText.substring(0, 150)}{activeSlideText.length > 150 ? '…' : ''}
                </div>
              </>
            )}
            <div className={styles.slideFooter}>pitch-avatar.com</div>

            {/* DYNAMIC TEST OVERLAY (Listener Mode Only) */}
            {activeTestOptions && (
              <div className={styles.testOverlay}>
                <div className={styles.testOverlayTitle}>Dynamic test{slideHeading ? `: ${slideHeading}` : ''}</div>
                <div className={styles.testOptionsList}>
                  {activeTestOptions.map((opt, i) => (
                    <button
                      key={i}
                      className={styles.testOption}
                      onClick={() => handleSendMessage(opt)}
                      aria-label={`Вариант ответа ${String.fromCharCode(65 + i)}: ${opt}`}
                    >
                      {String.fromCharCode(65 + i)}: {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE LEVEL TRIGGERS RENDERING */}
            {slideTriggers.filter(t => t.type === 'show_test').map((t, idx) => (
              <div key={idx} className={styles.popQuiz}>
                <strong>Pop quiz!</strong>
                <div className={styles.popQuizList}>
                  {(t.data || []).map((opt: string, i: number) => (
                    <button key={i} className={styles.popQuizBtn} onClick={() => handleSendMessage(opt)}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <nav className={styles.pagination} aria-label="Slide navigation">
            <button className={styles.pageBtn} onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))} aria-label="Previous slide" disabled={activeSlideIndex === 0}>
              <ChevronLeft size={16} />
            </button>
            {slides.length > 0 ? getPaginationItems(activeSlideIndex, slides.length).map((item, idx) => (
              item === 'ellipsis' ? (
                <span key={`gap-${idx}`} className={styles.pageEllipsis} aria-hidden="true">…</span>
              ) : (
                <button
                  key={item}
                  className={`${styles.pageBtn} ${item === activeSlideIndex ? styles.active : ''}`}
                  onClick={() => setActiveSlideIndex(item)}
                  aria-label={`Go to slide ${item + 1}`}
                  aria-current={item === activeSlideIndex ? 'true' : undefined}
                >
                  {item + 1}
                </button>
              )
            )) : <button className={`${styles.pageBtn} ${styles.active}`} aria-current="true" aria-label="Slide 1">1</button>}
            <button className={styles.pageBtn} onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))} aria-label="Next slide" disabled={slides.length === 0 || activeSlideIndex >= slides.length - 1}>
              <ChevronLeft size={16} className={styles.flipIcon} />
            </button>
          </nav>
        </main>

        {/* RIGHT PANEL */}
        <aside className={styles.rightPanel}>
          {mode === 'train' && (
            <div className={styles.tabs} role="tablist" aria-label="Avatar panel" onKeyDown={handleTabKeyDown}>
              <button
                ref={chatTabRef}
                id="coach-tab-chat"
                role="tab"
                aria-selected={activeTab === 'chat'}
                aria-controls="coach-panel-chat"
                tabIndex={activeTab === 'chat' ? 0 : -1}
                className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                Coach
              </button>
              <button
                ref={kbTabRef}
                id="coach-tab-scenarios"
                role="tab"
                aria-selected={activeTab === 'scenarios'}
                aria-controls="coach-panel-scenarios"
                tabIndex={activeTab === 'scenarios' ? 0 : -1}
                className={`${styles.tab} ${activeTab === 'scenarios' ? styles.active : ''}`}
                onClick={() => setActiveTab('scenarios')}
              >
                Scenarios
              </button>
              <button
                id="coach-tab-knowledge"
                role="tab"
                aria-selected={activeTab === 'knowledge'}
                aria-controls="coach-panel-knowledge"
                tabIndex={activeTab === 'knowledge' ? 0 : -1}
                className={`${styles.tab} ${activeTab === 'knowledge' ? styles.active : ''}`}
                onClick={() => setActiveTab('knowledge')}
              >
                Knowledge Base
              </button>
            </div>
          )}

          {activeTab === 'chat' ? (
            <div className={styles.chatColumn} role="tabpanel" id="coach-panel-chat" aria-labelledby="coach-tab-chat">
              {mode === 'practice' && !isSessionActive ? (
                <div className={styles.chatArea}>
                  <div className={styles.introCard}>
                    <div className={styles.introIcon}><Bot size={36} /></div>
                    <h3 className={styles.introTitle}>Ready for practice?</h3>
                    <p className={styles.introDesc}>
                      The avatar will ask questions sequentially — answer as accurately as possible.
                      After answering, you will receive feedback from the AI coach.
                    </p>
                    {savedScenarios.length > 0 && (
                      <div className={styles.introCount}>
                        <CheckSquare size={14} />
                        {savedScenarios.length} question(s) from the coach will be asked sequentially
                      </div>
                    )}
                    <button
                      className={styles.introStart}
                      onClick={() => handleSendMessage(undefined, true)}
                      disabled={isEvaluating}
                    >
                      {isEvaluating ? 'Starting...' : 'Start practice'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.chatArea} role="log" aria-live="polite" aria-label="Dialogue">
                    {renderChatBody()}
                  </div>

                  {mode === 'practice' && isSessionActive && (
                    <div className={styles.inputArea}>
                      <label className={styles.attachLabel}>
                        <input
                          type="checkbox"
                          checked={attachSlide}
                          onChange={e => setAttachSlide(e.target.checked)}
                          aria-label="Attach current slide"
                        />
                        Attach current slide (Slide {activeSlide.id})
                      </label>

                      <div className={styles.inputBox}>
                        {voiceEnabled && (
                          <button
                            type="button"
                            className={`${styles.micBtn} ${isRecording ? styles.micBtnActive : ''}`}
                            aria-label="Voice input"
                            title="Voice input"
                            onClick={handleVoiceInput}
                          >
                            <Mic size={16} />
                          </button>
                        )}
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="Type a message..."
                          value={chatMessage}
                          onChange={e => setChatMessage(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                          className={`${styles.sendBtn} ${chatMessage ? styles.sendBtnActive : ''}`}
                          onClick={() => handleSendMessage()}
                          aria-label="Send message"
                          disabled={isEvaluating}
                        >
                          <ArrowUp size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'scenarios' ? (
            <div className={styles.chatArea} role="tabpanel" id="coach-panel-scenarios" aria-labelledby="coach-tab-scenarios">
              {savedScenarios.length === 0 ? (
                <div className={styles.kbEmpty}>
                  <Database size={36} strokeWidth={1.5} />
                  <div>No saved questions yet.</div>
                  <p>Add questions and expected answers in 'Coach Setup' mode.</p>
                </div>
              ) : (
                <>
                  <div className={styles.kbHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Database size={15} />
                      Scenarios · {savedScenarios.length}
                    </div>
                    <select 
                      className={styles.modalInput}
                      style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem', marginTop: 0 }}
                      value={sessionConfig.questionOrder}
                      onChange={(e) => setSessionConfig({...sessionConfig, questionOrder: e.target.value as 'sequential' | 'random'})}
                    >
                      <option value="sequential">Sequential</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                  <ul className={styles.kbList}>
                    {savedScenarios.map((sc, i) => (
                      <li key={sc.id} className={styles.kbItem}>
                        <div className={styles.kbQuestion}>
                          <span className={styles.kbIndex}>{i + 1}</span>
                          <span className={styles.kbQuestionText}>{sc.question_text}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className={styles.kbEditBtn} disabled={i === 0} onClick={() => handleMoveScenario(sc.id, 'up')} title="Up"><ArrowUp size={14} /></button>
                            <button className={styles.kbEditBtn} disabled={i === savedScenarios.length - 1} onClick={() => handleMoveScenario(sc.id, 'down')} title="Down"><ArrowDown size={14} /></button>
                            <button 
                              className={styles.kbEditBtn}
                              onClick={() => {
                                setScenarioInput({
                                  question: sc.question_text,
                                  expectedAnswer: sc.expected_answer,
                                  targetSlideId: sc.expected_slide_id === 'any' ? 'any' : (sc.expected_slide_id ? 'current' : 'any'),
                                  reactionType: 'text',
                                  reactionData: '',
                                  isTest: false,
                                  testOptions: ['', '', ''],
                                  correctOptionIndex: 0
                                });
                              }}
                              title="Test / Edit"
                              aria-label="Test question"
                            >
                              <Zap size={14} />
                            </button>
                          </div>
                        </div>
                        {sc.expected_answer && (
                          <div className={styles.kbAnswer}>
                            <span className={styles.kbAnswerLabel}>Expected answer</span>
                            {sc.expected_answer}
                          </div>
                        )}
                        {sc.expected_slide_id != null && (
                          <div className={styles.kbSlideTag}>
                            <FileText size={12} />
                            {sc.expected_slide_id === 'any' ? 'Any slide' : `Slide ${sc.expected_slide_id}`}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : activeTab === 'knowledge' ? (
            <div className={styles.chatArea} role="tabpanel" id="coach-panel-knowledge" aria-labelledby="coach-tab-knowledge" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button 
                  className={`${styles.tab} ${kbInputType === 'url' ? styles.active : ''}`}
                  onClick={() => setKbInputType('url')}
                  style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                >
                  <Globe size={14} /> URL
                </button>
                <button 
                  className={`${styles.tab} ${kbInputType === 'file' ? styles.active : ''}`}
                  onClick={() => setKbInputType('file')}
                  style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                >
                  <Upload size={14} /> File
                </button>
                <button 
                  className={`${styles.tab} ${kbInputType === 'text' ? styles.active : ''}`}
                  onClick={() => setKbInputType('text')}
                  style={{ flex: 1, justifyContent: 'center', gap: '6px' }}
                >
                  <Type size={14} /> Text
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                {kbInputType === 'url' && (
                  <input 
                    type="url" 
                    className={styles.modalInput} 
                    placeholder="https://..." 
                    value={kbInputValue}
                    onChange={(e) => setKbInputValue(e.target.value)}
                  />
                )}
                {kbInputType === 'file' && (
                  <input 
                    type="file" 
                    className={styles.modalInput} 
                    onChange={(e) => setKbInputValue(e.target.value)}
                    style={{ paddingTop: '8px' }}
                  />
                )}
                {kbInputType === 'text' && (
                  <textarea 
                    className={styles.modalTextarea} 
                    placeholder="Paste knowledge base text..." 
                    value={kbInputValue}
                    onChange={(e) => setKbInputValue(e.target.value)}
                    rows={6}
                  />
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className={styles.primaryBtn} 
                  style={{ padding: '8px 16px', borderRadius: '6px' }}
                  onClick={() => {
                    alert('Knowledge Base addition will be implemented later (requires RAG backend)');
                    setKbInputValue('');
                  }}
                >
                  Add
                </button>
                <button 
                  className={styles.secondaryBtn}
                  style={{ padding: '8px 16px', borderRadius: '6px' }}
                  onClick={() => setKbInputValue('')}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {showConfigModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-config-title"
          onClick={() => setShowConfigModal(false)}
        >
          <div className={styles.modal} ref={modalRef} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} id="coach-config-title">Session Settings</h2>
              <button className={styles.modalClose} aria-label="Close" onClick={() => setShowConfigModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel} htmlFor="cfg-listener">Trainee Name</label>
              <input
                id="cfg-listener"
                type="text"
                className={styles.modalInput}
                value={sessionConfig.listenerName}
                onChange={e => setSessionConfig({...sessionConfig, listenerName: e.target.value})}
              />
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel} htmlFor="cfg-language">Session Language</label>
              <select
                id="cfg-language"
                className={styles.modalInput}
                value={sessionConfig.language}
                onChange={e => setSessionConfig({...sessionConfig, language: e.target.value})}
              >
                <option value="Russian">Russian</option>
                <option value="Ukrainian">Ukrainian</option>
                <option value="English">English</option>
                <option value="Romanian">Romanian</option>
              </select>
            </div>

            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel} htmlFor="cfg-role">Avatar Role (Coach)</label>
              <select
                id="cfg-role"
                className={styles.modalInput}
                value={sessionConfig.coachRole}
                onChange={e => setSessionConfig({...sessionConfig, coachRole: e.target.value})}
              >
                {ROLE_TEMPLATES.map(t => (
                  <option key={t.role} value={t.role}>{t.label} ({t.role})</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="cfg-persona">Buyer Persona</label>
                <select
                  id="cfg-persona"
                  className={styles.modalInput}
                  value={sessionConfig.buyerPersona}
                  onChange={e => setSessionConfig({...sessionConfig, buyerPersona: e.target.value as any})}
                >
                  <option value="none">None (Default)</option>
                  <option value="skeptic">Skeptic</option>
                  <option value="budget_controller">Budget Controller</option>
                  <option value="technical">Technical Expert</option>
                  <option value="friendly">Friendly</option>
                  <option value="negotiator">Aggressive Negotiator</option>
                </select>
              </div>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="cfg-start-mode">Start Mode</label>
                <select
                  id="cfg-start-mode"
                  className={styles.modalInput}
                  value={sessionConfig.startMode}
                  onChange={e => setSessionConfig({...sessionConfig, startMode: e.target.value as any})}
                >
                  <option value="avatar_asks_first">Avatar starts</option>
                  <option value="seller_asks_first">Seller starts</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="cfg-order">Question Order</label>
                <select
                  id="cfg-order"
                  className={styles.modalInput}
                  value={sessionConfig.questionOrder}
                  onChange={e => setSessionConfig({...sessionConfig, questionOrder: e.target.value as 'sequential' | 'random'})}
                >
                  <option value="sequential">Sequential</option>
                  <option value="random">Random</option>
                </select>
              </div>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="cfg-limit">Question Limit</label>
                <input
                  id="cfg-limit"
                  type="number"
                  min="0"
                  className={styles.modalInput}
                  value={sessionConfig.questionLimit}
                  onChange={e => setSessionConfig({...sessionConfig, questionLimit: parseInt(e.target.value, 10) || 0})}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="cfg-score">Show Score</label>
                <select
                  id="cfg-score"
                  className={styles.modalInput}
                  value={sessionConfig.showScore}
                  onChange={e => setSessionConfig({...sessionConfig, showScore: e.target.value as 'immediate' | 'end' | 'never'})}
                >
                  <option value="immediate">Immediate</option>
                  <option value="end">At the end of session</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="cfg-answer">Show Correct Answer</label>
                <select
                  id="cfg-answer"
                  className={styles.modalInput}
                  value={sessionConfig.showCorrectAnswer}
                  onChange={e => setSessionConfig({...sessionConfig, showCorrectAnswer: e.target.value as 'immediate' | 'end' | 'never'})}
                >
                  <option value="immediate">Immediate</option>
                  <option value="end">At the end of session</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSolid} onClick={() => setShowConfigModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS OVERLAY */}
      {showResults && (
        <div className={styles.resultsOverlay}>
          <div className={styles.resultsCard}>
            <div className={styles.resultsScore}>{finalScore}%</div>
            <div className={styles.resultsSubtitle}>
              Average Score
            </div>
            
            <div className={styles.resultsDetails}>
               <h3 className={styles.resultsHeader}>Question Breakdown:</h3>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {sessionLogs.map((log, idx) => (
                   <div key={idx} className={`${styles.resultLogItem} ${log.isCorrect ? styles.correct : styles.incorrect}`}>
                     <div className={styles.logQuestion}>
                        Q: {log.question}
                     </div>
                     <div className={styles.logUserAnswer}>
                        Your Answer: <span>{log.userAnswer}</span>
                     </div>
                     <div className={`${styles.logStatus} ${log.isCorrect ? styles.correct : styles.incorrect}`}>
                        {log.isCorrect ? <><CheckCircle size={14} /> Correct</> : <><XCircle size={14} /> Error</>}
                        <span style={{ marginLeft: 8, fontSize: '0.9em', opacity: 0.8 }}>({log.score}%)</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className={styles.resultsActions}>
              <button 
                className={styles.retryBtn} 
                onClick={() => {
                  setShowResults(false);
                  setIsSessionActive(false);
                  setMessages([]);
                  setScenarioQueue([]);
                  setCurrentScenarioIndex(0);
                  setSessionLogs([]);
                  setFinalScore(0);
                  handleStartTraining();
                }}
              >
                Try Again
              </button>
              <button 
                className={styles.closeBtn} 
                onClick={() => {
                  setShowResults(false);
                  setIsSessionActive(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainModeUI;
