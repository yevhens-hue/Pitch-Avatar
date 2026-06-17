import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';
import { TrainingAnalytics, TrainingSession, SessionLogEntry, CoachEvaluation } from '@/types/coach';

// ─── GET /api/coach/analytics?projectId=xxx ─────────────────────────────────
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
      .eq('is_train_mode', false) // Only real training sessions, not train-mode edits
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Analytics fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

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

    const totalSessions = sessions.length;
    const avgScore = totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions)
      : 0;
    const avgDurationSeconds = totalSessions > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0) / totalSessions)
      : 0;
    const successRate = totalSessions > 0
      ? Math.round((sessions.filter(s => s.score >= 70).length / totalSessions) * 100)
      : 0;

    const analytics: TrainingAnalytics = {
      projectId,
      totalSessions,
      avgScore,
      avgDurationSeconds,
      successRate,
      sessions,
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error: unknown) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
