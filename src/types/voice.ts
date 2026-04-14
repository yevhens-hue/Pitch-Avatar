export type VoiceType = 'Cloned Voice' | 'AI Library'

export interface Voice {
  id: number
  name: string
  type: VoiceType
  language: string
  date: string
}
