'use server'

import { supabase } from '@/lib/supabase'
import { Listener } from '@/types/listeners'
import { revalidatePath } from 'next/cache'

export async function getListeners(search: string = '', page: number = 1, limit: number = 10) {
  let query = supabase
    .from('listeners')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search.trim()) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,position.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching listeners:', error)
    return { data: [], total: 0 }
  }

  return {
    data: data.map((l: any) => ({
      id: l.id,
      email: l.email,
      firstName: l.first_name,
      lastName: l.last_name,
      company: l.company,
      industry: l.industry,
      position: l.position,
      linkedin: l.linkedin,
      country: l.country,
      department: l.department,
      language: l.language,
      documents: l.documents || [],
      userId: l.user_id,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    })) as Listener[],
    total: count || 0,
  }
}

export async function createListener(listener: Omit<Listener, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('listeners')
    .insert([{
      email: listener.email,
      first_name: listener.firstName,
      last_name: listener.lastName,
      company: listener.company,
      industry: listener.industry,
      position: listener.position,
      linkedin: listener.linkedin,
      country: listener.country,
      department: listener.department,
      language: listener.language || 'en',
      documents: listener.documents || [],
      user_id: listener.userId || '00000000-0000-0000-0000-000000000000'
    }])
    .select()

  if (error) {
    console.error('Error creating listener:', error)
    throw new Error(error.message)
  }

  revalidatePath('/listeners')
  return data[0]
}

export async function updateListener(id: string, listener: Partial<Omit<Listener, 'id' | 'createdAt' | 'updatedAt'>>) {
  const { data, error } = await supabase
    .from('listeners')
    .update({
      email: listener.email,
      first_name: listener.firstName,
      last_name: listener.lastName,
      company: listener.company,
      industry: listener.industry,
      position: listener.position,
      linkedin: listener.linkedin,
      country: listener.country,
      department: listener.department,
      language: listener.language,
      documents: listener.documents,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating listener:', error)
    throw new Error(error.message)
  }

  revalidatePath('/listeners')
  return data[0]
}

export async function deleteListener(id: string) {
  const { error } = await supabase
    .from('listeners')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting listener:', error)
    throw new Error(error.message)
  }

  revalidatePath('/listeners')
}
