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

  /**
   * Instantly duplicate a template — auto-names it "[name] (Copy)" or
   * "[name] (Copy 2)" etc. to avoid collisions.
   */
  const duplicateTemplate = useCallback((
    sourceTemplateId: string,
    sourceName: string,
    gradient: string,
    slides: SlideContent[],
    baseName: string
  ): UserTemplate => {
    let name = `${baseName} (Copy)`
    let counter = 2
    setTemplates(prev => {
      const taken = new Set(prev.map(t => t.name))
      while (taken.has(name)) name = `${baseName} (Copy ${counter++})`
      const tpl: UserTemplate = {
        id: `ut_${Date.now()}`,
        name,
        sourceTemplateId,
        sourceName,
        gradient,
        slides,
        savedAt: new Date().toISOString(),
      }
      const updated = [...prev, tpl]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    // return a placeholder — callers only need it for toast messaging
    return {
      id: '',
      name,
      sourceTemplateId,
      sourceName,
      gradient,
      slides,
      savedAt: new Date().toISOString(),
    }
  }, [])

  return { templates, saveTemplate, duplicateTemplate, deleteTemplate, openInEditor }
}

// ── Relative time helper ──────────────────────────────────────────────────────
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
