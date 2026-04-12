export interface Analytics {
  totalViews: number
  leads: number
  avgViewTime: string
}

export interface FaqItem {
  query: string
  answer: string
}

export interface PresentationListItem {
  id: string
  name: string
  updated: string
  slides: number
  views: number
}
