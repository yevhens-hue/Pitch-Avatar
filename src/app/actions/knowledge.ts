'use server'

import { supabase } from '@/lib/supabase'
import { KnowledgeItem } from '@/types'

export async function getProjectKnowledge(projectId: string): Promise<KnowledgeItem[]> {
  if (!projectId) return []

  try {
    // Attempt to fetch from a 'knowledge' table if it exists
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
