'use server'

import { supabase } from '@/lib/supabase'
import { Enrollment, ListenerSeat, MailDomain } from '@/types/listeners'
import { revalidatePath } from 'next/cache'
import { sendEnrollmentInvitation } from '@/lib/email'

/**
 * ── Enrollments CRUD ──────────────────────────────────────────────────────────
 */

export async function getEnrollments(options?: {
  search?: string
  status?: string
  groupName?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}) {
  const { 
    search = '', 
    status, 
    groupName, 
    sortBy = 'created_at', 
    sortOrder = 'desc', 
    limit, 
    offset = 0 
  } = options || {}

  let query = supabase
    .from('enrollments')
    .select(`
      *,
      projects(title),
      listeners(email, first_name, last_name),
      groups${groupName && groupName !== 'All Group' ? '!inner' : ''}(name)
    `, { count: 'exact' })

  // Apply status filter
  if (status && status !== 'All Status') {
    query = query.eq('status', status)
  }

  // Apply group filter
  if (groupName && groupName !== 'All Group') {
    query = query.eq('groups.name', groupName)
  }

  // Apply search
  if (search.trim()) {
    query = query.ilike('title', `%${search}%`)
  }

  // Mapping camelCase sort keys to DB snake_case column names
  const sortByMap: Record<string, string> = {
    createdAt: 'created_at',
    startDate: 'start_date',
    projectTitle: 'project_id',
    listenerName: 'listener_id',
  }
  const dbSortBy = sortByMap[sortBy] || sortBy

  // Apply sorting
  // Handle specific sort keys that are from joined tables
  if (dbSortBy === 'project_id') {
    // Note: sorting by joined tables requires an RPC or View in Supabase.
    // For now, we fallback to project_id sort.
    query = query.order('project_id', { ascending: sortOrder === 'asc' })
  } else if (dbSortBy === 'listener_id') {
    query = query.order('listener_id', { ascending: sortOrder === 'asc' })
  } else {
    // default sorts on the enrollment table columns like created_at, start_date, status
    query = query.order(dbSortBy, { ascending: sortOrder === 'asc' })
  }


  // Apply pagination
  if (limit) {
    query = query.range(offset, offset + limit - 1)
  }

  const { data: enrollments, error: enrollError, count } = await query

  if (enrollError) {
    console.error('Error fetching enrollments:', enrollError)
    return { data: [], count: 0 }
  }

  const joined = enrollments.map((e: any) => {
    const result = {
      id: e.id,
      title: e.title,
      listenerId: e.listener_id,
      projectId: e.project_id,
      status: e.status,
      startDate: e.start_date,
      expirationDays: e.expiration_days,
      expiresAt: e.expires_at,
      emailSchedule: e.email_schedule || {},
      createdAt: e.created_at,
      targetType: e.target_type || 'Anonymous',
      contentType: e.content_type || 'Project',
      groupId: e.group_id,
      presenterIds: e.email_schedule?.presenter_ids || [],
      bookCalendarOrStartAvatar: e.email_schedule?.book_calendar_or_start_avatar || false,
      progress: e.progress,
      timeSpent: e.time_spent,
      score: e.score,
      videoRecording: e.video_recording,
      lastActivityAt: e.last_activity_at ?? null,
      groupName: e.groups ? e.groups.name : undefined,
      projectTitle: e.projects ? e.projects.title : 'Unknown Project',
      listenerName: e.listeners ? `${e.listeners.first_name || ''} ${e.listeners.last_name || ''}`.trim() : 'Anonymous',
      listenerEmail: e.listeners ? e.listeners.email : 'Anonymous',
    } as Enrollment

    if (e.expires_at && new Date(e.expires_at) < new Date() && result.status !== 'Completed' && result.status !== 'Expired') {
      result.status = 'Expired'
      // Optimistically update DB async
      supabase.from('enrollments').update({ status: 'Expired' }).eq('id', e.id).then()
    }
    return result
  })

  // Fallback local search for fields we couldn't query via ilike (relations)
  let finalData = joined
  if (search.trim()) {
    const term = search.toLowerCase()
    finalData = joined.filter(e => 
      e.projectTitle?.toLowerCase().includes(term) ||
      e.listenerName?.toLowerCase().includes(term) ||
      e.listenerEmail?.toLowerCase().includes(term) ||
      e.title.toLowerCase().includes(term)
    )
  }

  return { data: finalData, count: count || 0 }
}

