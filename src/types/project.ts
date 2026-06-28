export type ProjectType = 'chat-avatar' | 'slides' | 'video' | 'from-scratch' | 'assistant' | 'presentation' | 'widget'
export type ProjectStatus = 'draft' | 'processing' | 'ready' | 'published'

export interface Project {
  id: string
  title: string
  type: ProjectType
  status: ProjectStatus
  folderId?: string
  userId?: string
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  slidesCount?: number
  slides?: any[]
  duration?: string
  views?: number
  leads?: number
  linksCount?: number
  assistantStatus?: 'active' | 'none' | 'draft'
  /** Chat Avatar configured as widget (no slides panel) */
  isWidget?: boolean
  /** Project is enabled for Coach Training Mode */
  isCoachMode?: boolean
}
