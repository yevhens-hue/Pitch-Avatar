export type VoiceType = 'Клонированный голос' | 'Библиотека ИИ'

export interface Voice {
  id: number
  name: string
  type: VoiceType
  language: string
  date: string
}
