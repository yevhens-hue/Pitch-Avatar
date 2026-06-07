import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function updateProjectSlides(projectId: string, slides: any[]) {
  const supabase = createServerActionClient({ cookies })

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
