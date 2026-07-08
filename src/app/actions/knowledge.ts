'use server'

import { supabase } from '@/lib/supabase'
import { KnowledgeItem } from '@/types'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getProjectKnowledge(projectId: string): Promise<KnowledgeItem[]> {
  if (!projectId) return []

  try {
    const { data, error } = await supabase
      .from('knowledge')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Knowledge table might not exist or error fetching:', error)
      return []
    }

    // Map DB fields to KnowledgeItem
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      size: item.size || 'Unknown',
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      status: item.status || 'indexed'
    })) as KnowledgeItem[]
  } catch (err) {
    console.error('Failed to fetch knowledge:', err)
    return []
  }
}

export async function saveKnowledgeItem(
  projectId: string,
  item: { name: string; type: string; size?: string; url?: string; content?: string }
): Promise<KnowledgeItem | null> {
  if (!projectId) return null

  try {
    // Get current user from the anon client session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.warn('saveKnowledgeItem: no authenticated user')
      return null
    }

    // Use service-role client to bypass RLS for the insert
    const serverClient = createServerSupabaseClient()
    const { data, error } = await serverClient
      .from('knowledge')
      .insert({
        project_id: projectId,
        user_id: user.id,
        name: item.name,
        type: item.type,
        size: item.size || null,
        url: item.url || null,
        content: item.content || null,
        status: 'indexed',
      })
      .select()
      .single()

    if (error) {
      console.warn('Failed to save knowledge item:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      size: data.size || 'Unknown',
      date: new Date(data.created_at).toLocaleDateString(),
      status: data.status,
    } as KnowledgeItem
  } catch (err) {
    console.error('saveKnowledgeItem error:', err)
    return null
  }
}

