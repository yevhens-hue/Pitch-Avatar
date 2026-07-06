import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kapkqziyceefxluxlvqc.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_juNeZXupS_SXWtvvK1MdLw_gVRnqhsE';

/**
 * POST /api/sara/create-project
 *
 * Body:
 *   type: 'chat-avatar' | 'presentation' | 'video'
 *   title?: string
 *   avatarName?: string
 *   role?: string
 *   userId: string  — required, the authenticated user's Supabase UUID
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, avatarName, role, userId } = body;

    console.log('[Sara CreateProject] called:', { type, userId, hasServiceKey: !!SERVICE_ROLE_KEY });

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Always prefer service role key to bypass RLS policies on user_id.
    // Fall back to anon key only when service role is missing (dev environment).
    const key = SERVICE_ROLE_KEY || ANON_KEY;
    const supabase = createClient(SUPABASE_URL, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const dbType = type === 'video' ? 'video' : 'presentation';
    const projectTitle = type === 'chat-avatar'
      ? `${avatarName || 'AI Avatar'} (Chat Avatar)`
      : (title || 'New Presentation');

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        title: projectTitle,
        type: dbType,
        status: 'active',
        user_id: userId,
      }])
      .select()
      .single();

    if (error) {
      console.error('[Sara CreateProject] DB error:', error.code, error.message);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }

    const redirectUrl = type === 'chat-avatar'
      ? `/chat-avatar/create?projectId=${project.id}&name=${encodeURIComponent(avatarName || '')}&role=${encodeURIComponent(role || '')}`
      : `/editor?projectId=${project.id}`;

    console.log('[Sara CreateProject] Created:', project.id, '->', redirectUrl);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      title: project.title,
      redirectUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Sara CreateProject] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
