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
    return {
      id: e.id,
      title: e.title,
      listenerId: e.listener_id,
      projectId: e.project_id,
      status: e.status,
      startDate: e.start_date,
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

  return { activeCount, uniqueListeners, completionRate }
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
    throw new Error(error.message)
  }

  const enrollmentId = created[0].id

  // Generate enrollment links based on target type and content type
  await generateEnrollmentLinks(enrollmentId)

  // Update active count in seats table
  await supabase
    .from('listener_seats')
    .update({ active_count: activeSeatsCount + 1 })
    .eq('user_id', userId)

  // Send Invitation Email if checked
  if (enrollment.emailSchedule?.sendInvite && enrollment.listenerId) {
    console.log('Attempting to send invite email...', { listenerId: enrollment.listenerId, projectId: enrollment.projectId });
    // Fetch details for placeholders
    const [listenerRes, projectRes, generatedLinkRes] = await Promise.all([
      supabase.from('listeners').select('first_name, email').eq('id', enrollment.listenerId).single(),
      supabase.from('projects').select('title').eq('id', enrollment.projectId).single(),
      supabase.from('enrollment_links').select('unique_url').eq('assignment_id', enrollmentId).eq('listener_id', enrollment.listenerId).limit(1).maybeSingle()
    ])
    
    console.log('Query results:', { 
      listener: listenerRes.data, 
      project: projectRes.data, 
      link: generatedLinkRes.data 
    });

    if (listenerRes.data && projectRes.data) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pitch-avatar.com';
      const enrollmentLink = generatedLinkRes.data?.unique_url || `${appUrl}/v/enroll-${enrollmentId.slice(0, 8)}`
      const res = await sendEnrollmentInvitation(
        listenerRes.data.email,
        enrollment.emailSchedule.inviteSubject || 'Welcome to your onboarding training session',
        enrollment.emailSchedule.inviteBody || 'Hello {{listener_first_name}},\\n\\nYour interactive video presentation is ready! Please use the link below to get started.',
        {
          listenerFirstName: listenerRes.data.first_name || '',
          projectTitle: projectRes.data.title || '',
          enrollmentLink: enrollmentLink
        }
      )
      console.log('Resend response:', res);
    } else {
      console.log('Skipping email send because listener or project data is missing.');
    }
  } else {
    console.log('Not sending email. Condition failed:', { sendInvite: enrollment.emailSchedule?.sendInvite, listenerId: enrollment.listenerId });
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
