'use server'

import { supabase } from '@/lib/supabase'

export async function updateProjectSlides(projectId: string, slides: any[]) {

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ slides: slides, slides_count: slides.length })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project slides:', error)
      return { success: false, error: error.message }
    }

    return { success: true, project: data }
  } catch (err) {
    console.error('Server error updating project slides:', err)
    return { success: false, error: 'Internal Server Error' }
  }
}
