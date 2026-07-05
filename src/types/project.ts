import { CoachSettings, BuyerScenario } from './coach'

export type ProjectType = 'chat-avatar' | 'slides' | 'video' | 'from-scratch' | 'assistant' | 'presentation' | 'widget'
export type ProjectStatus = 'draft' | 'processing' | 'ready' | 'published'

/** Free-form JSON stored in the project's `metadata` column */
export interface ProjectMetadata {
  coachSettings?: Partial<CoachSettings> & { traineeRole?: string }
  coachScenarios?: BuyerScenario[]
}

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
  /** Free-form JSON metadata (coach settings, scenarios, etc.) */
  metadata?: ProjectMetadata
}
