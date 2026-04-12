export type PresentationStep = 'upload' | 'processing' | 'editor' | 'goal-selection'

export interface Slide {
  id: string
  index: number
  content: string
  avatarConfig?: AvatarConfig
}

export interface AvatarConfig {
  voiceId?: string
  roleId?: string
  script?: string
}

export interface Presentation {
  id: string
  title: string
  slides: Slide[]
  sourceFile?: {
    name: string
    type: string
    url: string
  }
  importedFrom?: 'canva' | 'google-slides' | 'url'
}
