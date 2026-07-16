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

  // 1. Update project metadata (for the UI / CoachQASetPanel)
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

  // 2. Sync to buyer_scenarios table (for AI Evaluation & Train Mode UI)
  try {
    // Fetch existing to preserve vector embeddings (custom_actions.embedding)
    const { data: existing } = await supabase
      .from('buyer_scenarios')
      .select('id, custom_actions')
      .eq('project_id', projectId);

    // Delete all current scenarios for this project
    await supabase.from('buyer_scenarios').delete().eq('project_id', projectId);

    // Prepare rows for insertion
    const rowsToInsert = scenarios.map((s, idx) => {
      const exist = existing?.find(e => e.id === s.id);
      
      // Ensure we have a valid UUID for the DB table. 
      // If the UI generated a 'csv-xxx' or 'gen-xxx' id, we generate a fresh UUID.
      const isFakeId = s.id.startsWith('csv-') || s.id.startsWith('gen-') || s.id.length < 32;
      const dbId = exist ? exist.id : (isFakeId ? crypto.randomUUID() : s.id);

      return {
        id: dbId,
        project_id: projectId,
        question_text: s.questionText,
        expected_answer: s.expectedAnswer,
        expected_slide_id: s.expectedSlideId === 'any' || s.expectedSlideId === 'none' ? null : s.expectedSlideId,
        is_generated: s.isGenerated ?? false,
        order_index: s.orderIndex ?? idx,
        custom_actions: { 
          ...(exist?.custom_actions || {}),
          targetType: s.expectedSlideId,
          orderIndex: s.orderIndex ?? idx,
          questionType: s.questionType || 'product',
          roleTemplate: s.roleTemplate || 'buyer'
        }
      };
    });

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('buyer_scenarios').insert(rowsToInsert);
      if (insertError) {
        console.error('Error syncing buyer_scenarios:', insertError);
      }
    }
  } catch (err) {
    console.error('Failed to sync to buyer_scenarios:', err);
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${projectId}`)
}