export async function getEnrollmentStats() {
  const { data: allEnrollments, error } = await supabase
    .from('enrollments')
    .select('status, listener_id')

  if (error) {
    console.error('Error fetching enrollment stats:', error)
    return { activeCount: 0, uniqueListeners: 0, completionRate: 0 }
  }

  const activeCount = allEnrollments.filter(e => e.status === 'In Progress' || e.status === 'Pending').length
  const uniqueListeners = new Set(allEnrollments.map(e => e.listener_id).filter(Boolean)).size
  const completedCount = allEnrollments.filter(e => e.status === 'Completed').length
  const totalCount = allEnrollments.length
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  return { activeCount, completedCount, uniqueListeners, completionRate }
}

export async function getGroups() {
  const { data, error } = await supabase.from('groups').select('*').order('name');
  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
  return data;
}

export async function getPresenters() {
  const { data, error } = await supabase
    .from('presenters')
    .select('*')
    .order('first_name');

  if (error) {
    console.error('Error fetching presenters:', error);
    return [];
  }

  return data;
}

export async function getCourses() {
  const { data: existingCourses, error: getCrsError } = await supabase
    .from('courses')
    .select('*')
    .order('name')

  if (getCrsError) {
    console.error('Error fetching courses:', getCrsError)
    return []
  }

  if (!existingCourses || existingCourses.length === 0) {
    try {
      const { data: projectsData } = await supabase.from('projects').select('id, title')
      if (projectsData && projectsData.length > 0) {
        const { data: newCourses } = await supabase
          .from('courses')
          .insert([
            { name: 'Onboarding & Training Pack' },
            { name: 'Sales & Product Pitch' }
          ])
          .select()

        if (newCourses && newCourses.length > 0) {
          const courseProjectsToInsert = []
          if (projectsData[0]) {
            courseProjectsToInsert.push({ course_id: newCourses[0].id, project_id: projectsData[0].id })
          }
          if (projectsData[1]) {
            courseProjectsToInsert.push({ course_id: newCourses[0].id, project_id: projectsData[1].id })
          }
          if (projectsData[projectsData.length - 1]) {
            courseProjectsToInsert.push({ course_id: newCourses[1].id, project_id: projectsData[projectsData.length - 1].id })
          }

          if (courseProjectsToInsert.length > 0) {
            await supabase.from('course_projects').insert(courseProjectsToInsert)
          }

          return newCourses
        }
      }
    } catch (err) {
      console.error('Failed to seed courses mock:', err)
    }
  }

  return existingCourses || []
}

export async function getEnrollmentLinks(enrollmentId: string) {
  const { data, error } = await supabase
    .from('enrollment_links')
    .select(`
      *,
      listeners(email, first_name, last_name),
      projects(title)
    `)
    .eq('assignment_id', enrollmentId)

  if (error) {
    console.error('Error fetching enrollment links:', error)
    return []
  }

  return data.map((l: any) => ({
    id: l.id,
    assignmentId: l.assignment_id,
    listenerId: l.listener_id,
    projectId: l.project_id,
    uniqueUrl: l.unique_url,
    createdAt: l.created_at,
    listenerName: l.listeners ? `${l.listeners.first_name || ''} ${l.listeners.last_name || ''}`.trim() : 'Anonymous',
    listenerEmail: l.listeners ? l.listeners.email : 'Anonymous',
    projectTitle: l.projects ? l.projects.title : 'Project',
  }))
}

