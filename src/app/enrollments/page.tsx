'use client'

import React, { useState, useEffect, useTransition } from 'react'
import styles from './Enrollments.module.css'
import {
  ClipboardList, Search, Plus, Trash2, Edit3, Calendar,
  ChevronLeft, ChevronRight, Link as LinkIcon, X, Languages,
  Clock, BookOpen, UserCheck, AlertTriangle, QrCode,
  Columns, LayoutGrid, Table2, CheckCircle,
  Settings, Share2, RefreshCw, BarChart2, ClipboardCheck,
  FileText, ChevronDown, Video, Users, Shield, Lock, Info, ExternalLink, HelpCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getEnrollments, createEnrollment, updateEnrollment,
  deleteEnrollment, manualEnterResult, getSeatsQuota,
} from '@/app/actions/enrollments'
import { getListeners } from '@/app/actions/listeners'
import { getProjects } from '@/app/actions/projects'
import { Enrollment, Listener, ListenerSeat } from '@/types/listeners'
import { Project } from '@/types'

// ── Avatar helpers ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  'linear-gradient(135deg,#ec4899 0%,#d946ef 100%)',
  'linear-gradient(135deg,#10b981 0%,#059669 100%)',
  'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
  'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
]
const getAvatarStyle = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return { background: AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] }
}


// ── Table Columns Config ───────────────────────────────────────────────────────
const ENROLLMENT_COLUMNS = [
  { id: 'Name', label: 'Name', required: true },
  { id: 'ListenerGroup', label: 'Listener / Group' },
  { id: 'ProjectCourse', label: 'Project / Course' },
  { id: 'TargetType', label: 'Target Type' },
  { id: 'ContentType', label: 'Content Type' },
  { id: 'Status', label: 'Status' },
  { id: 'Link', label: 'Link' },
  { id: 'Progress', label: 'Progress' },
  { id: 'VideoRecording', label: 'Video Recording' },
  { id: 'TranscriptionSummary', label: 'Transcription/Summary' },
  { id: 'StartDate', label: 'Start Date' },
  { id: 'TimeSpent', label: 'Time Spent' },
  { id: 'Score', label: 'Score' }
]

// ── Kanban columns config ──────────────────────────────────────────────────────
const KANBAN_COLUMNS: { key: Enrollment['status']; label: string; color: string; bg: string }[] = [
  { key: 'Pending',     label: 'Pending',     color: '#64748b', bg: '#f1f5f9' },
  { key: 'In Progress', label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'Completed',   label: 'Completed',   color: '#10b981', bg: '#ecfdf5' },
  { key: 'Failed',      label: 'Failed',       color: '#ef4444', bg: '#fef2f2' },
]

const METRICS_CATALOG = [
  'Visited', 'Time Spent', 'Score', 'Q&A Completed',
  'Employee Hired', 'Deal Closed', 'Feedback Given',
  'Documents Signed', 'Assessment Passed', 'Custom Goal',
]

const emptyFormState = {
  title: '',
  targetType: 'Listener' as 'Anonymous' | 'Listener' | 'Group',
  listenerId: '',
  contentType: 'Project' as 'Project' | 'Course',
  projectId: '',
  status: 'Pending' as Enrollment['status'],
  startDate: '',
  emailSchedule: {
    sendInvite: true,
    sendReminders: true,
    reminderFrequency: 'daily',
    inviteSubject: 'Welcome to your onboarding training session',
    inviteBody: 'Hello {{listener_first_name}},\n\nYour interactive video presentation is ready! Please use the link below to get started.',
    translateToListenerLang: true,
  },
  results: {
    recording: false,
    sendResultsToListener: true,
    sendResultsToPresenter: false,
    generateSummary: false,
    answerLimitedTime: false,
    customMetrics: [] as string[],
  },
}

