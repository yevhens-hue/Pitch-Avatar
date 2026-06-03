export interface Listener {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  company: string | null
  industry: string | null
  position: string | null
  linkedin: string | null
  country: string | null
  department: string | null
  language: string
  documents: string[]
  userId: string
  createdAt: string
  updatedAt: string
  lastActivity?: string // Derived for displaying active session metrics
}

export interface Group {
  id: string
  name: string
  createdAt: string
}

export interface Enrollment {
  id: string
  title: string
  listenerId: string | null // Can be null if Anonymous
  projectId: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
  startDate: string | null
  emailSchedule: Record<string, any>
  createdAt: string
  // UI derived joined fields
  listenerName?: string
  listenerEmail?: string
  projectTitle?: string
  targetType?: string
  contentType?: string
  groupId?: string
  groupName?: string
  link?: string
  progress?: number
  videoRecording?: boolean
}

export interface ResultCatalogItem {
  id: string
  name: string
  dataType: 'string' | 'bool' | 'integer' | 'double'
  parameter?: string
  aggregation: 'Last value' | 'Sum' | 'Max' | 'Use LLM'
  llmPrompt?: string
  createdAt: string
}

export interface ListenerSeat {
  id: string
  userId: string
  maxSeats: number
  activeCount: number
  createdAt: string
  updatedAt: string
}

export interface MailDomain {
  id: string
  domainName: string
  senderEmail: string
  isConfirmed: boolean
  userId: string
  createdAt: string
}

export const ENROLLMENT_STATUS = ['Pending', 'In Progress', 'Completed', 'Failed'] as const

export const ENROLLMENT_COLUMNS = [
  { id: 'Name', label: 'Name', required: true },
  { id: 'ListenerGroup', label: 'Listener / Group', required: false },
  { id: 'ProjectCourse', label: 'Project / Course', required: false },
  { id: 'TargetType', label: 'Target Type', required: false },
  { id: 'ContentType', label: 'Content Type', required: false },
  { id: 'Status', label: 'Status', required: false },
  { id: 'Link', label: 'Link', required: false },
  { id: 'Progress', label: 'Progress', required: false },
  { id: 'VideoRecording', label: 'Video Recording', required: false },
  { id: 'TranscriptionSummary', label: 'Transcription/Summary', required: false },
  { id: 'StartDate', label: 'Start Date', required: false },
  { id: 'TimeSpent', label: 'Time Spent', required: false },
  { id: 'Score', label: 'Score', required: false },
] as const
