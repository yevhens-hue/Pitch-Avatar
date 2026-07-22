import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Get project info
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('id, title, created_at, type')
      .eq('id', projectId)
      .single()

    if (projError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 2. Get enrollment links for this project
    const { data: links } = await supabase
      .from('enrollment_links')
      .select('id, listener_id, created_at')
      .eq('project_id', projectId)

    // 3. Get enrollments for this project
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id, listener_id, status, time_spent, progress, score, created_at, title')
      .eq('project_id', projectId)

    // 4. Get listener details for enrolled listeners
    const listenerIds = [...new Set([
      ...(links || []).map(l => l.listener_id).filter(Boolean),
      ...(enrollments || []).map(e => e.listener_id).filter(Boolean),
    ])] as string[]

    const { data: listeners } = listenerIds.length > 0
      ? await supabase.from('listeners').select('id, name, email').in('id', listenerIds)
      : { data: [] }

    const listenerMap: Record<string, { name: string; email: string }> = {}
    for (const l of listeners || []) {
      listenerMap[l.id] = { name: l.name, email: l.email }
    }

    // Build listeners report rows from enrollments
    const listenerRows = (enrollments || []).map(e => {
      const info = e.listener_id ? listenerMap[e.listener_id] : null
      const timeSecs = e.time_spent || 0
      return {
        id: e.id,
        firstName: info?.name?.split(' ')[0] || 'Unknown',
        country: 'N/A',
        dateTimeEntered: new Date(e.created_at).toLocaleString('uk-UA', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        slidesSeen: Math.round(e.progress / 10) || 0,
        timeSpent: formatDuration(timeSecs),
        calledPresenter: 0,
        reactions: 0,
        chatMessageSent: 0,
        presenterConnected: 0,
      }
    })

    // Stats
    const totalListeners = enrollments?.length || 0
    const allTimes = (enrollments || []).map(e => e.time_spent || 0)
    const avgTimeSecs = totalListeners > 0 ? Math.round(allTimes.reduce((s, v) => s + v, 0) / totalListeners) : 0
    const completed = (enrollments || []).filter(e => e.status === 'Completed').length

    // Performance percentages
    const completedPct = totalListeners > 0 ? Math.round((completed / totalListeners) * 100) : 0
    const interactionsPct = 0 // no chat data yet
    const reactionsPct = 0
    const goalsPct = completedPct

    // Slide dropoff: simulate based on progress distribution
    const slideDropoff = Array.from({ length: 11 }, (_, i) => {
      const slideThreshold = (i + 1) * 9 // 0-100 progress mapped to 11 slides
      const listenersAtSlide = (enrollments || []).filter(e => (e.progress || 0) >= slideThreshold).length
      return totalListeners > 0 ? Math.round((listenersAtSlide / totalListeners) * 100) : 0
    })

    return NextResponse.json({
      id: project.id,
      title: project.title,
      presenter: project.type === 'chat-avatar' ? 'Ai-chat-avatar' : 'Yevhen Shaforostov',
      totalListeners,
      avgSessionTime: formatDuration(avgTimeSecs),
      leadsGenerated: 0,
      callPresenterClicks: 0,
      scheduleMeetingClicks: 0,
      listeners: listenerRows,
      performance: {
        completedBy: completedPct,
        interactionsWithPresenter: interactionsPct,
        reactions: reactionsPct,
        goalsAchieved: goalsPct,
      },
      slideDropoff,
    })
  } catch (error: any) {
    console.error('Analytics detail API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
