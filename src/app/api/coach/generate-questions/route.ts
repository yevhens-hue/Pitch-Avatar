import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';
import { BuyerScenario, ROLE_TEMPLATES } from '@/types/coach';
import OpenAI from 'openai';

let _openai: OpenAI | null = null;
const getOpenAI = (): OpenAI => {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build' });
  }
  return _openai;
};

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { projectId, maxQuestions = 5, roleTemplate = 'buyer', roleId, traineeRoleId, questionTypes } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const { data: slides } = await supabase
      .from('slides')
      .select('id, script_text, title')
      .eq('project_id', projectId)
      .order('id', { ascending: true });

    const roleConfig = ROLE_TEMPLATES.find(r => r.role === roleTemplate) || ROLE_TEMPLATES[0];
    const typesToGenerate = questionTypes || roleConfig.defaultQuestionTypes;
    const personaLabel = traineeRoleId || roleConfig.label;

    const openai = getOpenAI();

    // Prepare context for LLM
    const slideContext = slides && slides.length > 0
      ? slides.map((s, i) => `Slide ${i + 1} (ID: ${s.id}): Title: ${s.title || 'No title'}\nContent/Script: ${s.script_text || 'No script'}`).join('\n\n')
      : 'No slide content available. Generate generic questions based on the role.';

    const systemPrompt = `
      You are an expert sales trainer and AI buyer persona. 
      Your task is to generate ${maxQuestions} realistic questions that a buyer acting as "${personaLabel}" would ask during a pitch presentation.
      Focus on these question topics: ${typesToGenerate.join(', ')}.
      
      Here is the content of the presentation slides:
      ${slideContext}
      
      Output a JSON object with a single property "questions", which is an array of objects.
      Each object in the array must have exactly these fields:
      - questionText (string): The question the buyer asks. If the slides are in Russian/Ukrainian/English, match their language. Default to Russian.
      - expectedAnswer (string): The ideal expected answer from the seller.
      - expectedSlideId (string or null): The ID of the slide this question refers to (e.g. "slide_123"), or null if it's a general question. Use ONLY IDs provided in the context above.
      - questionType (string): The category of the question (e.g. product, price, roi, technical).
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the JSON object now." }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content || '{"questions": []}';
    let generatedQuestions = [];
    try {
      const parsed = JSON.parse(content);
      generatedQuestions = parsed.questions || [];
    } catch (e) {
      console.error("Failed to parse LLM JSON", e);
    }

    const processedScenarios = generatedQuestions.slice(0, maxQuestions).map((scen: any, idx: number) => ({
      id: crypto.randomUUID(),
      projectId,
      questionText: scen.questionText,
      expectedAnswer: scen.expectedAnswer,
      expectedSlideId: scen.expectedSlideId || null,
      isGenerated: true,
      roleTemplate,
      traineeRoleId,
      roleId,
      questionType: scen.questionType || 'product',
      customActions: [],
      orderIndex: idx,
      createdAt: new Date().toISOString()
    } as BuyerScenario));

    return NextResponse.json({
      success: true,
      questions: processedScenarios
    });

  } catch (error: unknown) {
    console.error('Generate Questions API Error:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
