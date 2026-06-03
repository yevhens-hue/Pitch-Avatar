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