const MOCK_ENROLLMENTS: any[] = [
  {
    id: 'mock-1',
    title: 'Enrollment',
    listenerId: null,
    projectId: 'mock-p1',
    status: 'Pending',
    startDate: null,
    emailSchedule: { results: { recording: true } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Anti-Bribery & Anit-Corruption Policy Training for A Company',
    listenerName: '—',
    listenerEmail: '—',
    targetType: '—',
    contentType: 'Project',
    link: 'https://app.example.com/',
    progress: 0,
    videoRecording: true,
  },
  {
    id: 'mock-2',
    title: 'Enrollment',
    listenerId: null,
    projectId: 'mock-p2',
    status: 'Pending',
    startDate: null,
    emailSchedule: { results: { recording: true } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Untitled Project',
    listenerName: '—',
    listenerEmail: '—',
    targetType: '—',
    contentType: 'Project',
    link: 'https://app.example.com/',
    progress: 0,
    videoRecording: true,
  },
  {
    id: 'mock-3',
    title: 'Enrollment',
    listenerId: null,
    projectId: 'mock-p3',
    status: 'Pending',
    startDate: null,
    emailSchedule: { results: { recording: true } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Customer Development Template',
    listenerName: '—',
    listenerEmail: '—',
    targetType: '—',
    contentType: 'Project',
    link: 'https://app.example.com/',
    progress: 0,
    videoRecording: true,
  },
  {
    id: 'mock-4',
    title: 'Enrollment',
    listenerId: null,
    projectId: 'mock-p4',
    status: 'Pending',
    startDate: null,
    emailSchedule: { results: { recording: false } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Virtual Recruiter Template',
    listenerName: '—',
    listenerEmail: '—',
    targetType: '—',
    contentType: 'Project',
    link: 'https://app.example.com/',
    progress: 0,
    videoRecording: false,
  },
  {
    id: 'mock-5',
    title: 'Group Onboarding',
    listenerId: 'mock-g1',
    projectId: 'mock-c1',
    status: 'Pending',
    startDate: null,
    emailSchedule: { results: { recording: false } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Sales Onboarding Journey',
    listenerName: 'Sales Onboarding',
    listenerEmail: 'Sales Onboarding Group',
    targetType: 'Group',
    contentType: 'Course',
    link: 'Expand to see',
    progress: 45,
    videoRecording: false,
    groupName: 'Sales Onboarding',
  },
  {
    id: 'mock-6',
    title: '—',
    listenerId: 'mock-l1',
    projectId: 'mock-c2',
    status: 'Pending',
    startDate: null,
    emailSchedule: { results: { recording: false } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Product Demo Presentation',
    listenerName: 'Markus Weber',
    listenerEmail: 'markus.weber@example.com',
    targetType: 'Listener',
    contentType: 'Course',
    link: 'Expand to see',
    progress: 0,
    videoRecording: false,
    groupName: 'Sales Onboarding',
  },
  {
    id: 'mock-7',
    title: '—',
    listenerId: 'mock-l2',
    projectId: 'mock-c3',
    status: 'Failed',
    startDate: null,
    emailSchedule: { results: { recording: false } },
    createdAt: new Date().toISOString(),
    projectTitle: 'Technical Interview Flow',
    listenerName: 'Emily Davis',
    listenerEmail: 'emily.davis@example.com',
    targetType: 'Listener',
    contentType: 'Course',
    link: 'Expand to see',
    progress: 30,
    videoRecording: false,
    groupName: 'Sales Onboarding',
  },
]

export default function EnrollmentsDashboard() {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Data
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [listeners, setListeners] = useState<Listener[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [quota, setQuota] = useState<ListenerSeat | null>(null)

  // View mode: table or kanban
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // State filters
  const [statusFilter, setStatusFilter] = useState<string>('All Status')
  const [groupFilter, setGroupFilter] = useState<string>('All Group')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [showListenersInGroups, setShowListenersInGroups] = useState(false)
  const [showProjectsInCourses, setShowProjectsInCourses] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeGearId, setActiveGearId] = useState<string | null>(null)

  // Columns state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ENROLLMENT_COLUMNS.map(c => c.id)
  )
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)

  const [search, setSearch] = useState('')

  // Drawer state
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'invitations' | 'links' | 'layout' | 'advanced' | 'security' | 'results'>('general')
  const [showMetricDropdown, setShowMetricDropdown] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyFormState)

  // Manual override modal
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [manualId, setManualId] = useState<string | null>(null)
  const [manualStatus, setManualStatus] = useState<'Completed' | 'Failed'>('Completed')
  const [manualDate, setManualDate] = useState('')

  // Quota alert
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  // Upgraded custom visual wizard fields
  const [presenters, setPresenters] = useState<string[]>(['info@roi4cio.com'])
  const [calendarUrl, setCalendarUrl] = useState<string>('https://meetings.hubspot.com/your-handle')
  const [dontSendOpenNotifications, setDontSendOpenNotifications] = useState<boolean>(false)
  const [bookCalendarOrStartAvatar, setBookCalendarOrStartAvatar] = useState<boolean>(false)
  const [invitationText, setInvitationText] = useState<string>('')
  const [sendAnimatedGif, setSendAnimatedGif] = useState<boolean>(false)
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const [enableReminders, setEnableReminders] = useState<boolean>(false)

  // Viewer layout (Slide Player)
  const [showSlideCounter, setShowSlideCounter] = useState<boolean>(true)
  const [showPlayPause, setShowPlayPause] = useState<boolean>(true)
  const [showPrevNext, setShowPrevNext] = useState<boolean>(true)
  const [showProgressBar, setShowProgressBar] = useState<boolean>(true)
  const [showSettingsBtn, setShowSettingsBtn] = useState<boolean>(true)
  const [showFullscreenBtn, setShowFullscreenBtn] = useState<boolean>(true)
  const [showAllSlideControls, setShowAllSlideControls] = useState<boolean>(true)

  // Viewer layout (Avatar & Chat Panel)
  const [showAvatarPanel, setShowAvatarPanel] = useState<boolean>(true)
  const [showAvatarVideoPhoto, setShowAvatarVideoPhoto] = useState<boolean>(true)
  const [showAvatarNameLabel, setShowAvatarNameLabel] = useState<boolean>(true)
  const [showMuteBtn, setShowMuteBtn] = useState<boolean>(true)
  const [showChatMessages, setShowChatMessages] = useState<boolean>(true)
  const [showChatInput, setShowChatInput] = useState<boolean>(true)
  const [showMicrophoneBtn, setShowMicrophoneBtn] = useState<boolean>(true)
  const [showAvatarFrameBorder, setShowAvatarFrameBorder] = useState<boolean>(false)
  const [avatarPosition, setAvatarPosition] = useState<string>('Right')
  const [avatarHeight, setAvatarHeight] = useState<number>(40)
  const [chatHeight, setChatHeight] = useState<number>(60)

  // Viewer layout (Bottom Bar Actions)
  const [showPresenterInfo, setShowPresenterInfo] = useState<boolean>(true)
  const [showCallPresenter, setShowCallPresenter] = useState<boolean>(true)
  const [showScheduleMeeting, setShowScheduleMeeting] = useState<boolean>(true)
  const [showLikeThumbs, setShowLikeThumbs] = useState<boolean>(true)
  const [showCommentFeedback, setShowCommentFeedback] = useState<boolean>(true)
  const [showShareBtn, setShowShareBtn] = useState<boolean>(true)
  const [showSlidesDropdown, setShowSlidesDropdown] = useState<boolean>(true)

  // Advanced settings
  const [showSlideFeed, setShowSlideFeed] = useState<boolean>(false)
  const [allowListenerShareSlides, setAllowListenerShareSlides] = useState<boolean>(true)
  const [enableChatWithListener, setEnableChatWithListener] = useState<boolean>(true)
  const [allowComments, setAllowComments] = useState<boolean>(true)
  const [allowDownloadFile, setAllowDownloadFile] = useState<boolean>(false)
  const [allowCallPresenter, setAllowCallPresenter] = useState<boolean>(true)
  const [callPresenterBtnText, setCallPresenterBtnText] = useState<string>('Call presenter')
  const [allowScheduleMeeting, setAllowScheduleMeeting] = useState<boolean>(true)
  const [scheduleMeetingCalendarUrl, setScheduleMeetingCalendarUrl] = useState<string>('https://meetings.hubspot.com/your-handle')
  const [scheduleMeetingBtnText, setScheduleMeetingBtnText] = useState<string>('Schedule meeting')
  const [enableSubtitles, setEnableSubtitles] = useState<boolean>(false)
  const [voiceRecognition, setVoiceRecognition] = useState<boolean>(true)
  const [sendPdfReportEmail, setSendPdfReportEmail] = useState<boolean>(true)
  const [sendPerformanceReportEmail, setSendPerformanceReportEmail] = useState<boolean>(true)
  const [allowListenersViewViaLink, setAllowListenersViewViaLink] = useState<boolean>(true)
  const [useVoiceMessageAudience, setUseVoiceMessageAudience] = useState<boolean>(false)
  const [allowChangeDetailLevel, setAllowChangeDetailLevel] = useState<boolean>(false)
  const [showDebuggerMode, setShowDebuggerMode] = useState<boolean>(false)
  const [levelOfDetail, setLevelOfDetail] = useState<string>('Full-length presentation')
  const [startFromSlide, setStartFromSlide] = useState<number>(1)
  const [advancedComment, setAdvancedComment] = useState<string>('')

  // Security Verification settings
  const [securityHumanDetection, setSecurityHumanDetection] = useState<boolean>(false)
  const [securityAntiFraud, setSecurityAntiFraud] = useState<boolean>(false)
  const [securityIdentityVerification, setSecurityIdentityVerification] = useState<boolean>(false)
  const [securityAntiImpersonation, setSecurityAntiImpersonation] = useState<boolean>(false)

  // Results settings
  const [resultsRecording, setResultsRecording] = useState<boolean>(false)
  const [resultsSendToListener, setResultsSendToListener] = useState<boolean>(false)
  const [resultsSendToPresenterListener, setResultsSendToPresenterListener] = useState<boolean>(false)
  const [resultsSendToPresenterGroup, setResultsSendToPresenterGroup] = useState<boolean>(false)
  const [resultsGenerateSummary, setResultsGenerateSummary] = useState<boolean>(false)
  const [resultsShowCorrectAnswer, setResultsShowCorrectAnswer] = useState<boolean>(false)
  const [resultsAnswerLimitedTime, setResultsAnswerLimitedTime] = useState<boolean>(false)

  // Custom results dropdown search states
  const [customResultsList, setCustomResultsList] = useState<any[]>([])
  const [customResultsSearch, setCustomResultsSearch] = useState<string>('')
  const [showCustomResultDropdown, setShowCustomResultDropdown] = useState<boolean>(false)


  const loadData = () => {
    startTransition(async () => {
      try {
        const [results, seats, lRes, pRes] = await Promise.all([
          getEnrollments(search),
          getSeatsQuota(),
          getListeners('', 1, 100),
          getProjects(),
        ])
        setEnrollments(results)
        setQuota(seats)
        setListeners(lRes.data)
        setProjects(pRes)
      } catch { showToast('Failed to load data', 'error') }
    })
  }

  useEffect(() => { loadData() }, [search])

  useEffect(() => {
    if (quota && formData.listenerId) {
      const isAlreadyActive = enrollments.some(
        e => e.listenerId === formData.listenerId && (e.status === 'Pending' || e.status === 'In Progress')
      )
      setQuotaExceeded(!isAlreadyActive && quota.activeCount >= quota.maxSeats)
    } else {
      setQuotaExceeded(false)
    }
  }, [formData.listenerId, quota, enrollments])

  // ── Drawer helpers ────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      ...emptyFormState,
      title: `Enrollment-${Date.now().toString().slice(-6)}`,
      projectId: projects[0]?.id || '',
      listenerId: listeners[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
    })
    setQuotaExceeded(false)
    setActiveTab('general')
    setIsOpen(true)

    // Reset visual states
    setPresenters(['info@roi4cio.com'])
    setCalendarUrl('https://meetings.hubspot.com/your-handle')
    setDontSendOpenNotifications(false)
    setBookCalendarOrStartAvatar(false)
    setSendAnimatedGif(false)
    setScheduledDate('')
    setScheduledTime('')
    setEnableReminders(false)

    setSecurityHumanDetection(false)
    setSecurityAntiFraud(false)
    setSecurityIdentityVerification(false)
    setSecurityAntiImpersonation(false)

    setResultsRecording(false)
    setResultsSendToListener(true)
    setResultsSendToPresenterListener(false)
    setResultsSendToPresenterGroup(false)
    setResultsGenerateSummary(false)
    setResultsShowCorrectAnswer(false)
    setResultsAnswerLimitedTime(false)
    setCustomResultsList([])
  }

  const handleOpenEdit = (enrollment: Enrollment) => {
    setEditingId(enrollment.id)
    setFormData({
      title: enrollment.title,
      targetType: enrollment.listenerId ? 'Listener' : 'Anonymous',
      listenerId: enrollment.listenerId || '',
      contentType: 'Project',
      projectId: enrollment.projectId,
      status: enrollment.status,
      startDate: enrollment.startDate ? enrollment.startDate.split('T')[0] : '',
      emailSchedule: {
        sendInvite: enrollment.emailSchedule?.sendInvite ?? true,
        sendReminders: enrollment.emailSchedule?.sendReminders ?? true,
        reminderFrequency: enrollment.emailSchedule?.reminderFrequency ?? 'daily',
        inviteSubject: enrollment.emailSchedule?.inviteSubject ?? emptyFormState.emailSchedule.inviteSubject,
        inviteBody: enrollment.emailSchedule?.inviteBody ?? emptyFormState.emailSchedule.inviteBody,
        translateToListenerLang: enrollment.emailSchedule?.translateToListenerLang ?? true,
      },
      results: {
        recording: enrollment.emailSchedule?.results?.recording ?? false,
        sendResultsToListener: enrollment.emailSchedule?.results?.sendResultsToListener ?? true,
        sendResultsToPresenter: enrollment.emailSchedule?.results?.sendResultsToPresenter ?? false,
        generateSummary: enrollment.emailSchedule?.results?.generateSummary ?? false,
        answerLimitedTime: enrollment.emailSchedule?.results?.answerLimitedTime ?? false,
        customMetrics: enrollment.emailSchedule?.results?.customMetrics ?? [],
      },
    })
    setQuotaExceeded(false)
    setActiveTab('general')
    setIsOpen(true)

    // Populate upgraded visual states
    setPresenters(enrollment.emailSchedule?.presenters ?? ['info@roi4cio.com'])
    setCalendarUrl(enrollment.emailSchedule?.calendarUrl ?? 'https://meetings.hubspot.com/your-handle')
    setDontSendOpenNotifications(enrollment.emailSchedule?.dontSendOpenNotifications ?? false)
    setBookCalendarOrStartAvatar(enrollment.emailSchedule?.bookCalendarOrStartAvatar ?? false)
    setSendAnimatedGif(enrollment.emailSchedule?.sendAnimatedGif ?? false)
    setScheduledDate(enrollment.emailSchedule?.scheduledDate ?? '')
    setScheduledTime(enrollment.emailSchedule?.scheduledTime ?? '')
    setEnableReminders(enrollment.emailSchedule?.sendReminders ?? true)

    // Security Verification settings
    setSecurityHumanDetection(enrollment.emailSchedule?.security?.humanDetection ?? false)
    setSecurityAntiFraud(enrollment.emailSchedule?.security?.antiFraud ?? false)
    setSecurityIdentityVerification(enrollment.emailSchedule?.security?.identityVerification ?? false)
    setSecurityAntiImpersonation(enrollment.emailSchedule?.security?.antiImpersonation ?? false)

    // Results settings
    setResultsRecording(enrollment.emailSchedule?.results?.recording ?? false)
    setResultsSendToListener(enrollment.emailSchedule?.results?.sendResultsToListener ?? true)
    setResultsSendToPresenterListener(enrollment.emailSchedule?.results?.sendResultsToPresenterListener ?? false)
    setResultsSendToPresenterGroup(enrollment.emailSchedule?.results?.sendResultsToPresenterGroup ?? false)
    setResultsGenerateSummary(enrollment.emailSchedule?.results?.generateSummary ?? false)
    setResultsShowCorrectAnswer(enrollment.emailSchedule?.results?.showCorrectAnswer ?? false)
    setResultsAnswerLimitedTime(enrollment.emailSchedule?.results?.answerLimitedTime ?? false)
    setCustomResultsList(enrollment.emailSchedule?.results?.customMetrics ?? [])
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.targetType === 'Listener' && !formData.listenerId) {
      showToast('Please select a Listener', 'error'); return
    }
    if (!formData.projectId) { showToast('Please select a Project', 'error'); return }

    const mergedEmailSchedule = {
      ...formData.emailSchedule,
      sendInvite: formData.emailSchedule.sendInvite,
      sendReminders: enableReminders,
      inviteBody: formData.emailSchedule.inviteBody,
      translateToListenerLang: formData.emailSchedule.translateToListenerLang,
      presenters,
      calendarUrl,
      dontSendOpenNotifications,
      bookCalendarOrStartAvatar,
      sendAnimatedGif,
      scheduledDate,
      scheduledTime,
      security: {
        humanDetection: securityHumanDetection,
        antiFraud: securityAntiFraud,
        identityVerification: securityIdentityVerification,
        antiImpersonation: securityAntiImpersonation,
      },
      results: {
        recording: resultsRecording,
        sendResultsToListener: resultsSendToListener,
        sendResultsToPresenterListener,
        sendResultsToPresenterGroup,
        generateSummary: resultsGenerateSummary,
        showCorrectAnswer: resultsShowCorrectAnswer,
        answerLimitedTime: resultsAnswerLimitedTime,
        customMetrics: customResultsList,
      }
    }

    try {
      if (editingId) {
        await updateEnrollment(editingId, {
          title: formData.title, status: formData.status,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: mergedEmailSchedule,
        })
        showToast('Enrollment updated', 'success')
      } else {
        if (quotaExceeded) { showToast('Seats limit exceeded', 'error'); return }
        await createEnrollment({
          title: formData.title,
          listenerId: formData.targetType === 'Listener' ? formData.listenerId : null,
          projectId: formData.projectId, status: formData.status,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: mergedEmailSchedule,
        })
        showToast('Enrollment enrolled!', 'success')
      }
      setIsOpen(false); loadData()
    } catch (err: any) { showToast(err.message || 'Failed to save', 'error') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enrollment? Link redirects will stop immediately.')) return
    try { await deleteEnrollment(id); showToast('Deleted', 'success'); loadData() }
    catch (err: any) { showToast(err.message || 'Failed to delete', 'error') }
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === enrollments.length ? [] : enrollments.map(e => e.id))

  const handleBulkMarkCompleted = async () => {
    try {
      await Promise.all(selectedIds.map(id => updateEnrollment(id, { status: 'Completed' })))
      showToast(`${selectedIds.length} marked Completed`, 'success')
      setSelectedIds([]); loadData()
    } catch { showToast('Failed to update', 'error') }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} enrollment${selectedIds.length !== 1 ? 's' : ''}?`)) return
    try {
      await Promise.all(selectedIds.map(id => deleteEnrollment(id)))
      showToast(`${selectedIds.length} deleted`, 'success')
      setSelectedIds([]); loadData()
    } catch { showToast('Failed to delete', 'error') }
  }

  // ── Manual override ───────────────────────────────────────────────────────────
  const handleOpenManual = (enrollment: Enrollment) => {
    setManualId(enrollment.id)
    setManualStatus(enrollment.status === 'Failed' ? 'Failed' : 'Completed')
    setManualDate(new Date().toISOString().split('T')[0])
    setIsManualOpen(true)
  }

  const handleSaveManual = async () => {
    if (!manualId) return
    try {
      await manualEnterResult(manualId, manualStatus, new Date(manualDate).toISOString())
      showToast('Results updated manually', 'success')
      setIsManualOpen(false); loadData()
    } catch (err: any) { showToast(err.message || 'Failed', 'error') }
  }

  // ── Link actions ──────────────────────────────────────────────────────────────
  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`https://pitch-avatar.com/v/enroll-${id.slice(0, 8)}`)
    showToast('Link copied!', 'success')
  }
  const handleSendInviteNow = () => showToast('Invitation email sent!', 'success')
  const handleSendReminderNow = () => showToast('Reminder email sent!', 'success')
  const handleUpdateWebLink = () => showToast('Link re-synchronized!', 'success')

  // Global click handler to dismiss dropdowns on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowStatusDropdown(false)
      setShowGroupDropdown(false)
      setShowColumnsDropdown(false)
      setActiveGearId(null)
    }
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  // ── Status badge helper ───────────────────────────────────────────────────────
  const getStatusClass = (status: string) => {
    if (status === 'In Progress') return styles.statusInProgress
    if (status === 'Completed')   return styles.statusCompleted
    if (status === 'Failed')      return styles.statusFailed
    if (status === 'Sent')        return styles.statusSent
    if (status === 'Draft')       return styles.statusDraft
    return styles.statusPending
  }

  // Merge database enrollments and seed mock enrollments
  const allEnrollments = [
    ...MOCK_ENROLLMENTS,
    ...enrollments.filter(e => !MOCK_ENROLLMENTS.some(m => m.id === e.id))
  ]

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filteredEnrollments = allEnrollments.filter(e => {
    // 1. Search filter
    if (search.trim()) {
      const term = search.toLowerCase()
      const matchesSearch =
        e.title.toLowerCase().includes(term) ||
        (e.listenerName || '').toLowerCase().includes(term) ||
        (e.listenerEmail || '').toLowerCase().includes(term) ||
        (e.projectTitle || '').toLowerCase().includes(term) ||
        e.status.toLowerCase().includes(term)
      if (!matchesSearch) return false
    }

    // 2. Status filter
    if (statusFilter !== 'All Status') {
      if (e.status !== statusFilter) return false
    }

    // 3. Group filter
    if (groupFilter !== 'All Group') {
      const grp = e.groupName || (e.listenerId && e.listenerName === groupFilter ? groupFilter : '')
      if (grp !== groupFilter) return false
    }

    // 4. Toggle filters
    // If showListenersInGroups is false, hide mock rows that are group members
    if (!showListenersInGroups && e.targetType === 'Listener' && e.groupName) {
      return false
    }

    // If showProjectsInCourses is false, hide projects in courses (or Course types)
    if (!showProjectsInCourses && e.contentType === 'Course') {
      return false
    }

    return true
  })

  return (
    <div className={isExpanded ? styles.containerExpanded : styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Enrollments</h1>
          <p className={styles.subtitle}>Link presentation projects to listeners, schedule reminders, and track status.</p>
        </div>
        <div className={styles.headerActions}>
          {quota && (
            <div className={styles.quotaProgressCard}>
              <div className={styles.quotaHeader}>
                <span>Seats: {quota.activeCount} / {quota.maxSeats}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${(quota.activeCount / quota.maxSeats) * 100}%`,
                    background: quota.activeCount >= quota.maxSeats ? '#ef4444' : undefined,
                  }}
                />
              </div>
            </div>
          )}
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Create Enrollment">
            <Plus size={16} /> Create Enrollment
          </button>
        </div>
      </div>

      {/* ── Controls bar ── */}
      <div className={styles.controlsBar}>
        <div className={styles.searchAndToggles}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text" className={styles.searchInput}
              placeholder="Search enrollments..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              aria-label="Search enrollments"
            />
          </div>

          {/* Status Dropdown */}
          <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.dropdownBtn} onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowGroupDropdown(false); setShowColumnsDropdown(false); }}>
              <span>{statusFilter}</span>
              <ChevronDown size={14} />
            </button>
            {showStatusDropdown && (
              <div className={styles.dropdownPopover}>
                {['All Status', 'Completed', 'In Progress', 'Pending', 'Sent', 'Failed', 'Draft'].map(st => (
                  <button
                    key={st}
                    className={`${styles.dropdownItem} ${statusFilter === st ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setStatusFilter(st); setShowStatusDropdown(false); }}
                  >
                    <span>{st}</span>
                    {statusFilter === st && <CheckCircle size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Group Dropdown */}
          <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.dropdownBtn} onClick={() => { setShowGroupDropdown(!showGroupDropdown); setShowStatusDropdown(false); setShowColumnsDropdown(false); }}>
              <span>{groupFilter}</span>
              <ChevronDown size={14} />
            </button>
            {showGroupDropdown && (
              <div className={styles.dropdownPopover}>
                {['All Group', 'Engineering Team', 'Sales Onboarding', 'Executive Candidates'].map(gp => (
                  <button
                    key={gp}
                    className={`${styles.dropdownItem} ${groupFilter === gp ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setGroupFilter(gp); setShowGroupDropdown(false); }}
                  >
                    <span>{gp}</span>
                    {groupFilter === gp && <CheckCircle size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Switches toggles */}
          <div className={styles.togglesGroup}>
            <label className={styles.switchWrapper}>
              <input
                type="checkbox"
                className={styles.switchInput}
                checked={showListenersInGroups}
                onChange={(e) => setShowListenersInGroups(e.target.checked)}
              />
              <div className={styles.switchTrack}>
                <div className={styles.switchThumb} />
              </div>
              <span>Show Listeners in Groups</span>
            </label>

            <label className={styles.switchWrapper}>
              <input
                type="checkbox"
                className={styles.switchInput}
                checked={showProjectsInCourses}
                onChange={(e) => setShowProjectsInCourses(e.target.checked)}
              />
              <div className={styles.switchTrack}>
                <div className={styles.switchThumb} />
              </div>
              <span>Show Projects in Courses</span>
            </label>

            {/* Columns Configuration Dropdown */}
            <div className={styles.columnsDropdownContainer} onClick={(e) => e.stopPropagation()}>
              <button className={styles.btnSecondary} onClick={() => { setShowColumnsDropdown(!showColumnsDropdown); setShowStatusDropdown(false); setShowGroupDropdown(false); }}>
                <Columns size={16} /> Columns
              </button>
              {showColumnsDropdown && (
                <div className={styles.columnsDropdown} style={{ right: 0 }}>
                  <div className={styles.columnsDropdownHeader}>Visible columns</div>
                  {ENROLLMENT_COLUMNS.map(col => (
                    <label key={col.id} className={styles.columnOption}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        disabled={col.required}
                        onChange={(e) => {
                          if (e.target.checked) setVisibleColumns([...visibleColumns, col.id])
                          else setVisibleColumns(visibleColumns.filter(id => id !== col.id))
                        }}
                      />
                      {col.label} {col.required && <span className={styles.requiredBadge}>Required</span>}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Expand layout toggler */}
            <button className={styles.expandBtn} onClick={() => setIsExpanded(!isExpanded)}>
              <LayoutGrid size={16} /> {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewToggleBtn} ${viewMode === 'table' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            title="Table view"
          >
            <Table2 size={16} />
          </button>
          <button
            className={`${styles.viewToggleBtn} ${viewMode === 'kanban' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => setViewMode('kanban')}
            aria-label="Kanban view"
            title="Kanban view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkActionBar}>
          <span className={styles.bulkSelected}>
            {selectedIds.length} enrollment{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={styles.bulkBtn} onClick={handleBulkMarkCompleted}>
              <CheckCircle size={14} /> Mark Completed
            </button>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} onClick={handleBulkDelete}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <button className={styles.bulkDismiss} onClick={() => setSelectedIds([])} aria-label="Clear selection">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Table view ── */}
      {viewMode === 'table' && (
        <div className={styles.tableCard}>
          {!filteredEnrollments.length && !isPending ? (
            <div className={styles.emptyState}>
              <ClipboardList size={48} style={{ color: '#cbd5e1' }} />
              <h3 className={styles.emptyStateTitle}>No enrollments found</h3>
              <p className={styles.emptyStateDesc}>Create personalized links for candidates, attach courses, and configure auto-translations.</p>
              <button className={styles.btnPrimary} onClick={handleOpenCreate}>
                <Plus size={16} /> Create First Enrollment
              </button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px', paddingRight: '0.5rem' }}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  {ENROLLMENT_COLUMNS.map(col => 
                    visibleColumns.includes(col.id) && <th key={col.id}>{col.label}</th>
                  )}
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isPending ? (
                  <tr><td colSpan={visibleColumns.length + 2} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</td></tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className={selectedIds.includes(enrollment.id) ? styles.rowSelected : ''}>
                      <td style={{ paddingRight: '0.5rem' }}>
                        <input
                           type="checkbox"
                           className={styles.checkbox}
                           checked={selectedIds.includes(enrollment.id)}
                           onChange={() => toggleSelect(enrollment.id)}
                           aria-label={`Select ${enrollment.title}`}
                        />
                      </td>
                      {visibleColumns.includes('Name') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {enrollment.contentType === 'Course' ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                                <GraduationCap size={16} />
                              </div>
                            ) : enrollment.targetType === 'Group' ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                <Users size={16} />
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                <FileText size={16} />
                              </div>
                            )}
                            <span className={styles.projectTitle}>{enrollment.title}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('ListenerGroup') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {enrollment.targetType === 'Group' ? (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569' }}>
                                  <Users size={14} />
                                </div>
                                <div className={styles.nameCell}>
                                  <span className={styles.listenerName}>{enrollment.listenerName}</span>
                                </div>
                              </>
                            ) : enrollment.listenerId ? (
                              <>
                                <div className={styles.listenerAvatar} style={getAvatarStyle(enrollment.listenerEmail || enrollment.id)}>
                                  {(enrollment.listenerName?.[0] || 'L').toUpperCase()}
                                </div>
                                <div className={styles.nameCell}>
                                  <span className={styles.listenerName}>{enrollment.listenerName}</span>
                                </div>
                              </>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('ProjectCourse') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {enrollment.contentType === 'Course' ? (
                              <GraduationCap size={15} style={{ color: '#8b5cf6' }} />
                            ) : (
                              <FileText size={15} style={{ color: '#64748b' }} />
                            )}
                            <span style={{ fontWeight: 500, color: '#334155' }}>{enrollment.projectTitle || 'Loading…'}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('TargetType') && (
                        <td><span style={{ fontSize: '0.85rem' }}>{enrollment.targetType}</span></td>
                      )}
                      {visibleColumns.includes('ContentType') && (
                        <td><span style={{ fontSize: '0.85rem' }}>{enrollment.contentType || 'Project'}</span></td>
                      )}
                      {visibleColumns.includes('Status') && (
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusClass(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes('Link') && (
                        <td>
                          {enrollment.link === 'Expand to see' ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Expand to see</span>
                          ) : (
                            <button type="button" className={styles.actionBtn} onClick={() => handleCopyLink(enrollment.id)} style={{ padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3b82f6' }}>
                              <LinkIcon size={13} />
                              <span style={{ textDecoration: 'underline', fontSize: '0.82rem' }}>app.example.com/</span>
                            </button>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('Progress') && (
                        <td>
                          {enrollment.progress && enrollment.progress > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className={styles.progressBar} style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div className={styles.progressFill} style={{ width: `${enrollment.progress}%`, height: '100%', backgroundColor: '#3b82f6' }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{enrollment.progress}%</span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('VideoRecording') && (
                        <td>
                          {enrollment.videoRecording ? (
                            <Video size={16} style={{ color: '#3b82f6' }} />
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('TranscriptionSummary') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>—</span></td>
                      )}
                      {visibleColumns.includes('StartDate') && (
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                            <Calendar size={14} style={{ color: '#94a3b8' }} />
                            <span style={{ fontSize: '0.85rem' }}>
                              {enrollment.startDate ? enrollment.startDate.split('T')[0] : 'Immediate'}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('TimeSpent') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>0m 0s</span></td>
                      )}
                      {visibleColumns.includes('Score') && (
                        <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>—</span></td>
                      )}
                      <td>
                        <div className={styles.gearContainer} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className={styles.gearBtn}
                            onClick={() => setActiveGearId(activeGearId === enrollment.id ? null : enrollment.id)}
                            aria-label="Actions"
                          >
                            <Settings size={16} />
                          </button>
                          {activeGearId === enrollment.id && (
                            <div className={styles.gearDropdown}>
                              <button type="button" className={styles.gearItem} onClick={() => { handleOpenManual(enrollment); setActiveGearId(null); }}>
                                <ClipboardCheck size={14} /> Enter Results
                              </button>
                              <button type="button" className={styles.gearItem} onClick={() => { showToast('Analytics loaded!', 'success'); setActiveGearId(null); }}>
                                <BarChart2 size={14} /> Analytics
                              </button>
                              <button type="button" className={styles.gearItem} onClick={() => { handleCopyLink(enrollment.id); setActiveGearId(null); }}>
                                <Share2 size={14} /> Share
                              </button>
                              <button type="button" className={styles.gearItem} onClick={() => { showToast('Training started!', 'success'); setActiveGearId(null); }}>
                                <GraduationCap size={14} /> Train
                              </button>
                              <button type="button" className={styles.gearItem} onClick={() => { handleOpenEdit(enrollment); setActiveGearId(null); }}>
                                <Edit3 size={14} /> Edit
                              </button>
                              <button type="button" className={styles.gearItem} onClick={() => { handleUpdateWebLink(); setActiveGearId(null); }}>
                                <RefreshCw size={14} /> Update Link
                              </button>
                              <button type="button" className={`${styles.gearItem} ${styles.gearItemDelete}`} onClick={() => { handleDelete(enrollment.id); setActiveGearId(null); }}>
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Kanban view ── */}
      {viewMode === 'kanban' && (
        <div className={styles.kanbanBoard}>
          {KANBAN_COLUMNS.map((col) => {
            const colItems = filteredEnrollments.filter(e => e.status === col.key)
            return (
              <div key={col.key} className={styles.kanbanColumn}>
                <div className={styles.kanbanColumnHeader} style={{ borderTop: `3px solid ${col.color}` }}>
                  <span className={styles.kanbanColumnTitle}>{col.label}</span>
                  <span className={styles.kanbanColumnCount} style={{ background: col.bg, color: col.color }}>
                    {colItems.length}
                  </span>
                </div>
                <div className={styles.kanbanColumnBody}>
                  {colItems.length === 0 ? (
                    <div className={styles.kanbanEmpty}>No enrollments</div>
                  ) : (
                    colItems.map((enrollment) => (
                      <div key={enrollment.id} className={styles.kanbanCard}>
                        <div className={styles.kanbanCardProject}>{enrollment.projectTitle || 'Project'}</div>
                        {enrollment.listenerId && (
                          <div className={styles.kanbanCardListener}>
                            <div className={styles.kanbanCardAvatar} style={getAvatarStyle(enrollment.listenerEmail || enrollment.id)}>
                              {(enrollment.listenerName?.[0] || 'L').toUpperCase()}
                            </div>
                            <div>
                              <div className={styles.kanbanCardName}>{enrollment.listenerName || 'Listener'}</div>
                              <div className={styles.kanbanCardEmail}>{enrollment.listenerEmail}</div>
                            </div>
                          </div>
                        )}
                        {!enrollment.listenerId && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.5rem' }}>Anonymous Access</div>
                        )}
                        <div className={styles.kanbanCardMeta}>
                          <Calendar size={11} />
                          {enrollment.startDate ? enrollment.startDate.split('T')[0] : 'No date'}
                        </div>
                        <div className={styles.kanbanCardActions}>
                          <button onClick={() => handleCopyLink(enrollment.id)} title="Copy link" aria-label="Copy link"><LinkIcon size={13} /></button>
                          <button onClick={() => handleOpenEdit(enrollment)} title="Edit" aria-label="Edit"><Edit3 size={13} /></button>
                          <button className={styles.kanbanCardBtnDanger} onClick={() => handleDelete(enrollment.id)} title="Delete" aria-label="Delete"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add card shortcut */}
                  <button className={styles.kanbanAddBtn} onClick={handleOpenCreate} aria-label={`Add to ${col.label}`}>
                    <Plus size={14} /> Add enrollment
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Upgraded Create / Edit Enrollment Wizard Modal ── */}
      {isOpen && (
        <div className={styles.wideModalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle} style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Share & Enroll</h2>
                <h2 className={styles.modalTitle}>{editingId ? 'Edit Enrollment' : 'Add Enrollment'}</h2>
                {formData.title && <p className={styles.modalSub}>{formData.title}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" form="enrollment-form" className={styles.btnPrimary} disabled={quotaExceeded && !editingId}>
                  {editingId ? 'Save Changes' : 'Create Enrollment'}
                </button>
              </div>
            </div>

            {/* Tab Headers */}
            <div className={styles.tabsHeader}>
              <button type="button" className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`} onClick={() => setActiveTab('general')}>General</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`} onClick={() => setActiveTab('invitations')}>Invitation and Reminders</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'links' ? styles.tabActive : ''}`} onClick={() => setActiveTab('links')}>Links</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'layout' ? styles.tabActive : ''}`} onClick={() => setActiveTab('layout')}>Viewer Layout</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'advanced' ? styles.tabActive : ''}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'security' ? styles.tabActive : ''}`} onClick={() => setActiveTab('security')}>Security & Verification</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'results' ? styles.tabActive : ''}`} onClick={() => setActiveTab('results')}>Results</button>
            </div>

            {/* Form & Modal Body */}
            <form id="enrollment-form" onSubmit={handleSave} className={styles.wideModalBody}>
              {/* Tab 1: General */}
              {activeTab === 'general' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Enrollment Details</div>
                  
                  {quotaExceeded && (
                    <div className={styles.alertBox}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertTriangle size={18} />
                        <span className={styles.alertTitle}>Active Seats Limit Reached</span>
                      </div>
                      <p className={styles.alertDesc}>
                        You have used <strong>{quota?.maxSeats} of {quota?.maxSeats} seats</strong>. New active enrollments are blocked.
                      </p>
                      <a href="/profile#billing-seats" className={styles.alertLink}>Upgrade Listener Seats →</a>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="title">Enrollment Title *</label>
                    <input type="text" id="title" className={styles.input} required
                      value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="targetType">Target Recipient</label>
                      <select id="targetType" className={styles.input} value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value as typeof formData.targetType })}>
                        <option value="Listener">Individual Listener (Personalized Link)</option>
                        <option value="Anonymous">Anonymous Access (Shared Link)</option>
                        <option value="Group">Cohort Group</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="contentType">Content Type</label>
                      <select id="contentType" className={styles.input} value={formData.contentType}
                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value as typeof formData.contentType })}>
                        <option value="Project">Project Presentation</option>
                        <option value="Course">Full Course Route</option>
                      </select>
                    </div>
                  </div>

                  {formData.targetType === 'Listener' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="listenerSelect">Select Listener *</label>
                      <select id="listenerSelect" className={styles.input} required
                        value={formData.listenerId} onChange={(e) => setFormData({ ...formData, listenerId: e.target.value })}>
                        <option value="" disabled>Select listener…</option>
                        {listeners.map(l => (
                          <option key={l.id} value={l.id}>{l.firstName || ''} {l.lastName || ''} ({l.email})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="projectSelect">Select Presentation *</label>
                    <select id="projectSelect" className={styles.input} required
                      value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                      <option value="" disabled>Select project…</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.type})</option>)}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Presenters</label>
                    <div className={styles.tagList}>
                      {presenters.map((p, i) => (
                        <span key={i} className={styles.removableTag}>
                          {p}
                          <button type="button" className={styles.tagCloseBtn} onClick={() => setPresenters(prev => prev.filter((_, idx) => idx !== i))}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Type presenter email and press Enter..."
                        className={styles.input}
                        style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '180px', padding: '0.1rem 0' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = e.currentTarget.value.trim()
                            if (val && !presenters.includes(val)) {
                              setPresenters([...presenters, val])
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="hubspotCalendar">HubSpot Calendar booking URL</label>
                    <input type="text" id="hubspotCalendar" className={styles.input} placeholder="https://meetings.hubspot.com/your-handle"
                      value={calendarUrl} onChange={(e) => setCalendarUrl(e.target.value)} />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="startDate">Start Date</label>
                      <input type="date" id="startDate" className={styles.input}
                        value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="status">Status</label>
                      <select id="status" className={styles.input} value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={dontSendOpenNotifications} onChange={(e) => setDontSendOpenNotifications(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Don't send notification when listener opens enrollment</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={bookCalendarOrStartAvatar} onChange={(e) => setBookCalendarOrStartAvatar(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Book calendar and then start avatar presentation</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Invitation and Reminders */}
              {activeTab === 'invitations' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Email Invitation Template</div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="inviteSubject">Email Subject</label>
                    <input type="text" id="inviteSubject" className={styles.input}
                      value={formData.emailSchedule.inviteSubject}
                      onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, inviteSubject: e.target.value } })} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="inviteBody">Email Body</label>
                    <textarea id="inviteBody" className={styles.textarea} style={{ minHeight: '140px' }}
                      value={formData.emailSchedule.inviteBody}
                      onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, inviteBody: e.target.value } })} />
                    
                    <div className={styles.placeholderList}>
                      {([
                        { tag: '{{listener_first_name}}', label: '#Listener First Name#' },
                        { tag: '{{listener_last_name}}', label: '#Listener Last Name#' },
                        { tag: '{{listener_company}}', label: '#Listener Company#' },
                        { tag: '{{presenter_first_name}}', label: '#Presenter First Name#' },
                        { tag: '{{presenter_last_name}}', label: '#Presenter Last Name#' },
                        { tag: '{{presentation_title}}', label: '#Presentation Title#' },
                        { tag: '{{presentation_link}}', label: '#Presentation Link#' },
                        { tag: '{{avatar_name}}', label: '#Avatar Name#' }
                      ]).map(p => (
                        <button
                          key={p.tag}
                          type="button"
                          className={styles.placeholderPill}
                          onClick={() => {
                            const textarea = document.getElementById('inviteBody') as HTMLTextAreaElement
                            if (textarea) {
                              const start = textarea.selectionStart
                              const end = textarea.selectionEnd
                              const text = formData.emailSchedule.inviteBody
                              const before = text.substring(0, start)
                              const after = text.substring(end, text.length)
                              const newText = before + p.tag + after
                              setFormData({
                                ...formData,
                                emailSchedule: { ...formData.emailSchedule, inviteBody: newText }
                              })
                              setTimeout(() => {
                                textarea.focus()
                                textarea.setSelectionRange(start + p.tag.length, start + p.tag.length)
                              }, 0)
                            }
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput}
                        checked={formData.emailSchedule.translateToListenerLang}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, translateToListenerLang: e.target.checked } })} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Languages size={15} /> Auto-translate to Listener's language
                      </span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={sendAnimatedGif} onChange={(e) => setSendAnimatedGif(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send animated GIF in email</span>
                    </label>
                  </div>

                  <div className={styles.formCardTitle} style={{ marginTop: '0.5rem' }}>Delivery Scheduling</div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="scheduleDate">Scheduled Date</label>
                      <input type="date" id="scheduleDate" className={styles.input}
                        value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="scheduleTime">Scheduled Time</label>
                      <input type="time" id="scheduleTime" className={styles.input}
                        value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={enableReminders} onChange={(e) => setEnableReminders(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send reminders if not opened</span>
                    </label>
                  </div>

                  {enableReminders && (
                    <div className={styles.formGroup} style={{ marginTop: '0.5rem', paddingLeft: '2.5rem' }}>
                      <label className={styles.formLabel} htmlFor="reminderFrequency">Reminder Frequency</label>
                      <select id="reminderFrequency" className={styles.input} style={{ maxWidth: '300px' }}
                        value={formData.emailSchedule.reminderFrequency}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderFrequency: e.target.value } })}>
                        <option value="daily">Daily (max 3 times)</option>
                        <option value="weekly">Weekly (max 3 times)</option>
                        <option value="custom">Every 3 days (max 3 times)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Links */}
              {activeTab === 'links' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Enrollment Presentation Access</div>

                  {!editingId ? (
                    <div className={styles.emptyState} style={{ padding: '3rem 1rem' }}>
                      <LinkIcon size={40} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                      <div className={styles.emptyStateTitle}>Access Links Not Generated Yet</div>
                      <p className={styles.emptyStateDesc} style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Create or save the enrollment details first. Custom secure redirect URLs, QR access codes, and HTML embedding frames will be generated automatically.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className={styles.linkBox}>
                        <div className={styles.linkHeader}>
                          <span className={styles.linkTitle}>Personalized Web Link</span>
                          <div className={styles.linkActions}>
                            <button type="button" className={styles.btnSecondary} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleCopyLink(editingId)}>Copy</button>
                            <button type="button" className={styles.btnSecondary} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={handleUpdateWebLink}>Update</button>
                          </div>
                        </div>
                        <input type="text" className={styles.urlInput} readOnly
                          value={`https://pitch-avatar.com/v/enroll-${editingId.slice(0, 8)}`} />
                      </div>

                      <div className={styles.qrContainer}>
                        <div className={styles.qrPlaceholder}><QrCode size={36} style={{ color: '#cbd5e1' }} /></div>
                        <div className={styles.qrInfo}>
                          <span className={styles.qrTitle}>QR Access Code</span>
                          <span className={styles.qrDesc}>Download for print materials or offline scanning.</span>
                          <button type="button" className={styles.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                            📥 Download QR
                          </button>
                        </div>
                      </div>

                      <div className={styles.linkBox}>
                        <span className={styles.linkTitle} style={{ marginBottom: '0.25rem' }}>HTML Iframe Embed</span>
                        <textarea className={styles.textarea} style={{ fontSize: '0.72rem', fontFamily: 'monospace', minHeight: '55px' }} readOnly
                          value={`<iframe src="https://pitch-avatar.com/v/enroll-${editingId.slice(0, 8)}" width="100%" height="520" frameborder="0" allow="autoplay; fullscreen"></iframe>`} />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendInviteNow}>
                          📧 Send Invite Now
                        </button>
                        <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendReminderNow}>
                          ⏰ Send Reminder Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Viewer Layout splitLayout */}
              {activeTab === 'layout' && (
                <div className={styles.splitLayout}>
                  {/* Left Column Settings */}
                  <div className={styles.settingsPanel}>
                    {/* Card 1 */}
                    <div className={styles.formCard}>
                      <div className={styles.formCardTitle}>Slide Player Controls</div>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showAllSlideControls} onChange={(e) => {
                          setShowAllSlideControls(e.target.checked)
                          setShowSlideCounter(e.target.checked)
                          setShowPlayPause(e.target.checked)
                          setShowPrevNext(e.target.checked)
                          setShowProgressBar(e.target.checked)
                          setShowSettingsBtn(e.target.checked)
                          setShowFullscreenBtn(e.target.checked)
                        }} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span className={styles.formLabel}>Show all slide player controls</span>
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', opacity: showAllSlideControls ? 1 : 0.6 }}>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showSlideCounter} onChange={(e) => setShowSlideCounter(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Slide counter index indicator</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showPlayPause} onChange={(e) => setShowPlayPause(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Play / Pause button</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showPrevNext} onChange={(e) => setShowPrevNext(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Next and Previous slide arrows</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showProgressBar} onChange={(e) => setShowProgressBar(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Progress bar track</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showSettingsBtn} onChange={(e) => setShowSettingsBtn(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Quality & Speeds Settings cog</span>
                        </label>

                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} disabled={!showAllSlideControls} checked={showFullscreenBtn} onChange={(e) => setShowFullscreenBtn(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Fullscreen viewport toggle</span>
                        </label>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className={styles.formCard}>
                      <div className={styles.formCardTitle}>Avatar & Chat Panel</div>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showAvatarPanel} onChange={(e) => setShowAvatarPanel(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span className={styles.formLabel}>Show side Speaker Avatar & Chat panel</span>
                      </label>

                      {showAvatarPanel && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingLeft: '1.5rem' }}>
                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showAvatarVideoPhoto} onChange={(e) => setShowAvatarVideoPhoto(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Display Avatar photo / speaking video feed</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showAvatarNameLabel} onChange={(e) => setShowAvatarNameLabel(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Show presenter / avatar name label</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showMuteBtn} onChange={(e) => setShowMuteBtn(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Audio mute / volume control key</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showChatMessages} onChange={(e) => setShowChatMessages(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Show interactive chat log window</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showChatInput} onChange={(e) => setShowChatInput(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Allow user text questions input field</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showMicrophoneBtn} onChange={(e) => setShowMicrophoneBtn(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Enable microphone voice commands key</span>
                          </label>

                          <label className={styles.switchWrapper}>
                            <input type="checkbox" className={styles.switchInput} checked={showAvatarFrameBorder} onChange={(e) => setShowAvatarFrameBorder(e.target.checked)} />
                            <div className={styles.switchTrack}>
                              <div className={styles.switchThumb} />
                            </div>
                            <span>Highlight avatar face border frame</span>
                          </label>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Avatar Display Position</label>
                            <select className={styles.input} value={avatarPosition} onChange={(e) => setAvatarPosition(e.target.value)}>
                              <option value="Right">Split column right-side</option>
                              <option value="Left">Split column left-side</option>
                            </select>
                          </div>

                          <div className={styles.sliderWrapper}>
                            <div className={styles.sliderLabelRow}>
                              <span>Avatar Vertical Scale Ratio</span>
                              <span>{avatarHeight}%</span>
                            </div>
                            <input type="range" className={styles.sliderTrack} min="20" max="80"
                              value={avatarHeight} onChange={(e) => setAvatarHeight(Number(e.target.value))} />
                          </div>

                          <div className={styles.sliderWrapper}>
                            <div className={styles.sliderLabelRow}>
                              <span>Interactive Chat Box Ratio</span>
                              <span>{chatHeight}%</span>
                            </div>
                            <input type="range" className={styles.sliderTrack} min="20" max="80"
                              value={chatHeight} onChange={(e) => setChatHeight(Number(e.target.value))} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 3 */}
                    <div className={styles.formCard}>
                      <div className={styles.formCardTitle}>Bottom Bar Action Keys</div>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showPresenterInfo} onChange={(e) => setShowPresenterInfo(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Display Presenter identity card badge</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showCallPresenter} onChange={(e) => setShowCallPresenter(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Show 'Call Presenter' dynamic key</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showScheduleMeeting} onChange={(e) => setShowScheduleMeeting(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Show 'Schedule Meeting' Hubspot link</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showLikeThumbs} onChange={(e) => setShowLikeThumbs(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Show slide feedback thumbs keys</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showCommentFeedback} onChange={(e) => setShowCommentFeedback(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Allow leave slide commentaries input</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showShareBtn} onChange={(e) => setShowShareBtn(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Display Quick Socials Share options</span>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={showSlidesDropdown} onChange={(e) => setShowSlidesDropdown(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span>Display Slide selector dropdown grid</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column Preview */}
                  <div className={styles.previewBox}>
                    <div className={styles.formCardTitle} style={{ borderBottom: 'none', padding: 0 }}>Interactive Live Preview</div>
                    <div style={{ height: '0.25rem' }} />
                    
                    <div className={styles.playerMock}>
                      {/* Split Position Layout rendering */}
                      {avatarPosition === 'Left' && showAvatarPanel && (
                        <div className={styles.mockAvatarArea} style={{ borderRight: '1px solid #1e293b' }}>
                          {showAvatarVideoPhoto && (
                            <div className={styles.mockAvatarVideo} style={{ height: `${avatarHeight}%`, borderBottom: '1px solid #1e293b', border: showAvatarFrameBorder ? '2px solid #3b82f6' : 'none' }}>
                              {showAvatarNameLabel && <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '0.55rem', background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: '2px', color: 'white' }}>Avatar Feed</span>}
                            </div>
                          )}
                          {(showChatMessages || showChatInput) && (
                            <div className={styles.mockChatArea} style={{ height: `${100 - avatarHeight}%` }}>
                              {showChatMessages && (
                                <div className={styles.mockChatMessage}>Mock active chat logs...</div>
                              )}
                              {showChatInput && (
                                <div className={styles.mockChatInput} style={{ display: 'flex', alignItems: 'center', padding: '0 4px', fontSize: '0.55rem', color: '#64748b' }}>
                                  Type question... {showMicrophoneBtn && <span style={{ marginLeft: 'auto' }}>🎙️</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className={styles.mockSlideArea}>
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Course Project Slide Content</div>
                          <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.2rem' }}>Interactive presentation live view</div>
                        </div>

                        {showAllSlideControls && (
                          <div className={styles.mockPlayerControls}>
                            {showPlayPause && <div className={styles.mockPlayBtn} />}
                            {showSlideCounter && <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>1 / 12</span>}
                            {showProgressBar && (
                              <div className={styles.mockProgressTrack}>
                                <div className={styles.mockProgressFill} />
                                <div className={styles.mockProgressThumb} />
                              </div>
                            )}
                            <div className={styles.mockControlIcons}>
                              {showPrevNext && (
                                <>
                                  <div className={styles.mockControlDot} />
                                  <div className={styles.mockControlDot} />
                                </>
                              )}
                              {showSettingsBtn && <div className={styles.mockControlDot} style={{ backgroundColor: '#3b82f6' }} />}
                              {showFullscreenBtn && <div className={styles.mockControlDot} style={{ borderRadius: 0 }} />}
                            </div>
                          </div>
                        )}
                      </div>

                      {avatarPosition === 'Right' && showAvatarPanel && (
                        <div className={styles.mockAvatarArea} style={{ borderLeft: '1px solid #1e293b' }}>
                          {showAvatarVideoPhoto && (
                            <div className={styles.mockAvatarVideo} style={{ height: `${avatarHeight}%`, borderBottom: '1px solid #1e293b', border: showAvatarFrameBorder ? '2px solid #3b82f6' : 'none' }}>
                              {showAvatarNameLabel && <span style={{ position: 'absolute', bottom: '2px', left: '4px', fontSize: '0.55rem', background: 'rgba(0,0,0,0.6)', padding: '1px 3px', borderRadius: '2px', color: 'white' }}>Avatar Feed</span>}
                            </div>
                          )}
                          {(showChatMessages || showChatInput) && (
                            <div className={styles.mockChatArea} style={{ height: `${100 - avatarHeight}%` }}>
                              {showChatMessages && (
                                <div className={styles.mockChatMessage}>Mock active chat logs...</div>
                              )}
                              {showChatInput && (
                                <div className={styles.mockChatInput} style={{ display: 'flex', alignItems: 'center', padding: '0 4px', fontSize: '0.55rem', color: '#64748b' }}>
                                  Type question... {showMicrophoneBtn && <span style={{ marginLeft: 'auto' }}>🎙️</span>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.previewText}>
                      Real-time interactive client side player render. All configuration options adjust structural elements live.
                    </div>

                    {/* Bottom bar preview simulation */}
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.8rem', justifyContent: 'center', width: '100%', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {showPresenterInfo && <span style={{ fontSize: '0.55rem', background: '#e2e8f0', padding: '2px 4px', borderRadius: '3px', fontWeight: 600 }}>👤 ROI4CIO</span>}
                      {showCallPresenter && <span style={{ fontSize: '0.55rem', background: '#eff6ff', color: '#3b82f6', padding: '2px 4px', borderRadius: '3px', border: '1px solid #bfdbfe' }}>📞 Call</span>}
                      {showScheduleMeeting && <span style={{ fontSize: '0.55rem', background: '#f0fdf4', color: '#16a34a', padding: '2px 4px', borderRadius: '3px', border: '1px solid #bbf7d0' }}>📅 Calendar</span>}
                      {showLikeThumbs && <span style={{ fontSize: '0.55rem' }}>👍 👎</span>}
                      {showCommentFeedback && <span style={{ fontSize: '0.55rem', background: 'white', border: '1px solid #cbd5e1', padding: '1px 3px' }}>💬 comment...</span>}
                      {showShareBtn && <span style={{ fontSize: '0.55rem' }}>🔗 social</span>}
                      {showSlidesDropdown && <span style={{ fontSize: '0.55rem', background: '#f1f5f9', padding: '2px 4px' }}>☰ Slide list</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Advanced Options */}
              {activeTab === 'advanced' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Advanced Presentation Capabilities</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={showSlideFeed} onChange={(e) => setShowSlideFeed(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Show slide feed navigation in sidebar drawer</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowListenerShareSlides} onChange={(e) => setAllowListenerShareSlides(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow listener to share slides directly to socials</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={enableChatWithListener} onChange={(e) => setEnableChatWithListener(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Enable live chat conversation and help desk</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow comments on individual slides</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowDownloadFile} onChange={(e) => setAllowDownloadFile(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow PDF document download of presentation</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowCallPresenter} onChange={(e) => setAllowCallPresenter(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow call presenter (realtime voice/video handoff)</span>
                    </label>

                    {allowCallPresenter && (
                      <div className={styles.formGroup} style={{ paddingLeft: '2.5rem' }}>
                        <label className={styles.formLabel} htmlFor="callPresenterBtn">Call Presenter Button Label Text</label>
                        <input type="text" id="callPresenterBtn" className={styles.input} style={{ maxWidth: '300px' }}
                          value={callPresenterBtnText} onChange={(e) => setCallPresenterBtnText(e.target.value)} />
                      </div>
                    )}

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowScheduleMeeting} onChange={(e) => setAllowScheduleMeeting(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow schedule meeting integrations</span>
                    </label>

                    {allowScheduleMeeting && (
                      <div style={{ display: 'flex', gap: '1rem', paddingLeft: '2.5rem' }}>
                        <div className={styles.formGroup} style={{ flex: 1 }}>
                          <label className={styles.formLabel} htmlFor="schedMeetingBtn">Button Label Text</label>
                          <input type="text" id="schedMeetingBtn" className={styles.input}
                            value={scheduleMeetingBtnText} onChange={(e) => setScheduleMeetingBtnText(e.target.value)} />
                        </div>
                        <div className={styles.formGroup} style={{ flex: 2 }}>
                          <label className={styles.formLabel} htmlFor="schedMeetingUrl">Custom Hubspot Calendar URL</label>
                          <input type="text" id="schedMeetingUrl" className={styles.input}
                            value={scheduleMeetingCalendarUrl} onChange={(e) => setScheduleMeetingCalendarUrl(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={enableSubtitles} onChange={(e) => setEnableSubtitles(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Enable speech-to-text live translation subtitles</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={voiceRecognition} onChange={(e) => setVoiceRecognition(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Use local browser voice recognition engine</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={sendPdfReportEmail} onChange={(e) => setSendPdfReportEmail(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send PDF presentation report via email to presenter</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={sendPerformanceReportEmail} onChange={(e) => setSendPerformanceReportEmail(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Send performance analysis report to CRM email</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowListenersViewViaLink} onChange={(e) => setAllowListenersViewViaLink(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow anonymous listeners view presentation via link</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={useVoiceMessageAudience} onChange={(e) => setUseVoiceMessageAudience(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Use voice messaging for audience response channel</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={allowChangeDetailLevel} onChange={(e) => setAllowChangeDetailLevel(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Allow listeners to change avatar detail level</span>
                    </label>

                    {allowChangeDetailLevel && (
                      <div className={styles.formGroup} style={{ paddingLeft: '2.5rem', maxWidth: '300px' }}>
                        <label className={styles.formLabel} htmlFor="levelOfDetail">Default Level of Detail</label>
                        <select id="levelOfDetail" className={styles.input} value={levelOfDetail} onChange={(e) => setLevelOfDetail(e.target.value)}>
                          <option value="Full-length presentation">Full-length presentation</option>
                          <option value="Highlight slides only">Highlight slides only</option>
                          <option value="Summary points">Summary points</option>
                        </select>
                      </div>
                    )}

                    <div className={styles.row} style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="startSlideNum">Start Presentation from Slide #</label>
                        <input type="number" id="startSlideNum" className={styles.input} min="1" max="99" style={{ maxWidth: '120px' }}
                          value={startFromSlide} onChange={(e) => setStartFromSlide(Number(e.target.value))} />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="devModeToggle" style={{ visibility: 'hidden' }}>Dummy</label>
                        <label className={styles.switchWrapper} style={{ marginTop: '0.4rem' }}>
                          <input type="checkbox" className={styles.switchInput} checked={showDebuggerMode} onChange={(e) => setShowDebuggerMode(e.target.checked)} />
                          <div className={styles.switchTrack}>
                            <div className={styles.switchThumb} />
                          </div>
                          <span>Show developer debugger overlay</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Security & Verification */}
              {activeTab === 'security' && (
                <div className={styles.formCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                    <Shield size={20} style={{ color: '#2563eb' }} />
                    <span className={styles.formCardTitle} style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Security & Verification</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Enable safeguards to verify the listener's identity and protect against fraud during the session.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityHumanDetection} onChange={(e) => setSecurityHumanDetection(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Human Detection</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Inject quick Captcha checks to ensure a real listener is present.</div>
                      </div>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityAntiFraud} onChange={(e) => setSecurityAntiFraud(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Anti-Fraud</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Flag navigation events and tab switching outside of active presentation viewport.</div>
                      </div>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityIdentityVerification} onChange={(e) => setSecurityIdentityVerification(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Identity Verification</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Request selfie uploads or official IDs before granting credentials.</div>
                      </div>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={securityAntiImpersonation} onChange={(e) => setSecurityAntiImpersonation(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Anti-Impersonation</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Activate camera face recognition at random intervals to verify watcher matches listener profile.</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 7: Results */}
              {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className={styles.formCard}>
                    <div className={styles.formCardTitle}>Results Settings</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsRecording} onChange={(e) => setResultsRecording(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Recording (enable video recording + request consent)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Save screen or selfie video recording of the entire session.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsSendToListener} onChange={(e) => setResultsSendToListener(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Send Results to Listener by email after All Projects passed by Listener</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Automatically trigger final completion scores and summaries directly to target watcher.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsSendToPresenterListener} onChange={(e) => setResultsSendToPresenterListener(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Send Results to Presenter by email after All Projects passed by Listener</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Send personal session transcript and score logs to all presenters listed.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsSendToPresenterGroup} onChange={(e) => setResultsSendToPresenterGroup(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Send Results to Presenter by email after All Projects passed by Group</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Deliver aggregated progress reports to instructors once cohort finishes.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsGenerateSummary} onChange={(e) => setResultsGenerateSummary(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Generate Summary</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Leverage generative AI to summarize main questions and key takeaways.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsShowCorrectAnswer} onChange={(e) => setResultsShowCorrectAnswer(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Show correct answer after submission</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Let the listener see detailed feedback immediately upon completing questions.</div>
                        </div>
                      </label>

                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={resultsAnswerLimitedTime} onChange={(e) => setResultsAnswerLimitedTime(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Answer Limited Time</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Limit the timeframe allowed to solve or reply to interactive slides questions.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Custom Results Metrics Section */}
                  <div className={styles.formCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Custom Results</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>Pick the Results to track and override for this enrollment.</div>
                      </div>
                      
                      <div className={styles.dropdownContainer}>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => setShowCustomResultDropdown(v => !v)}
                        >
                          + Add result <ChevronDown size={14} />
                        </button>
                        
                        {showCustomResultDropdown && (
                          <div className={styles.dropdownPopover} style={{ right: 0, left: 'auto', width: '280px', padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.35rem', marginBottom: '0.35rem' }}>
                              <Search size={12} style={{ color: '#94a3b8', marginRight: '0.3rem' }} />
                              <input
                                type="text"
                                placeholder="Search results..."
                                className={styles.input}
                                style={{ border: 'none', outline: 'none', padding: '0.2rem', fontSize: '0.8rem', background: 'transparent' }}
                                value={customResultsSearch}
                                onChange={(e) => setCustomResultsSearch(e.target.value)}
                              />
                            </div>

                            {([
                              { name: 'Visited', desc: 'Listener opened the enrollment at least once.' },
                              { name: 'Time Spent (sec)', desc: 'Total time the listener spent in the enrollment...' },
                              { name: 'Slides Viewed', desc: 'Number of unique slides the listener has...' },
                              { name: 'Completion %', desc: 'Completion percentage from 0 to 100 (slides...' },
                              { name: 'Course Completed', desc: 'True when listener reached the last slide and...' },
                              { name: 'Test Score', desc: 'Score the listener earned in the embedded test.' }
                            ]).filter(m => 
                              (m.name.toLowerCase().includes(customResultsSearch.toLowerCase()) || m.desc.toLowerCase().includes(customResultsSearch.toLowerCase())) &&
                              !customResultsList.includes(m.name)
                            ).map((metric) => (
                              <button
                                key={metric.name}
                                type="button"
                                className={styles.dropdownItem}
                                style={{ padding: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-start' }}
                                onClick={() => {
                                  setCustomResultsList([...customResultsList, metric.name])
                                  setShowCustomResultDropdown(false)
                                }}
                              >
                                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>{metric.name}</span>
                                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{metric.desc}</span>
                              </button>
                            ))}
                            {([
                              { name: 'Visited', desc: 'Listener opened the enrollment at least once.' },
                              { name: 'Time Spent (sec)', desc: 'Total time the listener spent in the enrollment...' },
                              { name: 'Slides Viewed', desc: 'Number of unique slides the listener has...' },
                              { name: 'Completion %', desc: 'Completion percentage from 0 to 100 (slides...' },
                              { name: 'Course Completed', desc: 'True when listener reached the last slide and...' },
                              { name: 'Test Score', desc: 'Score the listener earned in the embedded test.' }
                            ]).filter(m => 
                              (m.name.toLowerCase().includes(customResultsSearch.toLowerCase()) || m.desc.toLowerCase().includes(customResultsSearch.toLowerCase())) &&
                              !customResultsList.includes(m.name)
                            ).length === 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>No results match filter.</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {customResultsList.length === 0 ? (
                      <div
                        style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem', backgroundColor: '#f8fafc' }}
                      >
                        No custom results added yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {customResultsList.map(metric => (
                          <span key={metric} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#eff6ff', color: '#2563eb', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                            {metric}
                            <button type="button" className={styles.tagCloseBtn} style={{ color: '#2563eb' }}
                              onClick={() => setCustomResultsList(customResultsList.filter(m => m !== metric))}
                              aria-label={`Remove ${metric}`}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {editingId && (
                    <div style={{ paddingTop: '0.25rem', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => {
                          const current = enrollments.find(e => e.id === editingId)
                          if (current) handleOpenManual(current)
                        }}
                      >
                        ✏️ Enter Results Manually (Override)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Bottom Absolute Action Bar */}
            <div className={styles.bottomActionBar}>
              <button type="submit" form="enrollment-form" className={styles.fullWidthActionBtn} disabled={quotaExceeded && !editingId}>
                {editingId ? 'Save Enrollment Links' : 'Create Enrollment Links'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manual Override Modal ── */}
      {isManualOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsManualOpen(false)} style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}
            style={{ height: 'auto', maxHeight: '90vh', borderRadius: '12px', maxWidth: '420px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manual Result Entry</h2>
              <button className={styles.modalClose} onClick={() => setIsManualOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: 'var(--sara-text-muted)', lineHeight: '1.4' }}>
                Manually override the enrollment result for offline or ATS/CRM-integrated onboarding flows.
              </p>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="manualStatus">Final Status</label>
                <select id="manualStatus" className={styles.input} value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as typeof manualStatus)}>
                  <option value="Completed">Completed (Passed)</option>
                  <option value="Failed">Failed (Not Passed)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="manualDate">Completion Date</label>
                <input type="date" id="manualDate" className={styles.input}
                  value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsManualOpen(false)}>Cancel</button>
              <button type="button" className={styles.btnPrimary} onClick={handleSaveManual}>Confirm Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
