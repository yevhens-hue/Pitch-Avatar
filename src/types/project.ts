export type ProjectType = 'chat-avatar' | 'slides' | 'video' | 'from-scratch' | 'assistant' | 'presentation'
export type ProjectStatus = 'draft' | 'processing' | 'ready' | 'published'

export interface Project {
  id: string
  title: string
  type: ProjectType
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  slidesCount?: number
  duration?: string
  views?: number
  leads?: number
  linksCount?: number
  assistantStatus?: 'active' | 'none' | 'draft'
}
