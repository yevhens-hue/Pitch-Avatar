import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { message, settings } = await req.json();
    console.log('AI Processing message:', message, 'with settings:', settings);

    // GSD: Logic for Answer Mode & External RAG
    const mode = settings?.answerMode || 'Hybrid';
    const externalEnabled = settings?.externalRAG?.enabled || false;

    let responsePrefix = '';
    let sources: string[] = [];

    if (externalEnabled) {
      console.log(`Calling external RAG: ${settings.externalRAG.endpoint}...`);
      // Simulate external API call
      responsePrefix = `[External RAG: ${settings.externalRAG.name}] `;
      sources = ['External source #1', 'External source #2'];
    }

    let answer = '';
    if (mode === 'Grounded') {
      answer = `${responsePrefix}I found this information strictly in your documents: Pitch Avatar increases engagement by 35%.`;
    } else if (mode === 'Hybrid') {
      answer = `${responsePrefix}Based on your data and general AI knowledge, Pitch Avatar uses AI avatars and LLMs to create personalized video content for sales teams.`;
    } else {
      answer = "This is a general LLM response without specific data constraints.";
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      text: answer,
      sources: mode !== 'LLM Only' ? sources : []
    });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
