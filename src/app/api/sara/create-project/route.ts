import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client (uses service role to bypass RLS)
const getSupabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

/**
 * POST /api/sara/create-project
 *
 * Body:
 *   type: 'presentation' | 'chat-avatar' | 'video'
 *   title?: string           — project title
 *   avatarName?: string      — avatar name (chat-avatar only)
 *   role?: string            — avatar role (chat-avatar only)
 */
export async function POST(req: Request) {
  try {
    const { type, title, avatarName, role } = await req.json();

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Map Sara's type → DB type
    const dbType = type === 'chat-avatar' ? 'presentation' : (type === 'video' ? 'video' : 'presentation');
    const projectTitle = title || avatarName
      ? (type === 'chat-avatar' ? `${avatarName || 'AI Avatar'} (Chat Avatar)` : (title || 'New Presentation'))
      : 'New Project';

    const metadata: Record<string, unknown> = {};
    if (type === 'chat-avatar' && role) {
      metadata.avatarRole = role;
      metadata.avatarName = avatarName;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        title: projectTitle,
        type: dbType,
        status: 'active',
        metadata,
        // Placeholder user — in production, get from session/auth
        user_id: '00000000-0000-0000-0000-000000000000',
      }])
      .select()
      .single();

    if (error) {
      console.error('[Sara CreateProject] DB error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the created project so the client can redirect to it
    return NextResponse.json({
      success: true,
      projectId: project.id,
      title: project.title,
      type: project.type,
      redirectUrl: type === 'chat-avatar'
        ? `/chat-avatar/create?projectId=${project.id}&name=${encodeURIComponent(avatarName || '')}&role=${encodeURIComponent(role || '')}`
        : `/editor?projectId=${project.id}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Sara CreateProject] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
