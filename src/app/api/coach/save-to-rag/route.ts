import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    // Use service role client to bypass RLS for internal training tool
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    // 2. Parse payload
    const { 
      projectId, 
      questionText, 
      expectedAnswer,
      expectedSlideId, 
      saveTarget, // 'rag' | 'scenario' | 'both' | 'instruction'
      reactionType,
      reactionData,
      isTest,
      testOptions,
      correctOptionIndex,
      roleId,
      orderIndex
    } = await req.json();

    if (!projectId || !questionText || !expectedAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const target = saveTarget || 'both';
    let savedToScenarios = false;
    let savedToRag = false;
    let embedding: number[] | null = null;

    // Generate embedding for the question if OpenAI is configured
    try {
      if (process.env.OPENAI_API_KEY) {
        const embedRes = await getOpenAI().embeddings.create({
          model: 'text-embedding-3-small',
          input: questionText,
          encoding_format: 'float'
        });
        embedding = embedRes.data[0].embedding;
      }
    } catch (e) {
      console.warn('Failed to generate embedding:', e);
    }

    // A. Save to buyer_scenarios database table (Storage)
    const { data, error } = await supabaseAdmin
      .from('buyer_scenarios')
      .insert({
        project_id: projectId,
        question_text: questionText,
        expected_answer: expectedAnswer,
        expected_slide_id: expectedSlideId === 'any' || expectedSlideId === 'none' ? null : expectedSlideId,
        is_generated: false,
        custom_actions: {
          reactionType,
          reactionData,
          isTest,
          testOptions,
          correctOptionIndex,
          isTemplate: questionText.includes('{') || expectedAnswer.includes('{'),
          embedding,
          targetType: expectedSlideId,
          source: target === 'rag' ? 'storage_action' : 'scenario_editor'
        }
      })
      .select();

    if (error) {
      console.error('Error inserting into buyer_scenarios:', error);
    } else {
      savedToScenarios = true;
    }

    // Storage is primary now, no Knowledge Base insertion
    savedToRag = false;

    // B. Save as Instruction
    let savedAsInstruction = false;
    if (target === 'instruction') {
      try {
        const { data: project } = await supabaseAdmin
          .from('projects')
          .select('metadata')
          .eq('id', projectId)
          .single();

        let metadata = (project as any)?.metadata || {};
        if (!metadata.coachSettings) metadata.coachSettings = {};
        
        const existingPrompt = metadata.coachSettings.systemPrompt || '';
        const newInstruction = `- ${expectedAnswer}`;
        metadata.coachSettings.systemPrompt = existingPrompt 
          ? `${existingPrompt}\n${newInstruction}` 
          : newInstruction;

        const { error: updateError } = await supabaseAdmin
          .from('projects')
          .update({ metadata })
          .eq('id', projectId);

        if (!updateError) {
          savedAsInstruction = true;
        } else {
          console.error('Error updating project instructions:', updateError);
        }
      } catch (err) {
        console.error('Failed to save instruction:', err);
      }
    }

    return NextResponse.json({
      success: true,
      savedToScenarios,
      savedToRag,
      savedAsInstruction,
      message: savedAsInstruction ? 'Instruction added to project settings.' : `Materials successfully saved to Storage.`
    });

  } catch (error: unknown) {
    console.error('Save to RAG API Error:', error);
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}
