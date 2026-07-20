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
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Expired'
  targetType: 'anonymous' | 'listener' | 'group'
  contentType: 'project' | 'course'
  presenterIds?: string[]
  startDate: string | null
  emailSchedule: Record<string, any>
  bookCalendarOrStartAvatar: boolean
  createdAt: string
  groupId?: string | null
  courseId?: string | null
  calendarLink?: string
  translateToListenerLanguage?: boolean
  // Reminder fields
  enableReminders?: boolean
  invitationSubject?: string
  reminderSubject?: string
  reminderText?: string
  reminderFrequency?: 'Every day' | 'Every 2 days' | 'Every week' | string
  reminderCount?: '1' | '3' | '5' | 'Unlimited' | string
  stopRemindersOnOpen?: boolean
  // Expiration
  expirationDays?: number
  expiresAt?: string | null
  // UI derived joined fields
  listenerName?: string
  listenerEmail?: string
  projectTitle?: string
  groupName?: string
  link?: string
  progress?: number
  videoRecording?: boolean
  timeSpent?: number
  score?: number
  lastActivityAt?: string | null
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

export const ENROLLMENT_STATUS = ['Pending', 'In Progress', 'Completed', 'Failed', 'Expired'] as const

export const ENROLLMENT_COLUMNS = [
  { id: 'NameRecipient', label: 'NAME / RECIPIENT', required: true },
  { id: 'Type', label: 'TYPE', required: false },
  { id: 'Course', label: 'COURSE', required: false },
  { id: 'People', label: 'PEOPLE', required: false },
  { id: 'Engagement', label: 'ENGAGEMENT', required: false },
  { id: 'Reminders', label: 'REMINDERS', required: false },
] as const
