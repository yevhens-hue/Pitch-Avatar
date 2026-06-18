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

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

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

// ── Free-form avatar reply ───────
async function freeformReply(params: {
  projectId: string; slideId: string | number | undefined; userMessage: string; language?: string; coachRole?: string;
}): Promise<string | null> {
  try {
    const ctx = await getContext(params.projectId, params.slideId);
    
    // Determine Role Prompt
    let rolePrompt = `You are an AI sales presenter ("avatar") delivering the presentation "${ctx.projectTitle || 'this presentation'}".`;
    if (params.coachRole && params.coachRole !== 'Presenter') {
      const roles: Record<string, string> = {
        Buyer: 'You are a skeptical but interested Buyer. Focus on price, ROI, and practical benefits.',
        Investor: 'You are a tough Investor. Focus on market size, margins, traction, and risks.',
        Recruiter: 'You are a technical Recruiter. Focus on hard skills, team fit, and experience.',
        Manager: 'You are an internal Manager. Focus on processes, team alignment, and efficiency.',
        Technical: 'You are a Technical Expert. Ask detailed, specific questions about architecture and stack.'
      };
      rolePrompt = `You are playing the role of a ${params.coachRole}. ${roles[params.coachRole] || ''} The presenter is pitching "${ctx.projectTitle || 'this presentation'}" to you.`;
    }

    const system = [
      rolePrompt,
      ctx.slideTitle || ctx.slideText
        ? `The current slide context is "${ctx.slideTitle}". Content: ${ctx.slideText}`
        : '',
      params.userMessage === "START_PRACTICE_SIMULATION"
        ? `Start the simulation by asking a challenging, context-relevant question to the presenter based on your role.`
        : `Respond to the user's input naturally but concisely (max 3 sentences), staying strictly in your character as a ${params.coachRole || 'presenter'}. Evaluate if their attached slide (if any) makes sense.`,
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
      coachRole,
      isInitiation,
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

    // If initiation, bypass RAG and just generate an opening statement
    if (isInitiation) {
      if (hasLLM()) {
        const reply = await freeformReply({ projectId, slideId, userMessage, language, coachRole });
        if (reply) avatarResponse = `${namePrefix}${reply}`;
      }
      if (!avatarResponse) avatarResponse = "Let's begin. Pitch me your product.";
      
      return NextResponse.json({
        success: true,
        avatarResponse,
        reactionType: 'text',
        reactionData: '',
        isCorrect: true
      });
    }

    // Fetch all scenarios for this project for RAG matching.
    const { data: scenarios } = await supabase
      .from('buyer_scenarios')
      .select('*')
      .eq('project_id', projectId);

    let scenario = null;
    if (scenarios && scenarios.length > 0) {
      if (hasLLM() && process.env.OPENAI_API_KEY) {
        try {
          const embedRes = await getOpenAI().embeddings.create({
            model: 'text-embedding-3-small',
            input: userMessage,
            encoding_format: 'float'
          });
          const userVector = embedRes.data[0].embedding;
          
          let bestScore = -1;
          for (const s of scenarios) {
            const sEmbed = s.metadata?.embedding;
            if (sEmbed && Array.isArray(sEmbed)) {
              const score = cosineSimilarity(userVector, sEmbed);
              if (score > bestScore) {
                bestScore = score;
                scenario = s;
              }
            }
          }
          
          // Threshold for semantic match
          if (bestScore < 0.5) {
            scenario = null;
          }
        } catch (e) {
          console.warn('Embedding evaluation failed', e);
          // Fallback to strict slide ID
          scenario = scenarios.find((s: any) => String(s.expected_slide_id) === String(slideId)) || null;
        }
      } else {
        // Fallback to strict slide ID match
        scenario = scenarios.find((s: any) => String(s.expected_slide_id) === String(slideId)) || null;
      }
    }

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
        const reply = await freeformReply({ projectId, slideId, userMessage, language, coachRole });
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
