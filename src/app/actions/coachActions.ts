'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CoachSettings, BuyerScenario } from '@/types/coach'
import { revalidatePath } from 'next/cache'

export async function updateCoachSettings(projectId: string, coachSettings: CoachSettings) {
  const supabase = createServerSupabaseClient()
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('metadata')
    .eq('id', projectId)
    .single()

  if (fetchError) {
    console.error('Error fetching project metadata:', fetchError)
    throw new Error(fetchError.message)
  }

  const newMetadata = {
    ...project.metadata,
    coachSettings: {
      ...project.metadata?.coachSettings,
      ...coachSettings
    }
  }

  const { error } = await supabase
    .from('projects')
    .update({ metadata: newMetadata })
    .eq('id', projectId)

  if (error) {
    console.error('Error updating coach settings:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
}

export async function updateCoachScenarios(projectId: string, scenarios: BuyerScenario[]) {
  const supabase = createServerSupabaseClient()
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('metadata')
    .eq('id', projectId)
    .single()

  if (fetchError) {
    console.error('Error fetching project metadata:', fetchError)
    throw new Error(fetchError.message)
  }

  const newMetadata = {
    ...project.metadata,
    coachScenarios: scenarios
  }

  const { error } = await supabase
    .from('projects')
    .update({ metadata: newMetadata })
    .eq('id', projectId)

  if (error) {
    console.error('Error updating coach scenarios:', error)
    throw new Error(error.message)
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
}

