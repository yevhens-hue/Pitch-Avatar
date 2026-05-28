'use server'

import { supabase } from '@/lib/supabase'
import { Enrollment, ListenerSeat, MailDomain } from '@/types/listeners'
import { revalidatePath } from 'next/cache'

/**
 * ── Enrollments CRUD ──────────────────────────────────────────────────────────
 */

export async function getEnrollments(search: string = '') {
  // Fetch enrollments and perform client-side joins (for robust compatibility with Supabase mocks)
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('*')
    .order('created_at', { ascending: false })

  if (enrollError) {
    console.error('Error fetching enrollments:', enrollError)
    return []
  }

  // Fetch all projects for join
  const { data: projects } = await supabase.from('projects').select('id, title')
  // Fetch all listeners for join
  const { data: listeners } = await supabase.from('listeners').select('id, email, first_name, last_name')

  const projectsMap = new Map(projects?.map(p => [p.id, p.title]) || [])
  const listenersMap = new Map(listeners?.map(l => [l.id, l]) || [])

  const joined = enrollments.map((e: any) => {
    const listener = e.listener_id ? listenersMap.get(e.listener_id) : null
    const projectTitle = projectsMap.get(e.project_id) || 'Unknown Project'

    return {
      id: e.id,
      title: e.title,
      listenerId: e.listener_id,
      projectId: e.project_id,
      status: e.status,
      startDate: e.start_date,
      emailSchedule: e.email_schedule || {},
      createdAt: e.created_at,
      projectTitle,
      listenerName: listener ? `${listener.first_name || ''} ${listener.last_name || ''}`.trim() : 'Anonymous',
      listenerEmail: listener ? listener.email : 'Anonymous',
    } as Enrollment
  })

  if (search.trim()) {
    const term = search.toLowerCase()
    return joined.filter(e => 
      e.projectTitle?.toLowerCase().includes(term) ||
      e.listenerName?.toLowerCase().includes(term) ||
      e.listenerEmail?.toLowerCase().includes(term) ||
      e.title.toLowerCase().includes(term)
    )
  }

  return joined
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
      email_schedule: enrollment.emailSchedule || {}
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
      email_schedule: enrollment.emailSchedule
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
