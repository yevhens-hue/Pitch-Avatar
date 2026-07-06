import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/auth-guard';

/**
 * POST /api/sara/create-project
 *
 * Requires: Authorization: Bearer <supabase_access_token>
 *
 * Body:
 *   type: 'chat-avatar' | 'presentation' | 'video'
 *   title?: string
 *   avatarName?: string
 *   role?: string
 */
export async function POST(req: Request) {
  try {
    // Get authenticated user from Bearer token
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized — please log in' }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, avatarName, role } = body;

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 });
    }

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey || anonKey);

    const dbType = type === 'video' ? 'video' : 'presentation';
    const projectTitle = type === 'chat-avatar'
      ? `${avatarName || 'AI Avatar'} (Chat Avatar)`
      : (title || 'New Presentation');

    // Build the insert payload with the real authenticated user ID
    const insertPayload: Record<string, unknown> = {
      title: projectTitle,
      type: dbType,
      status: 'active',
      user_id: user.id,
    };

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
