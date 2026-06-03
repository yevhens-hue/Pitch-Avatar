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

  // Apply sorting
  // Handle specific sort keys that are from joined tables
  if (sortBy === 'projectTitle') {
    // Note: sorting by joined tables requires an RPC or View in Supabase.
    // For now, we fallback to created_at if joining sort isn't natively trivial,
    // or we can sort by 'project_id'. 
    query = query.order('project_id', { ascending: sortOrder === 'asc' })
  } else if (sortBy === 'listenerName') {
    query = query.order('listener_id', { ascending: sortOrder === 'asc' })
  } else {
    // default sorts on the enrollment table columns like created_at, start_date, status
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
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
    return {
      id: e.id,
      title: e.title,
      listenerId: e.listener_id,
      projectId: e.project_id,
      status: e.status,
      startDate: e.start_date,
      emailSchedule: e.email_schedule || {},
      createdAt: e.created_at,
      targetType: e.email_schedule?.target_type || 'Anonymous',
      contentType: e.email_schedule?.content_type || 'Project',
      groupId: e.email_schedule?.group_id,
      presenterIds: e.email_schedule?.presenter_ids || [],
      bookCalendarOrStartAvatar: e.email_schedule?.book_calendar_or_start_avatar || false,
      progress: e.progress,
      timeSpent: e.time_spent,
      score: e.score,
      videoRecording: e.video_recording,
      groupName: e.groups ? e.groups.name : undefined,
      projectTitle: e.projects ? e.projects.title : 'Unknown Project',
      listenerName: e.listeners ? `${e.listeners.first_name || ''} ${e.listeners.last_name || ''}`.trim() : 'Anonymous',
      listenerEmail: e.listeners ? e.listeners.email : 'Anonymous',
    } as Enrollment
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

export async function getGroups() {
  const { data, error } = await supabase.from('groups').select('*').order('name');
  if (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
  return data;
}

export async function createEnrollment(enrollment: Omit<Enrollment, 'id' | 'createdAt'> & { userId?: string }) {
  const userId = enrollment.userId || '00000000-0000-0000-0000-000000000000'

  // 1. Quota Check (Sprint 4 constraint)
  // Check maximum seats purchased for this account
  const { data: seatsData } = await supabase
    .from('listener_seats')
    .select('*')
    .eq('user_id', userId)
    .single()

  const maxSeats = seatsData ? seatsData.max_seats : 100

  // Count active seats (distinct listeners with active enrollments: 'Pending' or 'In Progress')
  const { data: activeEnrollments } = await supabase
    .from('enrollments')
    .select('listener_id')
    .in('status', ['Pending', 'In Progress'])

  const activeListenerIds = new Set(
    activeEnrollments?.map(ae => ae.listener_id).filter(id => id !== null) || []
  )

  const activeSeatsCount = activeListenerIds.size

  // If enrolling a listener that is not already in the active pool, check if we exceed max seats
  if (enrollment.listenerId && !activeListenerIds.has(enrollment.listenerId)) {
    if (activeSeatsCount >= maxSeats) {
      throw new Error(`QUOTA_EXCEEDED: You have reached your limit of ${maxSeats} active Listener Seats. Please upgrade your seat plan or archive active enrollments.`)
    }
  }

  // 2. Insert Enrollment
  const { data: created, error } = await supabase
    .from('enrollments')
    .insert([{
      title: enrollment.title || `Enrollment-${Date.now()}`,
      listener_id: enrollment.listenerId,
      project_id: enrollment.projectId,
      status: enrollment.status || 'Pending',
      start_date: enrollment.startDate || new Date().toISOString(),
      email_schedule: {
        ...(enrollment.emailSchedule || {}),
        target_type: enrollment.targetType,
        content_type: enrollment.contentType,
        group_id: (enrollment as any).groupId,
        presenter_ids: enrollment.presenterIds || [],
        book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar || false,
      },
    }])
    .select()

  if (error) {
    console.error('Error creating enrollment:', error)
    throw new Error(error.message)
  }

  const enrollmentId = created[0].id

  // Create enrollment link
  const uniqueUrl = `pitch-avatar.com/v/enroll-${enrollmentId.slice(0, 8)}`
  await supabase
    .from('enrollment_links')
    .insert([{
      assignment_id: enrollmentId, // references the foreign key column (which maps to assignment_id in migrations)
      listener_id: enrollment.listenerId,
      project_id: enrollment.projectId,
      unique_url: uniqueUrl
    }])

  // Update active count in seats table
  await supabase
    .from('listener_seats')
    .update({ active_count: activeSeatsCount + 1 })
    .eq('user_id', userId)

  // Send Invitation Email if checked
  if (enrollment.emailSchedule?.sendInvite && enrollment.listenerId) {
    // Fetch details for placeholders
    const [listenerRes, projectRes] = await Promise.all([
      supabase.from('listeners').select('first_name, email').eq('id', enrollment.listenerId).single(),
      supabase.from('projects').select('title').eq('id', enrollment.projectId).single()
    ])
    
    if (listenerRes.data && projectRes.data) {
      await sendEnrollmentInvitation(
        listenerRes.data.email,
        enrollment.emailSchedule.inviteSubject || 'Welcome to your onboarding training session',
        enrollment.emailSchedule.inviteBody || 'Hello {{listener_first_name}},\\n\\nYour interactive video presentation is ready! Please use the link below to get started.',
        {
          listenerFirstName: listenerRes.data.first_name || '',
          projectTitle: projectRes.data.title || '',
          enrollmentLink: uniqueUrl
        }
      )
    }
  }

  revalidatePath('/enrollments')
  return created[0]
}

export async function updateEnrollment(id: string, enrollment: Partial<Omit<Enrollment, 'id' | 'createdAt'>>) {
  const { data, error } = await supabase
    .from('enrollments')
    .update({
      title: enrollment.title,
      status: enrollment.status,
      start_date: enrollment.startDate,
      email_schedule: {
        ...(enrollment.emailSchedule || {}),
        ...(enrollment.targetType !== undefined && { target_type: enrollment.targetType }),
        ...(enrollment.contentType !== undefined && { content_type: enrollment.contentType }),
        ...((enrollment as any).groupId !== undefined && { group_id: (enrollment as any).groupId }),
        ...(enrollment.presenterIds !== undefined && { presenter_ids: enrollment.presenterIds }),
        ...(enrollment.bookCalendarOrStartAvatar !== undefined && { book_calendar_or_start_avatar: enrollment.bookCalendarOrStartAvatar }),
      },
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating enrollment:', error)
    throw new Error(error.message)
  }

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

export async function getSeatsQuota(userId: string = '00000000-0000-0000-0000-000000000000') {
  const { data, error } = await supabase
    .from('listener_seats')
    .select('*')
    .eq('user_id', userId)

  if (error || !data || data.length === 0) {
    return { id: '', userId, maxSeats: 100, activeCount: 0 } as ListenerSeat
  }

  return {
    id: data[0].id,
    userId: data[0].user_id,
    maxSeats: data[0].max_seats,
    activeCount: data[0].active_count
  } as unknown as ListenerSeat
}

export async function updateSeatsQuota(maxSeats: number, userId: string = '00000000-0000-0000-0000-000000000000') {
  const { data, error } = await supabase
    .from('listener_seats')
    .update({ max_seats: maxSeats })
    .eq('user_id', userId)
    .select()

  if (error) {
    console.error('Error updating max seats:', error)
    throw new Error(error.message)
  }

  revalidatePath('/profile')
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
