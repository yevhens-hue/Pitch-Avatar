import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guard';
import { supabase } from '@/lib/supabase';

// ─── GET /api/coach/instructions?projectId=xxx ──────────────────────────────
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
      .from('coach_settings')
      .select('system_prompt')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Fetch instructions error:', error);
      return NextResponse.json({ error: 'Failed to fetch instructions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, systemPrompt: data?.system_prompt || '' });
  } catch (error: unknown) {
    console.error('GET Instructions Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST /api/coach/instructions ───────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const { projectId, systemPrompt } = await req.json();

    if (!projectId || systemPrompt === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Upsert the system_prompt in coach_settings
    const { error } = await supabase
      .from('coach_settings')
      .upsert({
        project_id: projectId,
        system_prompt: systemPrompt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id' });

    if (error) {
      console.error('Save instructions error:', error);
      return NextResponse.json({ error: 'Failed to save instructions' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('POST Instructions Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
