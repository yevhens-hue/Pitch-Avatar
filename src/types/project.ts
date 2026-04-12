export type ProjectType = 'chat-avatar' | 'slides' | 'video' | 'from-scratch'
export type ProjectStatus = 'draft' | 'processing' | 'ready' | 'published'

export interface Project {
  id: string
  title: string
  type: ProjectType
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
}
