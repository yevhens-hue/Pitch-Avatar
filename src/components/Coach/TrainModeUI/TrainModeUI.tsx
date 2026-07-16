'use client'

import React, { useState, useEffect, useRef } from 'react';
import styles from './TrainModeUI.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Plus, X, Bot, ArrowUp, ArrowDown, Database, Zap, ChevronsUpDown, Mic, Check, FileText, CheckSquare, Globe, Upload, Type, CheckCircle, XCircle, AlertTriangle, Target, Calendar, Phone, Play, Square, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getProjectById } from '@/app/actions/projects';
import { supabase } from '@/lib/supabase';
import { ROLE_TEMPLATES, CoachEvaluation } from '@/types/coach';
import { useUIStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { useCoachStore } from '@/lib/useCoachStore';

type Mode = 'practice' | 'train';

interface TrainModeUIProps {
  projectId: string;
  /** Optional pre-loaded slides (otherwise fetched via getProjectById) */
  slides?: Slide[];
  /** Optional custom exit handler; falls back to router.back() */
  onExit?: () => void;
  /** Open directly in 'practice' (trainee) mode instead of 'train' (coach builder) */
  initialMode?: Mode;
}

interface SlideTrigger {
  type?: string;
  message?: string;
  delay?: number;
  data?: string[];
}

interface Slide {
  id: string | number;
  text?: string;
  title?: string;
  image_url?: string;
  thumbnailUrl?: string;
  metadata?: {
    triggers?: SlideTrigger[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SessionLog {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
}

/** Actions тренера над сообщением аватара. */
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
  evaluation?: CoachEvaluation;
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

export default function TrainModeUI({ projectId, slides: initialSlides, onExit, initialMode }: TrainModeUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { isFutureVersion } = useUIStore();
  const { settings } = useCoachStore();
  // Support ?mode=practice from enrollment links so listeners start in trainee mode
  const urlMode = searchParams.get('mode') as Mode | null;
  const [mode, setMode] = useState<Mode>(initialMode ?? (urlMode === 'practice' ? 'practice' : 'train'));
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
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);

  // Session Config
  const [sessionConfig, setSessionConfig] = useState({
    listenerName: 'John Doe',
    language: 'English',
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
  const [finalScore, setFinalScore] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  // Auto-scroll anchor for the chat log + a synchronous tally of correct
  // answers (used for the final score to avoid relying on stale setState).
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const correctCountRef = useRef(0);
  // Refs to avoid stale closures in async handlers (scenarioQueue / currentScenarioIndex
  // are set via setState which is async; refs always hold the latest values).
  const scenarioQueueRef = useRef<Array<{id: string; question_text: string; expected_answer: string; expected_slide_id?: string | number}>>([]);
  const currentScenarioIndexRef = useRef(0);

  // A11y refs: settings modal (focus-trap) + tab buttons (roving focus).
  const modalRef = useRef<HTMLDivElement>(null);
  const chatTabRef = useRef<HTMLButtonElement>(null);
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
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'practice' && isSessionActive && settings?.sessionDurationLimit) {
      if (timeRemaining === null) {
        setTimeRemaining(settings.sessionDurationLimit * 60);
      }
    } else if (!isSessionActive) {
      setTimeRemaining(null);
    }
  }, [mode, isSessionActive, settings?.sessionDurationLimit, timeRemaining]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSessionActive && timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            // We use a timeout to avoid calling state updates during render
            setTimeout(() => handleTimeUp(), 0);
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive, timeRemaining]);

  const handleTimeUp = () => {
    const total = scenarioQueue.length || sessionScore.total || 1;
    const correct = correctCountRef.current;
    const finalText = `⏰ Time is up!\n\n**Your result:** ${correct} out of ${total} correct answers.`;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'avatar',
      text: finalText,
      type: 'regular',
    }]);
    setIsSessionActive(false);
    setTimeout(() => setShowResults(true), 1500);
  };

  // Train Mode Check Answer panel state
  const [testAnswer, setTestAnswer] = useState('');
  const [testResult, setTestResult] = useState<{isCorrect?: boolean, avatarResponse?: string} | null>(null);

  const handleCheckAnswer = async () => {
    if (!testAnswer || !scenarioInput.expectedAnswer) {
      showToast('Enter expected answer and test answer to verify', 'error');
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
      console.error(err);
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
      // Load saved scenarios for Knowledge Base tab (avoid order_index which may not exist)
      supabase.from('buyer_scenarios').select('id, question_text, expected_answer, expected_slide_id, custom_actions').eq('project_id', projectId)
        .then(({ data, error }) => {
          if (error) console.error('Sidebar scenarios load error:', error);
          if (data) setSavedScenarios(data);
        });
    }
  }, [projectId]);

  const activeSlide = slides[activeSlideIndex] || { id: 1, text: 'No slide content' };
  const activeSlideText = activeSlide.text || '';
  const slideHeading = (activeSlide.title || '').trim();
  const slidePreviewLines = activeSlideText
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
  const stageTitle = slideHeading || slidePreviewLines[0] || 'Presentation preview';
  const stageSubtitle = slidePreviewLines[1] || 'Use the conversation on the right to rehearse this moment with the coach.';
  const stageHighlights = slidePreviewLines.slice(slideHeading ? 0 : 2).slice(0, 3);

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
  const [slideTriggers, setSlideTriggers] = useState<SlideTrigger[]>([]);
  useEffect(() => {
    const triggers = activeSlide.metadata?.triggers;
    if (Array.isArray(triggers)) {
      setSlideTriggers(triggers);
      // Execute auto-triggers
      triggers.forEach((trigger) => {
        if (trigger.type === 'alert' && trigger.delay) {
          setTimeout(() => showToast(trigger.message || 'Trigger activated!'), trigger.delay);
        }
      });
    } else {
      setSlideTriggers([]);
    }
  }, [activeSlideIndex, activeSlide, showToast]);

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
            { id: Date.now().toString(), role: 'user', text: `[Mode: avatar generates questions from content]\n${q.questionText}`, type: 'regular' }
          ]);
        }
      } catch (err) {
        console.error(err);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as typeof window & { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition || (window as typeof window & { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = sessionConfig.language === 'Russian' ? 'ru-RU' : sessionConfig.language === 'Ukrainian' ? 'uk-UA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      showToast('Listening...', 'success');
    };

    recognition.onresult = (event: { results: { transcript: string }[][] }) => {
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
        let delivery = sessionConfig.questionOrder;
        let limit = sessionConfig.questionLimit;
        
        // Fetch coach settings from project metadata
        const { data: projectData } = await supabase
          .from('projects')
          .select('metadata')
          .eq('id', projectId)
          .single();

        const dbSettings = projectData?.metadata?.coachSettings as import('@/types/coach').CoachSettings | undefined;

        if (dbSettings) {
          delivery = dbSettings.questionDelivery || delivery;
          limit = dbSettings.maxQuestions || limit;
          
          // Populate the Zustand store so timer and display flags work
          useCoachStore.getState().setSettings({ ...dbSettings, projectId });
          
          setSessionConfig(prev => ({
            ...prev,
            questionOrder: delivery,
            questionLimit: limit,
            coachRole: dbSettings.traineeRoleId || prev.coachRole,
          }));
        }

        // ── Load ALL scenarios from buyer_scenarios (single source of truth) ──
        // buyer_scenarios contains BOTH Q&A editor and Train Builder records.
        // We intentionally do NOT filter by source — all 22 scenarios should be available.
        // order_index column may not exist in older DB schemas; we read order from custom_actions.orderIndex.
        const { data: allScenarios, error: scenariosError } = await supabase
          .from('buyer_scenarios')
          .select('id, question_text, expected_answer, expected_slide_id, custom_actions')
          .eq('project_id', projectId)
          .not('question_text', 'is', null)
          .not('question_text', 'eq', '')
          .not('question_text', 'eq', 'Question?');

        if (scenariosError) console.error('[Coach] Failed to load scenarios:', scenariosError);
        console.log(`[Coach] Loaded ${allScenarios?.length ?? 0} scenarios from buyer_scenarios`);

        let queue = allScenarios || [];

        // ── Filter to match Coach Q&A Slide Inspector ──
        // Only ask questions assigned to the current slide being viewed.
        queue = queue.filter(q => String(q.expected_slide_id) === String(activeSlide.id));

        // ── Sort to match Coach Q&A panel order ──
        // metadata.coachScenarios is the canonical order (mirrors the panel exactly).
        // buyer_scenarios may have extra records (Train Builder) that weren't in the last
        // Q&A save. Those go to the end.
        const metaScenarios: Array<{id: string, questionText?: string}> =
          (projectData?.metadata?.coachScenarios as Array<{id: string, questionText?: string}> | undefined) || [];

        if (delivery === 'random') {
          queue = queue.sort(() => Math.random() - 0.5);
        } else {
          // Rebuild queue exactly matching metadata.coachScenarios order
          // Match by id first, then fallback to question_text due to UUID regeneration in coachActions
          const orderedQueue: any[] = [];
          const remaining = [...queue];

          for (const meta of metaScenarios) {
            const mText = meta.questionText?.trim();
            const matchIdx = remaining.findIndex(s => 
              s.id === meta.id || 
              (mText && s.question_text?.trim() === mText)
            );
            
            if (matchIdx !== -1) {
              orderedQueue.push(remaining[matchIdx]);
              remaining.splice(matchIdx, 1);
            }
          }
          
          // Append any leftovers
          orderedQueue.push(...remaining);
          queue = orderedQueue;
        }

        if (limit > 0) {
          queue = queue.slice(0, limit);
        }

        scenarioQueueRef.current = queue;
        currentScenarioIndexRef.current = 0;
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
            text: data.avatarResponse || "Let's start. Tell me about your product.",
            type: 'evaluation',
            expectedAnswer: data.expectedAnswer,
            expectedSlideId: data.expectedSlideId,
            testOptions: data.testOptions,
            reactionType: data.reactionType,
            reactionData: data.reactionData,
            scenarioProgress: { current: 1, total: queue.length || 1 }
          }]);
        }
      } catch (error) {
        console.error(error);
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
      // Use refs (not state) to read the current scenario — avoids stale closure
      // where scenarioQueue / currentScenarioIndex haven't propagated yet.
      const currentScenario = scenarioQueueRef.current[currentScenarioIndexRef.current] ?? null;

      const res = await fetch('/api/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await supabase.auth.getSession()).data.session?.access_token ? { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` } : {} },
        body: JSON.stringify({
          projectId,
          slideId: currentScenario?.expected_slide_id ?? activeSlide.id,
          userMessage: attachSlide ? `[Slide attached ${activeSlide.id}] ${text}` : text,
          contextMode: 'strict',
          listenerName: sessionConfig.listenerName,
          language: sessionConfig.language,
          coachRole: sessionConfig.coachRole,
          isInitiation: false,
          activeScenarioId: currentScenario?.id,
        }),
      });
      const data = await res.json();

      // Add evaluation feedback to the last user message, then add avatar response
      setMessages(prev => {
        const next = [...prev];
        const lastUserIdx = next.findLastIndex(m => m.role === 'user');
        if (lastUserIdx >= 0) {
          next[lastUserIdx] = {
            ...next[lastUserIdx],
            type: 'evaluation',
            evaluation: data.evaluation,
            expectedAnswer: data.expectedAnswer,
            expectedSlideId: data.expectedSlideId,
            isCorrect: data.isCorrect,
            revealAnswer: true,
            reactionType: data.reactionType,
            reactionData: data.reactionData
          };
        }
        
        return next;
      });

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
      const nextIndex = currentScenarioIndexRef.current + 1;
      if (nextIndex < scenarioQueueRef.current.length) {
        currentScenarioIndexRef.current = nextIndex;
        setCurrentScenarioIndex(nextIndex);
        setTimeout(() => {
          const nextQ = scenarioQueueRef.current[nextIndex];
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            role: 'avatar',
            text: nextQ.question_text,
            type: 'evaluation',
            expectedAnswer: nextQ.expected_answer,
            expectedSlideId: nextQ.expected_slide_id,
            scenarioProgress: { current: nextIndex + 1, total: scenarioQueueRef.current.length },
          }]);
        }, 800);
      } else if (scenarioQueueRef.current.length > 0) {
        const total = scenarioQueueRef.current.length;
        const correct = correctCountRef.current;
        let finalText: string;
        if (sessionConfig.showScore === 'end') {
          finalText = `✅ Practice completed!\n\n**Your result:** ${correct} out of ${total} correct answers.`;
        } else if (settings?.feedbackFlags?.immediateFeedback) {
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
          setIsSessionActive(false);
          setTimeout(() => setShowResults(true), 1500);
        }, 800);
      }

    } catch (error) {
      console.error(error);
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
        orderIndex: savedScenarios.length,
        id: editingScenarioId || undefined
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
      // Update local list (optimistic update)
      if (editingScenarioId) {
        setSavedScenarios(prev => prev.map(s => s.id === editingScenarioId ? {
          ...s,
          question_text: scenarioInput.question,
          expected_answer: scenarioInput.expectedAnswer,
          expected_slide_id: scenarioInput.targetSlideId === 'current' ? activeSlide.id : (scenarioInput.targetSlideId === 'any' ? 'any' : undefined),
        } : s));
        setEditingScenarioId(null);
      } else {
        setSavedScenarios(prev => [{
          id: Date.now().toString(),
          question_text: scenarioInput.question,
          expected_answer: scenarioInput.expectedAnswer,
          expected_slide_id: scenarioInput.targetSlideId === 'current' ? activeSlide.id : (scenarioInput.targetSlideId === 'any' ? 'any' : undefined),
          save_target: saveTarget
        }, ...prev]);
      }
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
        console.error(err);
        showToast(`Failed: ${ACTION_LABELS[action]}`, 'error');
      }
    } else {
      showToast(ACTION_LABELS[action]);
    }
  };

  const handleKnowledgeBaseAdd = () => {
    showToast('Knowledge Base addition will be implemented later (requires RAG backend)');
    setKbInputValue('');
  };

  // Determine active test options
  const lastMessage = messages[messages.length - 1];
  const activeTestOptions = (mode === 'practice' && lastMessage?.testOptions) ? lastMessage.testOptions : null;

  const renderChatBody = () => {
    // Score pill: show correct/total + percentage
    const answeredCount = sessionLogs.length;
    const totalCount = sessionScore.total || scenarioQueue.length || 12;
    const pct = finalScore || 0;
    const showRemaining = settings?.showRemainingQuestions !== false;
    const scoreTextPart = showRemaining ? `${answeredCount} / ${totalCount}` : `${answeredCount}`;
    const scorePillText = `${scoreTextPart} · ${pct}%`;

    return (
    <>
      <div className={styles.chatHeaderBar} style={{ justifyContent: 'center', gap: '16px' }}>
        {settings?.feedbackFlags?.alwaysShowScore !== false && (
          <div className={styles.scorePill}>
            <Target size={14} />
            {scorePillText}
          </div>
        )}
        {timeRemaining !== null && (
          <div className={styles.scorePill} style={{ color: timeRemaining < 60 ? '#ef4444' : 'inherit' }}>
            <span style={{ fontWeight: 'bold' }}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

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

          {msg.role === 'user' ? (
            <div className={styles.userMessageContainer}>
              <div className={styles.userMessageHeader}>
                You · {new Date(((msg as unknown) as Record<string, unknown>).createdAt as number || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className={styles.userMessage}>
                {msg.text}
              </div>
              
              {/* Feedback Block below user message */}
              {msg.type === 'evaluation' && settings?.feedbackFlags?.immediateFeedback !== false ? (
                <div className={styles.inlineFeedback}>
                  <div className={styles.inlineFeedbackScore}>
                    {(msg.evaluation ? msg.evaluation.score === 100 : msg.isCorrect)
                      ? <CheckCircle size={16} className={styles.feedbackIconCorrect} />
                      : <AlertTriangle size={16} className={styles.feedbackIconPartial} />}
                    <span>
                      {msg.evaluation 
                        ? (msg.evaluation.score === 100 
                            ? `Excellent · 5 points (5/5)`
                            : `Almost there · ${Math.round((msg.evaluation.score / 100) * 5)}/5 points`)
                        : (msg.isCorrect ? 'Correct answer' : 'Needs improvement')}
                    </span>
                  </div>
                  {msg.expectedAnswer && settings?.feedbackFlags?.showCorrectAnswers !== false && (
                    <div className={styles.inlineFeedbackCorrectAnswer}>
                      <b>Suggested answer:</b> {msg.expectedAnswer}
                    </div>
                  )}
                  {msg.evaluation?.feedback && (
                    <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                      {msg.evaluation.feedback}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className={styles.avatarResponseContainer}>

              <div className={styles.avatarMessageHeader}>
                {sessionConfig.coachRole === 'buyer' || !sessionConfig.coachRole ? 'CFO' : sessionConfig.coachRole.toUpperCase()} · {settings?.showRemainingQuestions !== false ? (msg.scenarioProgress ? `Q${msg.scenarioProgress.current}/${msg.scenarioProgress.total}` : `Q${currentScenarioIndex + 1}/${scenarioQueue.length || 1}`) : (msg.scenarioProgress ? `Q${msg.scenarioProgress.current}` : `Q${currentScenarioIndex + 1}`)}
              </div>
              <div className={styles.avatarMessage}>{renderFormattedText(msg.text)}</div>

              {msg.type === 'evaluation' && msg.isCorrect === false && msg.expectedAnswer && (
                <div className={styles.revealWrap}>
                  {!msg.revealAnswer ? (
                    <button
                      className={styles.revealBtn}
                      onClick={() => setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, revealAnswer: true } : m))}
                    >
                      Show correct answer
                    </button>
                  ) : (
                    <div className={styles.revealBox}>
                      <span className={styles.revealLabel}>Correct answer</span>
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
                  <FileText size={13} /> Switch to slide {msg.reactionData}
                </div>
              )}

              {mode === 'train' && (
                <>
                  {/* Action Buttons Row */}
                  <div className={styles.messageActions}>
                    <button className={styles.actionBtn} onClick={() => handleAction('confirm')}>
                      <Check size={14} /> Confirm
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleAction('reject')}>
                      <X size={14} /> Reject and cancel
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleAction('save-storage', msg.text)}>
                      <Database size={14} /> Q&A → Storage
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleAction('save-instruction', msg.text)}>
                      <FileText size={14} /> As instruction
                    </button>
                  </div>

                  {/* Answer with Avatar Voice Widget */}
                  <div className={styles.voiceBar}>
                    <div className={styles.voiceDragIcon}>
                      <ChevronsUpDown size={14} />
                    </div>
                    <div className={styles.voiceTextWrapper}>
                      <Mic size={16} />
                      <span>Answer with avatar voice</span>
                    </div>
                    <div className={styles.tagGroup}>
                      <span className={styles.tagReaction}>Reaction</span>
                      <span className={styles.tagTraining}>Training</span>
                    </div>
                    <div className={styles.voiceControls}>
                      <button className={styles.controlIconBtn} aria-label="Accept"><Check size={14} /></button>
                      <button className={styles.controlIconBtn} aria-label="Reject"><X size={14} /></button>
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
              <label className={styles.formLabel}>Answer options</label>
              {scenarioInput.testOptions.map((opt, i) => (
                <div key={i} className={styles.testOptionRow}>
                  <input
                    type="radio"
                    name="correctOption"
                    checked={scenarioInput.correctOptionIndex === i}
                    onChange={() => setScenarioInput({...scenarioInput, correctOptionIndex: i})}
                    aria-label={`Correct option ${i + 1}`}
                  />
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder={`Option ${i + 1}`}
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
                placeholder="What the trainee should answer..."
                value={scenarioInput.expectedAnswer}
                onChange={e => setScenarioInput({...scenarioInput, expectedAnswer: e.target.value})}
              />
              {extractTemplateVariables(scenarioInput.expectedAnswer).length > 0 && (
                <div className={styles.paramHint}>
                  <span className={styles.paramHintLabel}>Parameters found:</span>
                  {extractTemplateVariables(scenarioInput.expectedAnswer).map(v => (
                    <span key={v} className={styles.paramTag}>{v}</span>
                  ))}
                </div>
              )}
            </>
          )}

          {isFutureVersion && (
            <div className={styles.fieldBlock}>
              <label className={styles.formLabel}>Slide binding (optional)</label>
              <select
                className={styles.inputField}
                value={scenarioInput.targetSlideId}
                onChange={e => setScenarioInput({...scenarioInput, targetSlideId: e.target.value as 'current' | 'any' | 'none'})}
              >
                <option value="any">No binding (any slide)</option>
                <option value="current">Current slide ({activeSlide.id})</option>
                <option value="none">Chat only (no slide)</option>
              </select>
            </div>
          )}

          <div className={styles.fieldRow}>
            <div className={styles.fieldCol}>
              <label className={styles.formLabel}>Reaction type</label>
              <select
                className={styles.inputField}
                value={scenarioInput.reactionType}
                onChange={e => setScenarioInput({...scenarioInput, reactionType: e.target.value as 'text' | 'slide' | 'video'})}
              >
                <option value="text">Text response</option>
                <option value="slide">Show slide</option>
                <option value="video">Play video</option>
              </select>
            </div>
            {(scenarioInput.reactionType === 'slide' || scenarioInput.reactionType === 'video') && (
              <div className={styles.fieldCol}>
                <label className={styles.formLabel}>{scenarioInput.reactionType === 'slide' ? 'Slide ID' : 'Video URL'}</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder={scenarioInput.reactionType === 'slide' ? 'e.g.: 2' : 'e.g.: https://...'}
                  value={scenarioInput.reactionData}
                  onChange={e => setScenarioInput({...scenarioInput, reactionData: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className={styles.editorActions}>
            <Button variant="secondary" onClick={() => setScenarioInput({ question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'current', isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0 })}>
              <X size={16} /> Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSaveScenario('scenario')}>
              {editingScenarioId ? <Check size={16} /> : <Plus size={16} />} 
              {editingScenarioId ? 'Update Scenario' : 'Save as Scenario'}
            </Button>
          </div>

          {/* Test Answer Panel */}
          {isFutureVersion && (
            <div className={styles.testPanel}>
              <h4 className={styles.testPanelTitle}>Answer evaluation testing</h4>
              <p className={styles.testPanelDesc}>
                Check how the system will evaluate the student&apos;s test answer based on your expected answer.
              </p>
              <div className={styles.fieldBlock}>
                <textarea
                  className={styles.inputField}
                  placeholder="Enter student&apos;s test answer..."
                  value={testAnswer}
                  onChange={e => setTestAnswer(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.testPanelActions}>
                <Button 
                  variant="secondary"
                  onClick={handleCheckAnswer}
                  disabled={testResult?.avatarResponse === 'Evaluating...' || !scenarioInput.question || !testAnswer}
                >
                  {testResult?.avatarResponse === 'Evaluating...' ? 'Checking...' : 'Check answer'}
                </Button>
              </div>
              {testResult && testResult.avatarResponse !== 'Evaluating...' && (
                <div className={`${styles.testFeedback} ${testResult.isCorrect ? styles.testFeedbackOk : styles.testFeedbackBad}`}>
                  <div className={styles.testFeedbackTitle}>
                    {testResult.isCorrect ? '✅ Answer accepted' : '❌ Answer rejected'}
                  </div>
                  <p>{testResult.avatarResponse}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div ref={chatBottomRef} />
    </>
    );
  };

  return (
    <div className={styles.container}>
      {/* SCORE PILL */}
      {mode === 'practice' && isSessionActive && (
        <div className={styles.floatingScorePill} style={{ display: 'flex', gap: '12px' }}>
          {settings?.feedbackFlags?.alwaysShowScore !== false && sessionScore.total > 0 && (
            <div>
              Score: {Math.round((sessionScore.correct / sessionScore.total) * 100)}% <span>({settings?.showRemainingQuestions !== false ? `${sessionScore.correct}/${sessionScore.total}` : sessionScore.correct})</span>
            </div>
          )}
          {timeRemaining !== null && (
            <div style={{ color: timeRemaining < 60 ? '#ef4444' : 'inherit', fontWeight: 'bold' }}>
              ⏱ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      )}

      {/* HEADER */}
      <header className={styles.header}>
        {mode === 'practice' ? (
          <>
            <div className={styles.practiceHeaderLeft}>
              <div className={styles.logoCircle}>P</div>
              <div className={styles.logoText}>
                <span>Pitch</span>
                <span>Avatar</span>
              </div>
            </div>
            <div className={styles.practiceHeaderRight}>
              Coach session · {projectTitle}
            </div>
          </>
        ) : (
          <>
            <div className={styles.headerLeft}>
              <button className={styles.backBtn} onClick={() => (onExit ? onExit() : router.back())} aria-label="Exit practice mode">
                <ChevronLeft size={18} />
                Back
              </button>
              <div className={styles.title}>
                Practice — {projectTitle}
                <span className={styles.badge}>
                  <span aria-hidden="true">✨</span> Practice
                </span>
              </div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={() => window.open(`/play/${projectId}`, '_blank')}
                  title="Trainee link"
                >
                  🔗 Trainee Link
                </Button>
                <Button variant="secondary" onClick={() => setShowConfigModal(true)}><Zap size={16} /> Settings</Button>
                <Button variant="secondary" onClick={() => setScenarioInput({
                  question: '', expectedAnswer: '', reactionType: 'text', reactionData: '', targetSlideId: 'any',
                  isTest: false, testOptions: ['', '', ''], correctOptionIndex: 0
                })}><X size={16} /> Reset</Button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* MODE TOGGLE BAR */}
      {mode === 'train' && (
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
            {isFutureVersion && (
              <button
                className={styles.segmentBtn}
                onClick={() => { setMode('practice'); setMessages([]); setIsSessionActive(false); }}
                aria-pressed={false}
                title="Simulation: test from trainee's perspective"
              >
                🎯 Session Preview
              </button>
            )}
          </div>

          {mode === 'train' && isFutureVersion && (
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
          Coach Mode: add questions, expected answers, and configure avatar behavior.
        </div>
      </div>
      )}


      {/* WORKSPACE */}
      <div className={`${styles.workspace} ${settings?.questionTiming === 'no_slides' ? styles.quizModeWorkspace : ''}`}>
        {/* LEFT PANEL */}
        {settings?.questionTiming !== 'no_slides' && (
          <main className={styles.leftPanel}>
            <div className={styles.slidePreview}>
            <div className={styles.slidePill}>Slide {activeSlideIndex + 1} / {Math.max(1, slides.length)}</div>
            <div className={styles.slideTitle}>{projectTitle}</div>
            {slides.length === 0 ? (
              <div className={styles.slideEmpty}>
                <FileText size={40} strokeWidth={1.5} />
                <div>No slides uploaded for this project yet.</div>
              </div>
            ) : (activeSlide?.image_url || activeSlide?.thumbnailUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeSlide.image_url || activeSlide.thumbnailUrl} alt={slideHeading || "Slide"} className={styles.slideImage} />
            ) : (
              <div className={styles.slideNarrative}>
                <div className={styles.slideEyebrow}>Pitch Avatar coach</div>
                <h2 className={styles.slideHeadline}>{stageTitle}</h2>
                <div className={styles.slideSubheadline}>{stageSubtitle}</div>
                {stageHighlights.length > 0 ? (
                  <div className={styles.slideHighlights}>
                    {stageHighlights.map((item, index) => (
                      <div key={`${item}-${index}`} className={styles.slideHighlightItem}>{item}</div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.slideEmptyNote}>
                    Add more script detail in the editor to preview key talking points here.
                  </div>
                )}
              </div>
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
        )}

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
                  {showResults ? (() => {
                    const total = scenarioQueue.length || sessionLogs.length || 1;
                    const correct = correctCountRef.current;
                    const pct = Math.round((correct / total) * 100);
                    const passed = pct >= (settings?.passingScore ?? 70);
                    const avgScore = sessionLogs.length > 0
                      ? Math.round(sessionLogs.reduce((s, l) => s + (l.score ?? 0), 0) / sessionLogs.length)
                      : 0;
                    return (
                      <div className={styles.introCard} style={{ textAlign: 'center', maxWidth: '560px', width: '100%' }}>
                        <div className={styles.introIcon} style={{ fontSize: '2rem' }}>
                          {passed ? '🏆' : '📊'}
                        </div>
                        <h3 className={styles.introTitle} style={{ marginBottom: '4px' }}>
                          {passed ? 'Great job!' : 'Session Complete'}
                        </h3>
                        <div className={styles.resultsScore} style={{ fontSize: '3rem', fontWeight: 800, color: passed ? 'var(--status-success-strong, #16a34a)' : 'var(--primary, #6366f1)', lineHeight: 1, margin: '12px 0' }}>
                          {pct}%
                        </div>
                        <p className={styles.resultsSubtitle} style={{ color: 'var(--sara-text-muted)', marginBottom: '20px' }}>
                          {correct} out of {total} correct · avg score {avgScore}/100
                          {settings?.passingScore && <> · Passing: {settings.passingScore}%</>}
                        </p>

                        {/* Per-question breakdown */}
                        {sessionLogs.length > 0 && settings?.feedbackFlags?.immediateFeedback !== false && (
                          <div className={styles.resultsDetails} style={{ textAlign: 'left', width: '100%', marginBottom: '20px' }}>
                            <div className={styles.resultsHeader}>Your answers</div>
                            <div className={styles.resultsLogList}>
                              {sessionLogs.map((log, i) => (
                                <div key={i} className={`${styles.resultLogItem} ${log.isCorrect ? styles.correct : styles.incorrect}`}>
                                  <div className={styles.logQuestion}>
                                    {log.isCorrect ? '✅' : '❌'} Q{i + 1}: {log.question}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: 'var(--sara-text-muted)', marginTop: '4px' }}>
                                    Your answer: <em>{log.userAnswer}</em>
                                  </div>
                                  {log.score !== undefined && (
                                    <div style={{ fontSize: '0.78rem', color: 'var(--sara-text-muted)', marginTop: '2px' }}>
                                      Score: {log.score}/100
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button
                            variant="primary"
                            className={styles.introStart}
                            style={{ minWidth: '160px' }}
                            onClick={() => {
                              setShowResults(false);
                              setMessages([]);
                              setSessionLogs([]);
                              setSessionScore({ total: 0, correct: 0 });
                              setFinalScore(0);
                              setCurrentScenarioIndex(0);
                              correctCountRef.current = 0;
                            }}
                          >
                            Try again
                          </Button>
                          <button
                            className={styles.actionBarIconBtn}
                            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--color-white)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}
                            onClick={() => router.back()}
                          >
                            ← Exit
                          </button>
                        </div>
                      </div>
                    );
                  })() : (
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
                          The coach will ask {savedScenarios.length} prepared question(s) in sequence
                        </div>
                      )}
                      <Button
                        variant="primary"
                        className={styles.introStart}
                        onClick={() => handleSendMessage(undefined, true)}
                        disabled={isEvaluating}
                      >
                        {isEvaluating ? 'Starting...' : 'Start practice'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {mode === 'practice' && (
                    <div className={styles.avatarPlaceholder}>
                      <img src="/Sara.png" alt="Avatar Sara" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className={styles.chatArea} role="log" aria-live="polite" aria-label="Dialogue">
                    {renderChatBody()}
                  </div>

                  {mode === 'practice' && isSessionActive && (
                    <div className={styles.inputArea}>
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
                  {mode === 'practice' && isSessionActive && (
                    <div className={styles.bottomActionBar}>
                      <button className={styles.actionBarIconBtn} aria-label="Chat">
                        <MessageSquare size={20} />
                      </button>
                      <button className={styles.actionBarBtnPrimaryOutline}>
                        <Calendar size={16} /> Schedule meeting
                      </button>
                      <button className={styles.actionBarBtnPrimary}>
                        <Phone size={16} /> Call presenter
                      </button>
                      <button className={styles.actionBarBtnSecondary}>
                        Slides ▼
                      </button>
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
                  <p>Add questions and expected answers in &apos;Coach Setup&apos; mode.</p>
                </div>
              ) : (
                <>
                  <div className={styles.kbHeader}>
                    <div className={styles.kbHeaderMeta}>
                      <Database size={15} />
                      Scenarios · {savedScenarios.length}
                    </div>
                    <select 
                      className={`${styles.modalInput} ${styles.kbOrderSelect}`}
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
                          <div className={styles.kbQuestionActions}>
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
                                setEditingScenarioId(sc.id);
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
            <div className={`${styles.chatArea} ${styles.knowledgePanel}`} role="tabpanel" id="coach-panel-knowledge" aria-labelledby="coach-tab-knowledge">
              <div className={styles.knowledgePanelIntro}>
                <h3 className={styles.knowledgePanelTitle}>Knowledge source</h3>
                <p className={styles.knowledgePanelDescription}>
                  Add supporting material that will later be connected to the RAG knowledge base for the coach.
                </p>
              </div>

              <div className={styles.knowledgeInputTabs}>
                <button 
                  className={`${styles.tab} ${styles.knowledgeInputTab} ${kbInputType === 'url' ? styles.active : ''}`}
                  onClick={() => setKbInputType('url')}
                >
                  <Globe size={14} /> URL
                </button>
                <button 
                  className={`${styles.tab} ${styles.knowledgeInputTab} ${kbInputType === 'file' ? styles.active : ''}`}
                  onClick={() => setKbInputType('file')}
                >
                  <Upload size={14} /> File
                </button>
                <button 
                  className={`${styles.tab} ${styles.knowledgeInputTab} ${kbInputType === 'text' ? styles.active : ''}`}
                  onClick={() => setKbInputType('text')}
                >
                  <Type size={14} /> Text
                </button>
              </div>
              
              <div className={styles.knowledgeInputPanel}>
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
                    className={`${styles.modalInput} ${styles.knowledgeFileInput}`}
                    onChange={(e) => setKbInputValue(e.target.value)}
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
              
              <div className={styles.knowledgeActions}>
                <Button 
                  variant="primary"
                  onClick={handleKnowledgeBaseAdd}
                >
                  Add
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setKbInputValue('')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {showConfigModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-config-title"
          onClick={() => setShowConfigModal(false)}
        >
          <div className="modal-container" ref={modalRef} onClick={e => e.stopPropagation()}>
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
                  onChange={e => setSessionConfig({...sessionConfig, buyerPersona: e.target.value as "none" | "skeptic" | "budget_controller" | "technical" | "friendly" | "negotiator"})}
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
                  onChange={e => setSessionConfig({...sessionConfig, startMode: e.target.value as "avatar_asks_first" | "seller_asks_first"})}
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
              <Button variant="primary" onClick={() => setShowConfigModal(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
