import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';

// Lazily construct the client so importing this module (e.g. in tests/jsdom)
// never instantiates OpenAI — it's only created when an LLM call actually runs.
let _openai: OpenAI | null = null;
const getOpenAI = (): OpenAI => {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build' });
  }
  return _openai;
};

const hasLLM = () => !!process.env.OPENAI_API_KEY;

// ── Localized response strings ──────────────────────────────────────────────
type Lang = 'English' | 'Ukrainian' | 'Romanian' | 'Russian';
const STRINGS: Record<Lang, {
  greeting: string; correct: string; incorrect: string; good: string; notQuite: string;
  fallback: (q: string) => string;
}> = {
  English: {
    greeting: 'Hello',
    correct: '**Correct!** You picked the right option.',
    incorrect: '**Not quite.** Give it another try.',
    good: 'Great answer — that covers it well.',
    notQuite: "Not quite — let's refine that answer.",
    fallback: (q) => `Good question: "${q}". Here's how our solution addresses that.`,
  },
  Ukrainian: {
    greeting: 'Привіт',
    correct: '**Правильно!** Ви обрали вірний варіант.',
    incorrect: '**Не зовсім.** Спробуйте ще раз.',
    good: 'Чудова відповідь — все по суті.',
    notQuite: 'Не зовсім — давайте уточнимо відповідь.',
    fallback: (q) => `Гарне питання: "${q}". Ось як наше рішення це вирішує.`,
  },
  Romanian: {
    greeting: 'Salut',
    correct: '**Corect!** Ai ales varianta potrivită.',
    incorrect: '**Nu chiar.** Mai încearcă o dată.',
    good: 'Răspuns excelent — acoperă bine subiectul.',
    notQuite: 'Nu chiar — să rafinăm răspunsul.',
    fallback: (q) => `Bună întrebare: "${q}". Iată cum rezolvă soluția noastră asta.`,
  },
  Russian: {
    greeting: 'Привет',
    correct: '**Правильно!** Вы выбрали верный вариант.',
    incorrect: '**Неверно!** Попробуйте ещё раз.',
    good: 'Отличный ответ.',
    notQuite: 'Не совсем так.',
    fallback: (q) => `Хороший вопрос: "${q}". Я думаю, что это решает вашу проблему.`,
  },
};
const pickStrings = (language?: string) => STRINGS[(language as Lang)] || STRINGS.English;

// ── Fetch slide + project context (only used when an LLM key is present) ─────
async function getContext(projectId: string, slideId: string | number | undefined) {
  let slideTitle = '';
  let slideText = '';
  let projectTitle = '';
  try {
    const { data: slide } = await supabase
      .from('slides')
      .select('title, script_text')
      .eq('project_id', projectId)
      .eq('id', slideId)
      .single();
    if (slide) {
      slideTitle = slide.title || '';
      slideText = slide.script_text || '';
    }
  } catch { /* context is best-effort */ }
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();
    if (project) projectTitle = project.title || '';
  } catch { /* context is best-effort */ }
  return { slideTitle, slideText, projectTitle };
}

// ── Free-form avatar reply (acts in character as the seller/presenter) ───────
async function freeformReply(params: {
  projectId: string; slideId: string | number | undefined; userMessage: string; language?: string;
}): Promise<string | null> {
  try {
    const ctx = await getContext(params.projectId, params.slideId);
    const system = [
      `You are an AI sales presenter ("avatar") delivering the presentation "${ctx.projectTitle || 'this presentation'}".`,
      ctx.slideTitle || ctx.slideText
        ? `The current slide is "${ctx.slideTitle}". Slide content: ${ctx.slideText}`
        : '',
      `Answer the listener's question persuasively and concisely (max 3 sentences), staying in character as the presenter.`,
      `Reply in ${params.language || 'English'}. Do not use markdown headings.`,
    ].filter(Boolean).join('\n');

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: params.userMessage },
      ],
      temperature: 0.7,
      max_tokens: 220,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('freeformReply LLM error:', err);
    return null;
  }
}

// ── LLM evaluation of a free-text answer against the expected answer ─────────
async function evaluateAnswer(params: {
  userMessage: string; expectedAnswer: string; language?: string;
}): Promise<{ isCorrect: boolean; reply: string } | null> {
  try {
    const system = [
      `You evaluate a sales trainee's spoken answer against the expected answer.`,
      `Expected answer: "${params.expectedAnswer}".`,
      `Return ONLY a compact JSON object: {"isCorrect": boolean, "reply": "<one or two sentences of feedback in ${params.language || 'English'}>"}.`,
    ].join('\n');

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: params.userMessage },
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { isCorrect: !!parsed.isCorrect, reply: String(parsed.reply || '') };
  } catch (err) {
    console.error('evaluateAnswer LLM error:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const {
      projectId,
      slideId,
      userMessage,
      contextMode,
      listenerName,
      language,
    } = await req.json();

    if (!projectId || !userMessage) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const t = pickStrings(language);
    const namePrefix = listenerName ? `${t.greeting}, ${listenerName}! ` : '';

    let avatarResponse = '';
    let reactionType = 'text';
    let reactionData = '';
    let isCorrect = false;
    let testOptions: string[] | undefined = undefined;

    // Fetch a matching training scenario for this project + slide.
    const { data: scenario } = await supabase
      .from('buyer_scenarios')
      .select('*')
      .eq('project_id', projectId)
      .eq('expected_slide_id', slideId)
      .single();

    if (scenario && scenario.metadata) {
      const meta = scenario.metadata;
      reactionType = meta.reactionType || 'text';
      reactionData = meta.reactionData || '';

      if (meta.isTest && meta.testOptions) {
        // ── Deterministic quiz grading (kept stable & testable) ──
        testOptions = meta.testOptions;
        const correctOpt = meta.testOptions[meta.correctOptionIndex];
        if (userMessage === correctOpt || userMessage === meta.correctOptionIndex?.toString()) {
          isCorrect = true;
          avatarResponse = `${namePrefix}${t.correct}`;
        } else {
          avatarResponse = `${namePrefix}${t.incorrect}`;
        }
      } else {
        // ── Free-text answer against an expected answer ──
        const expected = scenario.expected_answer || '';
        if (hasLLM()) {
          const ev = await evaluateAnswer({ userMessage, expectedAnswer: expected, language });
          if (ev) {
            isCorrect = ev.isCorrect;
            avatarResponse = `${namePrefix}${ev.reply || (ev.isCorrect ? t.good : t.notQuite)}`;
          }
        }
        if (!avatarResponse) {
          isCorrect = userMessage.toLowerCase().includes(expected.toLowerCase());
          avatarResponse = `${namePrefix}${isCorrect ? t.good : t.notQuite}`;
        }
      }
    } else {
      // ── No scenario: answer the listener as the presenter ──
      if (hasLLM()) {
        const reply = await freeformReply({ projectId, slideId, userMessage, language });
        if (reply) avatarResponse = `${namePrefix}${reply}`;
      }
      if (!avatarResponse) {
        avatarResponse = `${namePrefix}${t.fallback(userMessage)}`;
      }
    }

    return NextResponse.json({
      success: true,
      avatarResponse,
      reactionType,
      reactionData,
      isCorrect,
      testOptions,
    });
  } catch (error: unknown) {
    console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