export async function generateEnrollmentLinks(enrollmentId: string) {
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .select('*')
    .eq('id', enrollmentId)
    .single()

  if (enrollError || !enrollment) {
    console.error('Error fetching enrollment for link generation:', enrollError)
    throw new Error('Enrollment not found')
  }

  await supabase
    .from('enrollment_links')
    .delete()
    .eq('assignment_id', enrollmentId)

  let listenerIds: (string | null)[] = [null]
  if (enrollment.target_type === 'listener' && enrollment.listener_id) {
    listenerIds = [enrollment.listener_id]
  } else if (enrollment.target_type === 'group' && enrollment.group_id) {
    const { data: grpListeners } = await supabase
      .from('listener_groups')
      .select('listener_id')
      .eq('group_id', enrollment.group_id)
    if (grpListeners && grpListeners.length > 0) {
      listenerIds = grpListeners.map(gl => gl.listener_id)
    }
  }

  let projectIds: string[] = []
  if (enrollment.content_type === 'project' && enrollment.project_id) {
    projectIds = [enrollment.project_id]
  } else if (enrollment.content_type === 'course' && enrollment.project_id) {
    const { data: crsProjects } = await supabase
      .from('course_projects')
      .select('project_id')
      .eq('course_id', enrollment.project_id)
    if (crsProjects && crsProjects.length > 0) {
      projectIds = crsProjects.map(cp => cp.project_id)
    }
  }

  if (projectIds.length === 0 && enrollment.project_id) {
    projectIds = [enrollment.project_id]
  }

  const linksToInsert = []
  for (const listenerId of listenerIds) {
    for (const projectId of projectIds) {
      const randHex = Math.random().toString(16).slice(2, 10);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar.com';
      const cleanAppUrl = appUrl.replace(/^https?:\/\//, ''); // remove protocol for display if needed, but it's better to keep full URL
      const uniqueUrl = `${appUrl}/v/enroll-${enrollmentId.slice(0, 8)}-${randHex}`
      linksToInsert.push({
        assignment_id: enrollmentId,
        listener_id: listenerId,
        project_id: projectId,
        unique_url: uniqueUrl,
        group_id: enrollment.group_id
      })
    }
  }

  if (linksToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('enrollment_links')
      .insert(linksToInsert)
    if (insertError) {
      console.error('Error inserting enrollment links:', insertError)
      throw new Error(insertError.message)
    }
  }

  return getEnrollmentLinks(enrollmentId)
}

export async function createEnrollmentDraft(enrollment: Omit<Enrollment, 'id' | 'createdAt'> & { userId?: string }) {
  const userId = enrollment.userId || '00000000-0000-0000-0000-000000000000'

  // 1. Quota Check (Sprint 4 constraint)
  // Check maximum seats purchased for this account
  const { data: seatsData, error: seatsError } = await supabase
    .from('listener_seats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // Quota check removed as per user request

  const startDateStr = enrollment.startDate || new Date().toISOString()
  const expDays = enrollment.expirationDays !== undefined ? enrollment.expirationDays : 14
  let expiresAtStr = null
  if (expDays > 0) {
    const expDate = new Date(startDateStr)
    expDate.setDate(expDate.getDate() + expDays)
    expiresAtStr = expDate.toISOString()
  }

  // 2. Insert Enrollment
  const { data: created, error } = await supabase
    .from('enrollments')
    .insert([{
      title: enrollment.title || `Enrollment-${Date.now()}`,
      listener_id: enrollment.listenerId,
      project_id: enrollment.projectId,
      status: enrollment.status || 'Pending',
      start_date: startDateStr,
      expiration_days: expDays,
      expires_at: expiresAtStr,
      email_schedule: {
        ...(enrollment.emailSchedule || {}),
        presenter_ids: enrollment.presenterIds || [],
        book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar || false,
      },
      target_type: enrollment.targetType,
      content_type: enrollment.contentType,
      group_id: (enrollment as any).groupId,
    }])
    .select()

  if (error) {
    console.error('Error creating enrollment:', error)
    return { _error: error.message } as any;
  }

  const enrollmentId = created[0].id

  // Quota check removed, so no active_count update needed either

  revalidatePath('/enrollments')
  return created[0]
}

export async function sendEnrollmentInvitationAction(enrollmentId: string) {
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .select('*')
    .eq('id', enrollmentId)
    .single()

  if (enrollError || !enrollment || !enrollment.listener_id || !enrollment.project_id) {
    return { _error: 'Invalid enrollment for email sending or missing listener/project.' } as any;
  }

  const [listenerRes, projectRes, generatedLinkRes] = await Promise.all([
    supabase.from('listeners').select('first_name, email').eq('id', enrollment.listener_id).single(),
    supabase.from('projects').select('title').eq('id', enrollment.project_id).single(),
    supabase.from('enrollment_links').select('unique_url').eq('assignment_id', enrollmentId).eq('listener_id', enrollment.listener_id).limit(1).maybeSingle()
  ])
  
  if (listenerRes.data && projectRes.data) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar.com';
    const enrollmentLink = generatedLinkRes.data?.unique_url || `${appUrl}/v/enroll-${enrollmentId.slice(0, 8)}`
    
    await sendEnrollmentInvitation(
      listenerRes.data.email,
      enrollment.email_schedule?.inviteSubject || 'Welcome to your onboarding training session',
      enrollment.email_schedule?.inviteBody || 'Hello {{listener_first_name}},\\n\\nYour interactive video presentation is ready! Please use the link below to get started.',
      {
        listenerFirstName: listenerRes.data.first_name || '',
        projectTitle: projectRes.data.title || '',
        enrollmentLink: enrollmentLink
      }
    )
  }
}

export async function refreshEnrollmentLinks(enrollmentId: string) {
  await generateEnrollmentLinks(enrollmentId)
  
  await supabase
    .from('enrollments')
    .update({ status: 'Pending' })
    .eq('id', enrollmentId)
    
  revalidatePath('/enrollments')
  return getEnrollmentLinks(enrollmentId)
}

export async function updateEnrollment(id: string, enrollment: Partial<Omit<Enrollment, 'id' | 'createdAt'>>) {
  let expiresAtStr = undefined
  if (enrollment.expirationDays !== undefined && enrollment.expirationDays > 0) {
    // If startDate is updated, use it, else we probably shouldn't recalculate unless needed, 
    // but for simplicity let's recalculate based on now if we are changing expiration days.
    // Ideally we'd fetch the existing start_date, but let's just use now() for updates.
    const expDate = new Date(enrollment.startDate || new Date().toISOString())
    expDate.setDate(expDate.getDate() + enrollment.expirationDays)
    expiresAtStr = expDate.toISOString()
  } else if (enrollment.expirationDays === null || enrollment.expirationDays === 0) {
    expiresAtStr = null
  }

  const { data, error } = await supabase
    .from('enrollments')
    .update({
      title: enrollment.title,
      status: enrollment.status,
      start_date: enrollment.startDate,
      ...(enrollment.expirationDays !== undefined && { 
        expiration_days: enrollment.expirationDays, 
        expires_at: expiresAtStr 
      }),
      email_schedule: {
        ...(enrollment.emailSchedule || {}),
        ...(enrollment.presenterIds !== undefined && { presenter_ids: enrollment.presenterIds }),
        ...(enrollment.bookCalendarOrStartAvatar !== undefined && { book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar }),
      },
      target_type: enrollment.targetType,
      content_type: enrollment.contentType,
      group_id: (enrollment as any).groupId,
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating enrollment:', error)
    throw new Error(error.message)
  }

  // Re-generate links to reflect any updated listeners, projects, group, or course
  await generateEnrollmentLinks(id)

  revalidatePath('/enrollments')
  return data[0]
}

export async function deleteEnrollment(id: string) {
  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting enrollment:', error)
    throw new Error(error.message)
  }

  revalidatePath('/enrollments')
}


export async function duplicateEnrollment(id: string) {
  // 1. Fetch existing enrollment
  const { data: existing, error: fetchError } = await supabase
    .from('enrollments')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    throw new Error(fetchError?.message || 'Enrollment not found')
  }

  // 2. Prepare duplicate — strip server-generated and non-existent columns
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    progress: _p,
    time_spent: _ts,
    score: _s,
    ...duplicateData
  } = existing as Record<string, unknown>

  const { data, error } = await supabase
    .from('enrollments')
    .insert([{
      ...duplicateData,
      title: `${existing.title || 'Enrollment'} (Copy)`,
      status: 'Pending',
    }])
    .select()

  if (error) {
    console.error('Error duplicating enrollment:', error)
    throw new Error(error.message)
  }

  revalidatePath('/enrollments')
  return data[0]
}


