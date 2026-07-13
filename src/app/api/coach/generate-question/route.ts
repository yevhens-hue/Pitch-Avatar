import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    const { projectId, slideId, existingQuestions = [], roleTemplate = 'buyer', traineeRoleId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const { data: project } = await supabase
      .from('projects')
      .select('slides')
      .eq('id', projectId)
      .single();
      
    const slides = project?.slides || [];

    // Filter to specific slide if slideId is provided
    let slideContext = 'No slide content available.';
    if (slides && slides.length > 0) {
      if (slideId && slideId !== 'any' && slideId !== 'none') {
        const slide = slides.find((s: any) => s.id === slideId || s.id === parseInt(slideId));
        if (slide) {
          slideContext = `Focus specifically on this slide content:\nTitle: ${slide.title || 'No title'}\nContent: ${slide.text || slide.content || 'No script'}`;
        }
      } else {
        slideContext = slides.map((s: any, i: number) => `Slide ${i + 1} (ID: ${s.id}): Title: ${s.title || 'No title'}\nContent/Script: ${s.text || s.content || 'No script'}`).join('\n\n');
      }
    }

    const personaLabel = traineeRoleId || roleTemplate || 'Sales Rep';

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key_for_build') {
      const mockQuestion = {
        questionText: `(Mock) What about the feature mentioned on this slide?`,
        questionType: 'product'
      };
      return NextResponse.json({ success: true, question: mockQuestion });
    }

    const openai = getOpenAI();

    const existingQsText = existingQuestions.length > 0 
      ? `Do NOT ask these questions as they were already asked:\n${existingQuestions.map((q: string) => `- ${q}`).join('\n')}`
      : 'No questions have been asked yet.';

    const systemPrompt = `
      You are an expert sales trainer and AI buyer persona. 
      Your task is to generate ONE realistic, challenging question that a buyer acting as "${personaLabel}" would ask during a pitch presentation.
      
      Here is the content of the presentation slide(s):
      ${slideContext}
      
      ${existingQsText}
      
      Output a JSON object with a single property "question", which is an object containing:
      - questionText (string): The question the buyer asks. Match the language of the slide content (default to Russian if unsure).
      - questionType (string): The category of the question (e.g., Pricing, Product, Competitors, Objection, ROI, Technical).
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the JSON object for the next question now." }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0].message.content || '{"question": {}}';
    let generatedQuestion = null;
    try {
      const parsed = JSON.parse(content);
      generatedQuestion = parsed.question;
    } catch (e) {
      console.error("Failed to parse LLM JSON", e);
    }

    if (!generatedQuestion || !generatedQuestion.questionText) {
      generatedQuestion = {
        questionText: "Could you tell me more about this?",
        questionType: "Product"
      };
    }

    return NextResponse.json({
      success: true,
      question: generatedQuestion
    });

  } catch (error: unknown) {
    console.error('Generate Single Question API Error:', error);
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
