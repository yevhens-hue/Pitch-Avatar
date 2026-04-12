export type ChatAvatarStatus = 'Active' | 'Draft'

export interface ChatAvatar {
  id: number
  name: string
  language: string
  status: ChatAvatarStatus
}