export async function manualEnterResult(id: string, status: 'Completed' | 'Failed', date: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .update({
      status,
      start_date: date // Manual entry setting date and status overrides
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error in manual entry override:', error)
    throw new Error(error.message)
  }

  revalidatePath('/enrollments')
  return data[0]
}

/**
 * ── Billing / Seats Administration ──────────────────────────────────────────
 */

export async function calculateActiveSeats(): Promise<number> {
  const { data: activeEnrollments } = await supabase
    .from('enrollments')
    .select('listener_id, target_type, group_id, expires_at')
    .in('status', ['Pending', 'In Progress'])

  const now = new Date()
  const validActive = activeEnrollments?.filter(ae => !ae.expires_at || new Date(ae.expires_at) >= now) || []

  const activeListenerIds = new Set<string>()
  let anonymousCount = 0

  for (const ae of validActive) {
    if (ae.target_type === 'anonymous' || (!ae.listener_id && !ae.group_id)) {
      anonymousCount++
    } else if (ae.listener_id) {
      activeListenerIds.add(ae.listener_id)
    }
  }

  const groupIds = Array.from(new Set(validActive.map(ae => ae.group_id).filter(Boolean)))
  if (groupIds.length > 0) {
    const { data: grpListeners } = await supabase
      .from('listener_groups')
      .select('listener_id')
      .in('group_id', groupIds as string[])
    if (grpListeners) {
      for (const gl of grpListeners) {
        if (gl.listener_id) activeListenerIds.add(gl.listener_id)
      }
    }
  }

  return activeListenerIds.size + anonymousCount
}

export async function getSeatsQuota(userId: string = '00000000-0000-0000-0000-000000000000') {
  const activeCount = await calculateActiveSeats()

  const { data, error } = await supabase
    .from('listener_seats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return { id: '', userId, maxSeats: 1, activeCount } as ListenerSeat
  }

  if (data.active_count !== activeCount) {
    supabase.from('listener_seats').update({ active_count: activeCount }).eq('user_id', userId).then()
  }

  return {
    id: data.id,
    userId: data.user_id,
    maxSeats: data.max_seats,
    activeCount: activeCount
  } as unknown as ListenerSeat
}

export async function updateSeatsQuota(maxSeats: number, userId: string = '00000000-0000-0000-0000-000000000000') {
  // Use upsert so the record is created if it doesn't exist yet
  const { data, error } = await supabase
    .from('listener_seats')
    .upsert({ user_id: userId, max_seats: maxSeats, active_count: 0 }, { onConflict: 'user_id' })
    .select()

  if (error) {
    console.error('Error updating max seats:', error)
    throw new Error(error.message)
  }

  revalidatePath('/enrollments')
  revalidatePath('/settings')
  return data[0]
}

/**
 * ── Mail Domain Settings ────────────────────────────────────────────────────
 */

export async function getMailDomain(userId: string = '00000000-0000-0000-0000-000000000000') {
  const { data, error } = await supabase
    .from('mail_domains')
    .select('*')
    .eq('user_id', userId)

  if (error || !data || data.length === 0) {
    return null
  }

  return {
    id: data[0].id,
    domainName: data[0].domain_name,
    senderEmail: data[0].sender_email,
    isConfirmed: data[0].is_confirmed,
    userId: data[0].user_id
  } as MailDomain
}

export async function saveMailDomain(domainName: string, senderEmail: string, userId: string = '00000000-0000-0000-0000-000000000000') {
  const existing = await getMailDomain(userId)

  let result
  if (existing) {
    const { data, error } = await supabase
      .from('mail_domains')
      .update({
        domain_name: domainName,
        sender_email: senderEmail,
        is_confirmed: true // Silently confirm for mockup purposes
      })
      .eq('id', existing.id)
      .select()
    if (error) throw new Error(error.message)
    result = data[0]
  } else {
    const { data, error } = await supabase
      .from('mail_domains')
      .insert([{
        domain_name: domainName,
        sender_email: senderEmail,
        is_confirmed: true,
        user_id: userId
      }])
      .select()
    if (error) throw new Error(error.message)
    result = data[0]
  }

  revalidatePath('/profile')
  return result
}

export async function getEnrollmentByLinkId(linkId: string) {
  const { data: links, error: linkError } = await supabase
    .from('enrollment_links')
    .select('*')
    .ilike('unique_url', `%${linkId}%`)
    .limit(1)

  if (linkError || !links || links.length === 0) {
    console.error('Error fetching enrollment by link ID:', linkError)
    return null
  }

  const link = links[0]
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .select('*, projects(*)')
    .eq('id', link.assignment_id)
    .single()

  if (enrollError || !enrollment) {
    console.error('Error fetching enrollment details:', enrollError)
    return null
  }

  let currentStatus = enrollment.status
  if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date() && currentStatus !== 'Completed' && currentStatus !== 'Expired') {
    currentStatus = 'Expired'
    supabase.from('enrollments').update({ status: 'Expired' }).eq('id', enrollment.id).then()
  }

  return {
    enrollmentId: enrollment.id,
    projectId: link.project_id,
    listenerId: link.listener_id,
    status: currentStatus,
    projectTitle: enrollment.projects?.title || 'Presentation Project',
    slidesCount: enrollment.projects?.slides_count || 12,
    slides: enrollment.projects?.slides || [],
  }
}

export async function updateEnrollmentStatusAction(id: string, status: string) {
  const updateData: any = { status }
  if (status === 'In Progress') {
    updateData.start_date = new Date().toISOString()
  }
  const { data, error } = await supabase
    .from('enrollments')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating enrollment status:', error)
    throw new Error(error.message)
  }

  revalidatePath('/enrollments')
  return data[0]
}

