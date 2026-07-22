import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch all projects
    let projectsQuery = supabase
      .from('projects')
      .select('id, title, created_at, type, user_id')
      .order('created_at', { ascending: false })

    if (dateFrom) projectsQuery = projectsQuery.gte('created_at', dateFrom)
    if (dateTo) projectsQuery = projectsQuery.lte('created_at', dateTo + 'T23:59:59')
    if (search) projectsQuery = projectsQuery.ilike('title', `%${search}%`)

    const { data: projects, error: projError } = await projectsQuery

    if (projError) throw projError

    if (!projects || projects.length === 0) {
      return NextResponse.json({ rows: [], total: 0, stats: { totalLinks: 0, totalListeners: 0, avgVisits: 0, completed: 0, avgTime: '00:00' } })
    }

    const projectIds = projects.map(p => p.id)

    // 2. Fetch enrollment_links grouped by project_id (link opened count)
    const { data: links } = await supabase
      .from('enrollment_links')
      .select('project_id, id, created_at')
      .in('project_id', projectIds)

    // 3. Fetch enrollments for stats (time_spent, status, progress)
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('project_id, status, time_spent, progress, score, created_at')
      .in('project_id', projectIds)

    // 4. Fetch presenters mapping via user_id (projects.user_id)
    // (No direct user->name join, use fallback "Yevhen Shaforostov" for now)

    // Build lookup maps
    const linksByProject: Record<string, number> = {}
    const linksLastViewedByProject: Record<string, string> = {}
    for (const link of links || []) {
      const pid = link.project_id
      linksByProject[pid] = (linksByProject[pid] || 0) + 1
      const existing = linksLastViewedByProject[pid]
      if (!existing || link.created_at > existing) {
        linksLastViewedByProject[pid] = link.created_at
      }
    }

    const enrollsByProject: Record<string, {
      count: number
      completed: number
      totalTime: number
      totalProgress: number
    }> = {}
    for (const e of enrollments || []) {
      const pid = e.project_id
      if (!enrollsByProject[pid]) enrollsByProject[pid] = { count: 0, completed: 0, totalTime: 0, totalProgress: 0 }
      enrollsByProject[pid].count += 1
      enrollsByProject[pid].totalTime += e.time_spent || 0
      enrollsByProject[pid].totalProgress += e.progress || 0
      if (e.status === 'Completed') enrollsByProject[pid].completed += 1
    }

    // Build rows
    const rows = projects.map(p => {
      const linksCount = linksByProject[p.id] || 0
      const enStats = enrollsByProject[p.id] || { count: 0, completed: 0, totalTime: 0, totalProgress: 0 }
      const avgTimeSecs = enStats.count > 0 ? Math.round(enStats.totalTime / enStats.count) : 0
      const lastViewed = linksLastViewedByProject[p.id]
      const presenterConnRate = linksCount > 0 ? '0%' : '0%' // no real call data yet

      return {
        id: p.id,
        presentationTitle: p.title,
        author: 'Yevhen Shaforostov', // real auth needed for per-user
        presenter: p.type === 'chat-avatar' ? 'Ai-chat-avatar' : 'Yevhen Shaforostov',
        dateCreated: p.created_at.split('T')[0],
        source: 'Web',
        linkOpened: linksCount,
        formsFilled: 0,
        presenterConnected: 0,
        chats: 0,
        listenerCalledPresenter: 0,
        slidesSeen: enStats.count > 0 ? Math.round(enStats.totalProgress / enStats.count / 10) : 0,
        avgTimeSpent: formatDuration(avgTimeSecs),
        lastViewed: lastViewed
          ? new Date(lastViewed).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—',
        presenterConnectionRate: presenterConnRate,
        goalsActivated: enStats.completed,
      }
    })

    // Summary stats
    const totalLinks = Object.values(linksByProject).reduce((s, v) => s + v, 0)
    const totalListeners = (enrollments || []).length
    const allTimes = (enrollments || []).map(e => e.time_spent || 0)
    const avgTimeSecs = allTimes.length > 0 ? Math.round(allTimes.reduce((s, v) => s + v, 0) / allTimes.length) : 0
    const completed = (enrollments || []).filter(e => e.status === 'Completed').length

    const stats = {
      totalLinks,
      totalListeners,
      avgVisits: projects.length > 0 ? Math.round(totalListeners / projects.length) : 0,
      completed,
      avgTime: formatDuration(avgTimeSecs),
    }

    // Paginate
    const total = rows.length
    const paginated = rows.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({ rows: paginated, total, stats })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
