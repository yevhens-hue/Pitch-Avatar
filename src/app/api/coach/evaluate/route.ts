import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

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
async function getContext(db: ReturnType<typeof createClient>, projectId: string, slideId: string | number | undefined) {
  let slideTitle = '';
  let slideText = '';
  let projectTitle = '';
  let coachSettings: any = {};
  try {
    if (slideId == null) throw new Error('No slideId');
    const { data: slide } = await db
      .from('slides')
      .select('title, script_text')
      .eq('project_id', projectId)
      .eq('id', slideId)
      .single();
    if (slide) {
      slideTitle = (slide as { title?: string }).title || '';
      slideText = (slide as { script_text?: string }).script_text || '';
    }
  } catch { /* context is best-effort */ }
  try {
    const { data: project } = await db
      .from('projects')
      .select('title, metadata')
      .eq('id', projectId)
      .single();
    if (project) {
      projectTitle = (project as any).title || '';
      coachSettings = (project as any).metadata?.coachSettings || {};
    }
  } catch { /* context is best-effort */ }
  return { slideTitle, slideText, projectTitle, coachSettings };
}

// ── Free-form avatar reply ───────
async function freeformReply(params: {
  db: ReturnType<typeof createClient>;
  projectId: string; slideId: string | number | undefined; userMessage: string; language?: string; coachRole?: string;
}): Promise<string | null> {
  try {
    const ctx = await getContext(params.db, params.projectId, params.slideId);
    
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
      ctx.coachSettings?.systemPrompt ? `Specific Project Instructions: ${ctx.coachSettings.systemPrompt}` : '',
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
  userMessage: string; expectedAnswer: string; language?: string; coachSettings?: any;
}) {
  try {
    const system = [
      `You evaluate a sales trainee's spoken answer against the expected answer.`,
      `Expected answer: "${params.expectedAnswer}".`,
      params.coachSettings?.systemPrompt ? `Specific Project Instructions: ${params.coachSettings.systemPrompt}` : '',
      `Return ONLY a compact JSON object matching this exact structure:`,
      `{`,
      `  "result": "Correct" | "Partially Correct" | "Incorrect",`,
      `  "score": <number 0-100>,`,
      `  "feedback": "<detailed feedback in ${params.language || 'English'}>",`,
      `  "recommendations": ["<actionable advice 1>", "<actionable advice 2>"],`,
      `  "productKnowledge": <number 0-100>,`,
      `  "objectionHandling": <number 0-100>,`,
      `  "needsIdentification": <number 0-100>,`,
      `  "valuePresentation": <number 0-100>,`,
      `  "slideUsage": <number 0-100>`,
      `}`
    ].filter(Boolean).join('\n');

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: params.userMessage },
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    return { 
      isCorrect: parsed.result === 'Correct', 
      score: Number(parsed.score) || 0, 
      reply: String(parsed.feedback || ''),
      result: parsed.result || 'Incorrect',
      feedback: parsed.feedback || '',
      recommendations: parsed.recommendations || [],
      productKnowledge: Number(parsed.productKnowledge) || 0,
      objectionHandling: Number(parsed.objectionHandling) || 0,
      needsIdentification: Number(parsed.needsIdentification) || 0,
      valuePresentation: Number(parsed.valuePresentation) || 0,
      slideUsage: Number(parsed.slideUsage) || 0
    };
  } catch (err) {
    console.error('evaluateAnswer LLM error:', err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // Service role client — bypasses RLS, no auth required for practice sessions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const {
      projectId,
      slideId,
      userMessage,
      contextMode,
      listenerName,
      language,
      coachRole,
      isInitiation,
      activeScenarioId,
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
    let score = 0;
    let testOptions: string[] | undefined = undefined;
    let evaluation: any = undefined;

    // Fetch context to get project instructions (coachSettings)
    const ctx = await getContext(supabaseAdmin as ReturnType<typeof createClient>, projectId, slideId);
    const coachSettings = ctx.coachSettings || {};

    // If initiation — load first saved scenario and use it as the opening question
    if (isInitiation) {
      // Try to find a scenario for the current slide, or any scenario for this project
      const { data: initScenarios } = await supabaseAdmin
        .from('buyer_scenarios')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(5);

      let firstScenario = null;
      if (initScenarios && initScenarios.length > 0) {
        // Prefer scenario matching current slide
        firstScenario = initScenarios.find((s: any) => String(s.expected_slide_id) === String(slideId))
          || initScenarios[0];
      }

      if (firstScenario) {
        // Use the saved question as the avatar's opening
        avatarResponse = firstScenario.question_text;
      } else if (hasLLM()) {
        // No scenarios saved yet — generate a context-aware question
        const reply = await freeformReply({ db: supabaseAdmin as ReturnType<typeof createClient>, projectId, slideId, userMessage, language, coachRole });
        if (reply) avatarResponse = reply;
      }

      if (!avatarResponse) avatarResponse = "Let's begin. Tell me about your product.";
      
      return NextResponse.json({
        success: true,
        avatarResponse,
        reactionType: 'text',
        reactionData: '',
        isCorrect: true,
        // Pass active scenario ID so frontend can use it for evaluation
        activeScenarioId: firstScenario?.id,
        expectedAnswer: firstScenario?.expected_answer,
        expectedSlideId: firstScenario?.expected_slide_id,
      });
    }

    // Fetch all scenarios for this project for RAG matching.
    const { data: scenarios } = await supabaseAdmin
      .from('buyer_scenarios')
      .select('*')
      .eq('project_id', projectId);

    let scenario = null;
    if (scenarios && scenarios.length > 0) {
      if (activeScenarioId) {
        scenario = scenarios.find((s: any) => s.id === activeScenarioId) || null;
      } else if (hasLLM() && process.env.OPENAI_API_KEY) {
        try {
          const embedRes = await getOpenAI().embeddings.create({
            model: 'text-embedding-3-small',
            input: userMessage,
            encoding_format: 'float'
          });
          const userVector = embedRes.data[0].embedding;
          
          let bestScore = -1;
          for (const s of scenarios) {
            const meta = s.custom_actions || s.metadata;
            const sEmbed = meta?.embedding;
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

    const meta = scenario ? (scenario.custom_actions || scenario.metadata) : null;
    if (scenario && meta) {
      reactionType = meta.reactionType || 'text';
      reactionData = meta.reactionData || '';

      if (meta.isTest && meta.testOptions) {
        // ── Deterministic quiz grading (kept stable & testable) ──
        testOptions = meta.testOptions;
        const correctOpt = meta.testOptions[meta.correctOptionIndex];
        if (userMessage === correctOpt || userMessage === meta.correctOptionIndex?.toString()) {
          isCorrect = true;
          score = 100;
          avatarResponse = `${namePrefix}${t.correct}`;
        } else {
          isCorrect = false;
          score = 0;
          avatarResponse = `${namePrefix}${t.incorrect}`;
        }
      } else {
        // ── Free-text answer against an expected answer ──
        const expected = scenario.expected_answer || '';
        if (hasLLM()) {
          const ev = await evaluateAnswer({ userMessage, expectedAnswer: expected, language, coachSettings });
          if (ev) {
            isCorrect = ev.isCorrect;
            score = ev.score || (ev.isCorrect ? 100 : 0);
            let slideNote = '';
            if (scenario.expected_slide_id && String(slideId) !== String(scenario.expected_slide_id)) {
              slideNote = ' Але не забувайте показати правильний слайд!';
              isCorrect = false; // Penalty for missing the slide
              score = Math.max(0, score - 20);
            }
            avatarResponse = `${namePrefix}${ev.reply || (ev.isCorrect ? t.good : t.notQuite)}${slideNote}`;
            
            // Pass the detailed evaluation back to the client
            evaluation = {
              result: ev.result,
              feedback: ev.feedback,
              recommendations: ev.recommendations,
              productKnowledge: ev.productKnowledge,
              objectionHandling: ev.objectionHandling,
              needsIdentification: ev.needsIdentification,
              valuePresentation: ev.valuePresentation,
              slideUsage: ev.slideUsage
            };
          }
        }
        if (!avatarResponse) {
          isCorrect = userMessage.toLowerCase().includes(expected.toLowerCase());
          score = isCorrect ? 100 : 0;
          let slideNote = '';
          if (scenario.expected_slide_id && String(slideId) !== String(scenario.expected_slide_id)) {
            slideNote = ' (Missing correct slide)';
            isCorrect = false;
            score = Math.max(0, score - 20);
          }
          avatarResponse = `${namePrefix}${isCorrect ? t.good : t.notQuite}${slideNote}`;
        }
      }
    } else {
      // ── No scenario: answer the listener as the presenter ──
      if (hasLLM()) {
        const reply = await freeformReply({ db: supabaseAdmin as ReturnType<typeof createClient>, projectId, slideId, userMessage, language, coachRole });
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
      score,
      testOptions,
      evaluation
    });
  } catch (error: unknown) {
    console.error('Evaluate API Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate response' }, { status: 500 });
  }
}
