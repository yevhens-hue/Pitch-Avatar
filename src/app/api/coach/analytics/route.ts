import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, score, feedback, isCorrect, question, expectedAnswer, userAnswer } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Missing Supabase credentials for analytics API');
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const logEntry = {
      question,
      expectedAnswer,
      userAnswer,
      feedback,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    // First try to find if there is an active session for this user/project
    // For simplicity, we just create a new record or append to an existing one.
    // Given the MVP nature, we can just insert a new training_session record for now,
    // or append to a log if we want one session per "run". 
    // Here we just insert a new record for each evaluation for simplicity of tracking.
    const { error } = await supabase.from('training_sessions').insert({
      project_id: projectId,
      score: score || (isCorrect ? 100 : 0),
      session_logs: [logEntry],
      evaluation: { feedback }
    });

    if (error) {
      console.error('Failed to save training session:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Analytics saved successfully'
    });
  } catch (error: any) {
    console.error('Coach Analytics API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
