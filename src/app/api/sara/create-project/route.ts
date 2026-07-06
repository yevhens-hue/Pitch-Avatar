import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/sara/create-project
 *
 * Uses the service role key to bypass RLS, so the project can be created
 * on behalf of the authenticated user without needing their JWT on the server.
 *
 * Body:
 *   type: 'chat-avatar' | 'presentation' | 'video'
 *   title?: string
 *   avatarName?: string
 *   role?: string
 *   userId?: string   — the real user ID from client auth context
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, avatarName, role, userId } = body;

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    // Use service role key to bypass RLS entirely
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
    }

    // Prefer service role key to bypass RLS; fall back to anon
    const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey || '');

    const dbType = type === 'video' ? 'video' : 'presentation';
    const projectTitle = type === 'chat-avatar'
      ? `${avatarName || 'AI Avatar'} (Chat Avatar)`
      : (title || 'New Presentation');

    const metadata: Record<string, unknown> = {};
    if (type === 'chat-avatar') {
      if (role) metadata.avatarRole = role;
      if (avatarName) metadata.avatarName = avatarName;
    }

    // Build the insert payload — only include user_id if we have a real one
    const insertPayload: Record<string, unknown> = {
      title: projectTitle,
      type: dbType,
      status: 'active',
      metadata,
    };
    if (userId) {
      insertPayload.user_id = userId;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('[Sara CreateProject] DB error:', error.code, error.message, error.details);
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 500 }
      );
    }

    const redirectUrl = type === 'chat-avatar'
      ? `/chat-avatar/create?projectId=${project.id}&name=${encodeURIComponent(avatarName || '')}&role=${encodeURIComponent(role || '')}`
      : `/editor?projectId=${project.id}`;

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
