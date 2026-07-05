'use server'

import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { Project, ProjectType, ProjectStatus } from '@/types'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kapkqziyceefxluxlvqc.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Use the Service Role Key for now if RLS is an issue, but standard supabase client uses Anon Key.
// Assuming the user will create an authenticated session or we bypass RLS for now.

export async function getFolders() {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching folders:', error)
    return []
  }

  return data
}

export async function createFolder(name: string, userId: string = '00000000-0000-0000-0000-000000000000') {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ name, user_id: userId }])
    .select()

  if (error) {
    console.error('Error creating folder:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  return data[0]
}

export async function deleteFolder(id: string) {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting folder:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
}

export async function updateFolder(id: string, name: string) {
  const { data, error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating folder:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  return data[0]
}

export async function getProjects(filter?: { folderId?: string, type?: ProjectType }, limit?: number) {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter?.folderId) {
    query = query.eq('folder_id', filter.folderId)
  }
  if (filter?.type) {
    query = query.eq('type', filter.type)
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  // Map to frontend format
  return data.map((p: any) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    status: p.status,
    folderId: p.folder_id,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    thumbnailUrl: p.thumbnail_url,
    slidesCount: p.slides_count,
    duration: p.duration,
    views: p.views,
    leads: p.leads,
    linksCount: p.links_count,
    assistantStatus: p.assistant_status,
    isCoachMode: !!p.metadata?.coachSettings || p.is_coach_mode === true || (p.title && p.title.includes('COACH'))
  })) as Project[]
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, slides, folders!folder_id(name)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    type: data.type,
    status: data.status,
    folderId: data.folder_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    thumbnailUrl: data.thumbnail_url,
    slidesCount: data.slides_count,
    duration: data.duration,
    views: data.views,
    leads: data.leads,
    linksCount: data.links_count,
    assistantStatus: data.assistant_status,
    slides: data.slides,
    isCoachMode: !!data.metadata?.coachSettings || data.is_coach_mode === true || (data.title && data.title.includes('COACH')),
    metadata: data.metadata
  } as Project & { slides?: any[] }
}

export async function createProject(data: {
  title: string,
  type: ProjectType,
  status: ProjectStatus,
  folderId?: string,
  userId?: string,
  isCoachMode?: boolean,
  traineeRole?: string
}) {
  const userId = data.userId || '00000000-0000-0000-0000-000000000000'
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert([{
      title: data.title,
      type: data.type,
      status: data.status,
      folder_id: data.folderId,
      user_id: userId
    }])
    .select()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath('/presentations')
  revalidatePath('/video')
  revalidatePath('/chat-avatar')
  return project[0]
}

export async function deleteProject(id: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing, cannot bypass RLS.")
  }

  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath('/presentations')
  revalidatePath('/video')
  revalidatePath('/chat-avatar')
}
