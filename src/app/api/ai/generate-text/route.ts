import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured in .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { prompt, slideNumber, projectTitle } = body;

    const systemMessage = `You are a professional presentation scriptwriter. 
Write a script for slide #${slideNumber} of a presentation titled "${projectTitle}".
The script should be concise, engaging, and spoken directly to the audience.
Avoid markdown formatting like asterisks or bold text, just provide raw spoken text.
Keep it under 300 characters.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt || 'Generate a script for this slide.' }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error('Text generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate text' },
      { status: 500 }
    );
  }
}
