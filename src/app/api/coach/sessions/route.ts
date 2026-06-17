import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';
import { TrainingSession, SessionLogEntry, CoachEvaluation } from '@/types/coach';

// ─── GET /api/coach/sessions?projectId=xxx ──────────────────────────────────
export async function GET(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch sessions error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Map snake_case DB fields to camelCase types
    const sessions: TrainingSession[] = (data || []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      listenerId: row.listener_id ?? undefined,
      score: row.score,
      isTrainMode: row.is_train_mode,
      sessionLogs: (row.session_logs as SessionLogEntry[]) || [],
      durationSeconds: row.duration_seconds ?? 0,
      evaluation: (row.evaluation as CoachEvaluation) ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ success: true, sessions });
  } catch (error: unknown) {
    console.error('GET Sessions Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST /api/coach/sessions ───────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const {
      projectId,
      listenerId,
      score,
      isTrainMode = false,
      sessionLogs = [],
      durationSeconds = 0,
      evaluation,
    } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('training_sessions')
      .insert({
        project_id: projectId,
        listener_id: listenerId ?? null,
        score: score ?? 0,
        is_train_mode: isTrainMode,
        session_logs: sessionLogs,
        duration_seconds: durationSeconds,
        evaluation: evaluation ?? {},
      })
      .select()
      .single();

    if (error) {
      console.error('Create session error:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: data.id,
        projectId: data.project_id,
        score: data.score,
        isTrainMode: data.is_train_mode,
        sessionLogs: data.session_logs,
        durationSeconds: data.duration_seconds,
        evaluation: data.evaluation,
        createdAt: data.created_at,
      } satisfies Partial<TrainingSession>,
    });
  } catch (error: unknown) {
    console.error('POST Sessions Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── PATCH /api/coach/sessions?id=xxx ──────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
    }

    const body = await req.json();
    const updatePayload: Record<string, unknown> = {};

    if (body.score !== undefined) updatePayload.score = body.score;
    if (body.sessionLogs !== undefined) updatePayload.session_logs = body.sessionLogs;
    if (body.durationSeconds !== undefined) updatePayload.duration_seconds = body.durationSeconds;
    if (body.evaluation !== undefined) updatePayload.evaluation = body.evaluation;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('training_sessions')
      .update(updatePayload)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Update session error:', error);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, session: data });
  } catch (error: unknown) {
    console.error('PATCH Sessions Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
