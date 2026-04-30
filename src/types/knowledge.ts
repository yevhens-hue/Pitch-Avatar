export interface KnowledgeItem {
  id: number
  name: string
  type: string
  size: string
  date: string
  status: 'indexed' | 'processing' | 'error'
}
