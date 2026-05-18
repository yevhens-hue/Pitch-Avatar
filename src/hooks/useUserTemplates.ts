'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SlideContent } from '@/data/template-content'

const STORAGE_KEY = 'pitch-avatar-user-templates'

export interface UserTemplate {
  id: string
  name: string
  sourceTemplateId: string
  sourceName: string
  gradient: string
  slides: SlideContent[]
  savedAt: string // ISO string
}

export function useUserTemplates() {
  const [templates, setTemplates] = useState<UserTemplate[]>([])

  // Load on mount (client only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTemplates(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const persist = (list: UserTemplate[]) => {
    setTemplates(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const saveTemplate = useCallback((
    name: string,
    sourceTemplateId: string,
    sourceName: string,
    gradient: string,
    slides: SlideContent[]
  ): UserTemplate => {
    const tpl: UserTemplate = {
      id: `ut_${Date.now()}`,
      name,
      sourceTemplateId,
      sourceName,
      gradient,
      slides,
      savedAt: new Date().toISOString(),
    }
    setTemplates(prev => {
      const updated = [...prev, tpl]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    return tpl
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  /**
   * Opens a saved user template in the editor:
   * writes slides back to the editor's localStorage key, then navigates.
   */
  const openInEditor = useCallback((tpl: UserTemplate) => {
    localStorage.setItem(
      `pitch-avatar-editor-${tpl.sourceTemplateId}`,
      JSON.stringify(tpl.slides)
    )
    window.location.href = `/presentation-templates/${tpl.sourceTemplateId}`
  }, [])

  return { templates, saveTemplate, deleteTemplate, openInEditor }
}
