'use client'

import React, { useState, useEffect, useTransition, useCallback } from 'react'
import styles from '../Enrollments.module.css'
import {
  ClipboardList, Search, Plus, Trash2, Edit3, Calendar,
  ChevronLeft, ChevronRight, Link as LinkIcon, X, Languages,
  Clock, BookOpen, UserCheck, AlertTriangle, QrCode,
  Columns, LayoutGrid, Table2, CheckCircle,
  Settings, Share2, RefreshCw, BarChart2, ClipboardCheck,
  FileText, ChevronDown, Video, Users, Shield, Lock, Info, ExternalLink, HelpCircle,
  GraduationCap, Mail, Copy, Code
} from 'lucide-react'

import { useToast } from '@/components/ui/ToastProvider'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  getEnrollments, createEnrollmentDraft, updateEnrollment,
  deleteEnrollment, manualEnterResult, getGroups,
  getEnrollmentStats, getCourses, getEnrollmentLinks, generateEnrollmentLinks, duplicateEnrollment
} from '@/app/actions/enrollments'
import OverageModal from '@/components/Modals/OverageModal'
import { getListeners, createListener } from '@/app/actions/listeners'
import { getProjects } from '@/app/actions/projects'
import { Enrollment, Listener, ENROLLMENT_STATUS, ENROLLMENT_COLUMNS } from '@/types/listeners'
import { Project } from '@/types'
import { useEnrollmentForm } from '../hooks/useEnrollmentForm'
import EnrollmentsTable from '../components/EnrollmentsTable'
import { QRCodeCanvas } from 'qrcode.react'
import LinkReadyModal from '@/components/ShareEnrollModal/LinkReadyModal'
import QuotaWidget from '@/components/QuotaWidget/QuotaWidget'
import { useUIStore } from '@/lib/store'
import { useSeatsQuota } from '@/hooks/useSeatsQuota'

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



// ── Kanban columns config ──────────────────────────────────────────────────────
const KANBAN_COLUMNS: { key: Enrollment['status']; label: string; color: string; bg: string }[] = [
  { key: 'Pending', label: 'Pending', color: '#64748b', bg: '#f1f5f9' },
  { key: 'In Progress', label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'Completed', label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
  { key: 'Failed', label: 'Failed', color: '#ef4444', bg: '#fef2f2' },
]

const METRICS_CATALOG = [
  'Visited', 'Time Spent', 'Score', 'Q&A Completed',
  'Employee Hired', 'Deal Closed', 'Feedback Given',
  'Documents Signed', 'Assessment Passed', 'Custom Goal',
]

const emptyFormState = {
  title: '',
  targetType: 'listener' as 'anonymous' | 'listener' | 'group',
  listenerId: '',
  contentType: 'project' as 'project' | 'course',
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
    invitationSubject: '',
    reminderSubject: '',
    reminderText: '',
    reminderCount: 3,
    stopRemindersWhenOpened: true,
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


// ── Hooks ───────────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function EnrollmentsDashboard() {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const qrCanvasRef = React.useRef<HTMLCanvasElement>(null)

  const isFutureVersion = useUIStore((state) => state.isFutureVersion)

  // Data
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [listeners, setListeners] = useState<Listener[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [groups, setGroups] = useState<{ id: string, name: string }[]>([])
  const [courses, setCourses] = useState<{ id: string, name: string }[]>([])
  const [enrollmentLinks, setEnrollmentLinks] = useState<any[]>([])
  const [isGeneratingLinks, setIsGeneratingLinks] = useState(false)
  const [isSendingInvitation, setIsSendingInvitation] = useState(false)
  const [invitationSent, setInvitationSent] = useState(false)
  // Quota — sourced from shared Zustand store via hook
  const { activeCount: quotaActive, maxSeats: quotaMax, isLoaded: quotaLoaded, refresh: refreshQuota } = useSeatsQuota()
  const quota = quotaLoaded ? { activeCount: quotaActive, maxSeats: quotaMax } : null
  const [stats, setStats] = useState({ activeCount: 0, completedCount: 0, uniqueListeners: 0, completionRate: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // View mode: table or kanban
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL sync initialization
  const initialStatus = searchParams?.get('status') || 'All Status'
  const initialGroup = searchParams?.get('group') || 'All Group'
  const initialSearch = searchParams?.get('search') || ''
  const initialSortBy = searchParams?.get('sortBy') || 'created_at'
  const initialSortOrder = searchParams?.get('sortOrder') === 'asc' ? 'asc' : 'desc'

  // State filters
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
  const [groupFilter, setGroupFilter] = useState<string>(initialGroup)
  const [search, setSearch] = useState(initialSearch)
  const [sortBy, setSortBy] = useState<string>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expirationDays, setExpirationDays] = useState(14)
  const limit = 50
  const [rowsPerPage, setRowsPerPage] = useState(limit)

  const debouncedSearch = useDebounce(search, 300)
  const hasActiveFilters = statusFilter !== 'All Status' || groupFilter !== 'All Group' || search.trim() !== ''

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showGroupDropdown, setShowGroupDropdown] = useState(false)
  const [showListenersInGroups, setShowListenersInGroups] = useState(false)
  const [showProjectsInCourses, setShowProjectsInCourses] = useState(false)
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeGearId, setActiveGearId] = useState<string | null>(null)
  const [activeInlineStatusId, setActiveInlineStatusId] = useState<string | null>(null)

  // Columns state
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Name', 'ListenerGroup', 'ProjectCourse', 'Status', 'Link'
  ])
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false)

  // Drawer state
  const [isOpen, setIsOpen] = useState(false)
  const [previewEmailOpen, setPreviewEmailOpen] = useState(false)

  const [advancedSettings, setAdvancedSettings] = useState<Record<string, boolean>>({})
  const toggleAdvancedSetting = (setting: string) => {
    setAdvancedSettings(prev => ({ ...prev, [setting]: !prev[setting] }))
  }

  // Modal edit state (not in form hook)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  // Manual override modal
  const [manualId, setManualId] = useState<string | null>(null)
  const [manualStatus, setManualStatus] = useState<'Completed' | 'Failed'>('Completed')
  const [manualDate, setManualDate] = useState('')
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [isOverageModalOpen, setIsOverageModalOpen] = useState(false)

  // Custom confirm dialog (replaces native window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [qrModal, setQrCodeModal] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' })
  const [embedModal, setEmbedModal] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' })
  const [shareLinkModal, setShareLinkModal] = useState<{ isOpen: boolean; url: string }>({ isOpen: false, url: '' })

  // Sub-modal for quick create listener
  const [isCreateListenerOpen, setIsCreateListenerOpen] = useState(false)
  const [newListenerForm, setNewListenerForm] = useState({
    firstName: '', lastName: '', email: '',
    company: '', industry: '', position: '', linkedin: '',
    country: '', department: '', language: 'en'
  })
  const [isCreatingListener, setIsCreatingListener] = useState(false)

  const handleQuickCreateListener = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newListenerForm.email.trim()) {
      showToast('Email is required', 'error')
      return
    }
    setIsCreatingListener(true)
    try {
      const created = await createListener({
        ...newListenerForm,
        documents: [],
        userId: '00000000-0000-0000-0000-000000000000'
      })
      // Update local listener list to show it immediately
      setListeners(prev => [created, ...prev])
      setFormData(prev => ({ ...prev, listenerId: created.id }))
      showToast('Listener created', 'success')
      setIsCreateListenerOpen(false)
      setNewListenerForm({
        firstName: '', lastName: '', email: '',
        company: '', industry: '', position: '', linkedin: '',
        country: '', department: '', language: 'en'
      })
    } catch (err: any) {
      showToast(err.message || 'Failed to create listener', 'error')
    } finally {
      setIsCreatingListener(false)
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    const base = '/enrollments'
    const qs = searchParams?.toString()
    router.push(qs ? `${base}?${qs}` : base)
  }

  const form = useEnrollmentForm()
  const {
    activeTab, setActiveTab,
    formData, setFormData,
    enableReminders, setEnableReminders,
    presenters, setPresenters,
    calendarUrl, setCalendarUrl,
    dontSendOpenNotifications, setDontSendOpenNotifications,
    bookCalendarOrStartAvatar, setBookCalendarOrStartAvatar,
    sendAnimatedGif, setSendAnimatedGif,
    scheduledDate, setScheduledDate,
    scheduledTime, setScheduledTime,
    showSlideCounter, setShowSlideCounter,
    showPlayPause, setShowPlayPause,
    showPrevNext, setShowPrevNext,
    showProgressBar, setShowProgressBar,
    showSettingsBtn, setShowSettingsBtn,
    showFullscreenBtn, setShowFullscreenBtn,
    showAllSlideControls, setShowAllSlideControls,
    showAvatarPanel, setShowAvatarPanel,
    showAvatarVideoPhoto, setShowAvatarVideoPhoto,
    showAvatarNameLabel, setShowAvatarNameLabel,
    showMuteBtn, setShowMuteBtn,
    showChatMessages, setShowChatMessages,
    showChatInput, setShowChatInput,
    showMicrophoneBtn, setShowMicrophoneBtn,
    showAvatarFrameBorder, setShowAvatarFrameBorder,
    avatarPosition, setAvatarPosition,
    avatarHeight, setAvatarHeight,
    chatHeight, setChatHeight,
    showPresenterInfo, setShowPresenterInfo,
    showCallPresenter, setShowCallPresenter,
    showScheduleMeeting, setShowScheduleMeeting,
    showLikeThumbs, setShowLikeThumbs,
    showCommentFeedback, setShowCommentFeedback,
    showShareBtn, setShowShareBtn,
    showSlidesDropdown, setShowSlidesDropdown,
    showSlideFeed, setShowSlideFeed,
    allowListenerShareSlides, setAllowListenerShareSlides,
    enableChatWithListener, setEnableChatWithListener,
    allowComments, setAllowComments,
    allowDownloadFile, setAllowDownloadFile,
    allowCallPresenter, setAllowCallPresenter,
    callPresenterBtnText, setCallPresenterBtnText,
    allowScheduleMeeting, setAllowScheduleMeeting,
    scheduleMeetingCalendarUrl, setScheduleMeetingCalendarUrl,
    scheduleMeetingBtnText, setScheduleMeetingBtnText,
    enableSubtitles, setEnableSubtitles,
    voiceRecognition, setVoiceRecognition,
    sendPdfReportEmail, setSendPdfReportEmail,
    sendPerformanceReportEmail, setSendPerformanceReportEmail,
    allowListenersViewViaLink, setAllowListenersViewViaLink,
    useVoiceMessageAudience, setUseVoiceMessageAudience,
    allowChangeDetailLevel, setAllowChangeDetailLevel,
    showDebuggerMode, setShowDebuggerMode,
    levelOfDetail, setLevelOfDetail,
    startFromSlide, setStartFromSlide,
    securityHumanDetection, setSecurityHumanDetection,
    securityAntiFraud, setSecurityAntiFraud,
    securityIdentityVerification, setSecurityIdentityVerification,
    securityAntiImpersonation, setSecurityAntiImpersonation,
    resultsRecording, setResultsRecording,
    resultsSendToListener, setResultsSendToListener,
    resultsSendToPresenterListener, setResultsSendToPresenterListener,
    resultsSendToPresenterGroup, setResultsSendToPresenterGroup,
    resultsGenerateSummary, setResultsGenerateSummary,
    resultsShowCorrectAnswer, setResultsShowCorrectAnswer,
    resultsAnswerLimitedTime, setResultsAnswerLimitedTime,
    resultsAnswerTimeLimit, setResultsAnswerTimeLimit,
    customResultsList, setCustomResultsList,
    customResultsSearch, setCustomResultsSearch,
    showCustomResultDropdown, setShowCustomResultDropdown,
  } = form

  const isMounted = React.useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const loadData = useCallback(async (resetPage = false) => {
    if (isMounted.current) setIsLoading(true)
    try {
      const currentPage = resetPage ? 1 : page
      const offset = (currentPage - 1) * limit
      const [result, lRes, pRes, grpRes, statsRes, coursesRes] = await Promise.all([
        getEnrollments({
          search: debouncedSearch,
          status: statusFilter,
          groupName: groupFilter,
          sortBy,
          sortOrder,
          limit,
          offset
        }),
        getListeners('', 1, 100),
        getProjects(),
        getGroups(),
        getEnrollmentStats(),
        getCourses(),
      ])

      if (!isMounted.current) return

      if (resetPage) {
        setEnrollments(result.data)
        setPage(1)
      } else {
        if (currentPage === 1) setEnrollments(result.data)
        else setEnrollments(prev => [...prev, ...result.data])
      }
      setTotalCount(result.count)
      // Quota is managed by useSeatsQuota hook — refresh it after mutations
      await refreshQuota()
      setListeners(lRes.data)
      setProjects(pRes)
      setGroups(grpRes)
      setStats(statsRes as any)
      setCourses(coursesRes)
    } catch (e) {
      if (isMounted.current) {
        console.error('[Enrollments] loadData failed:', e)
        showToast('Failed to load data', 'error')
      }
    } finally {
      if (isMounted.current) setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter, groupFilter, sortBy, sortOrder, page, showToast])

  // Refetch when filters, pagination, or a mutation refresh is triggered
  useEffect(() => {
    loadData(page === 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, groupFilter, sortBy, sortOrder, page, refreshKey])

  // Sync URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'All Status') params.set('status', statusFilter)
    if (groupFilter !== 'All Group') params.set('group', groupFilter)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (sortBy !== 'created_at') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)

    // Only update URL if not /enrollments/add
    if (pathname === '/enrollments') {
      const newUrl = params.toString() ? `/enrollments?${params.toString()}` : '/enrollments'
      window.history.replaceState(null, '', newUrl)
    }
  }, [statusFilter, groupFilter, debouncedSearch, sortBy, sortOrder, pathname])

  useEffect(() => {
    // Initial load from URL
    if (pathname === '/enrollments/add' && !isOpen) {
      handleOpenCreate()
    } else if (pathname.startsWith('/enrollments/') && pathname !== '/enrollments/add' && enrollments.length > 0 && !isOpen) {
      const id = pathname.split('/')[2]
      const enrollment = enrollments.find(e => e.id === id)
      if (enrollment) {
        handleOpenEdit(enrollment)
      }
    }
  }, [pathname, enrollments])

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/enrollments/add') {
        if (!isOpen) handleOpenCreate()
      } else if (path.startsWith('/enrollments/') && path !== '/enrollments/add') {
        const id = path.split('/')[2]
        const enrollment = enrollments.find(e => e.id === id)
        if (enrollment) handleOpenEdit(enrollment)
      } else {
        setIsOpen(false)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enrollments, isOpen])

  useEffect(() => {
    if (quota) {
      if (formData.targetType?.toLowerCase() === 'listener' && formData.listenerId) {
        const isAlreadyActive = enrollments.some(
          e => e.listenerId === formData.listenerId && (e.status === 'Pending' || e.status === 'In Progress')
        )
        setQuotaExceeded(!isAlreadyActive && quota.activeCount >= quota.maxSeats)
      } else {
        // For Group or Anonymous, we assume at least 1 new seat is needed.
        // We block if quota is already full.
        setQuotaExceeded(quota.activeCount >= quota.maxSeats)
      }
    } else {
      setQuotaExceeded(false)
    }
  }, [formData.targetType, formData.listenerId, quota, enrollments])

  // ── Drawer helpers ────────────────────────────────────────────────────────────
  const handleOpenCreate = (initialStatus?: typeof ENROLLMENT_STATUS[number]) => {
    setEditingId(null)
    setFormData({
      ...emptyFormState,
      status: initialStatus || 'Pending',
      title: '',
      projectId: projects[0]?.id || '',
      listenerId: listeners[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      emailSchedule: {
        ...emptyFormState.emailSchedule,
      }
    })
    setQuotaExceeded(false)
    setActiveTab('general')
    setIsOpen(true)
    window.history.pushState(null, '', '/enrollments/add')

    // Reset visual states
    setPresenters([])
    setCalendarUrl('')
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
    getEnrollmentLinks(enrollment.id).then(links => setEnrollmentLinks(links))
    setFormData({
      title: enrollment.title,
      targetType: enrollment.groupId ? 'Group' : (enrollment.listenerId ? 'Listener' : 'Anonymous'),
      listenerId: enrollment.listenerId || '',
      contentType: enrollment.contentType?.toLowerCase() === 'course' ? 'Course' : 'Project',
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
        invitationSubject: enrollment.emailSchedule?.invitationSubject ?? '',
        reminderSubject: enrollment.emailSchedule?.reminderSubject ?? '',
        reminderText: enrollment.emailSchedule?.reminderText ?? '',
        reminderCount: enrollment.emailSchedule?.reminderCount ?? 3,
        stopRemindersWhenOpened: enrollment.emailSchedule?.stopRemindersWhenOpened ?? true,
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
    window.history.pushState(null, '', `/enrollments/${enrollment.id}`)

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
    // Validate required General fields — redirect to General tab if missing
    const generalErrors: string[] = []
    if (formData.targetType === 'Listener' && !formData.listenerId) generalErrors.push('Please select a Listener')
    if (!formData.projectId) generalErrors.push('Please select a Project')
    if (generalErrors.length > 0) {
      setActiveTab('general')
      showToast(generalErrors.join(' · '), 'error')
      return
    }

    let computedTitle = formData.title;
    if (!computedTitle) {
      const project = projects.find(p => p.id === formData.projectId)
      if (formData.targetType === 'Listener') {
        const listener = listeners.find(l => l.id === formData.listenerId)
        computedTitle = `${listener?.firstName || listener?.email || 'Unknown'} → ${project?.title || 'Project'}`
      } else {
        computedTitle = project?.title || 'Presentation'
      }
    }

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
        'sendResultsToPresenterListener': resultsSendToPresenterListener,
        'sendResultsToPresenterGroup': resultsSendToPresenterGroup,
        generateSummary: resultsGenerateSummary,
        showCorrectAnswer: resultsShowCorrectAnswer,
        answerLimitedTime: resultsAnswerLimitedTime,
        customMetrics: customResultsList,
      }
    }

    try {
      if (editingId) {
        await updateEnrollment(editingId, {
          title: computedTitle, status: formData.status as Enrollment['status'],
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: mergedEmailSchedule,
          targetType: formData.targetType?.toLowerCase() as any,
          contentType: formData.contentType?.toLowerCase() as any,
          groupId: formData.targetType?.toLowerCase() === 'group' ? (formData as any).groupId : null,
          listenerId: formData.targetType?.toLowerCase() === 'listener' ? formData.listenerId : null,
          expirationDays: expirationDays,
        } as any)
        showToast('Enrollment updated', 'success')
      } else {
        if (quotaExceeded) { setIsOverageModalOpen(true); return }
        // One-step: create draft + immediately generate links
        const created = await createEnrollmentDraft({
          title: computedTitle,
          listenerId: formData.targetType?.toLowerCase() === 'listener' ? formData.listenerId : null,
          projectId: formData.projectId, status: formData.status as Enrollment['status'],
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: mergedEmailSchedule,
          targetType: formData.targetType?.toLowerCase() as 'anonymous' | 'listener' | 'group',
          contentType: formData.contentType?.toLowerCase() as 'project' | 'course',
          bookCalendarOrStartAvatar: bookCalendarOrStartAvatar,
          groupId: formData.targetType?.toLowerCase() === 'group' ? (formData as any).groupId : null,
          expirationDays: expirationDays,
        } as any)
        // Auto-generate links immediately (one step)
        if (created?.id) {
          try { await generateEnrollmentLinks(created.id) } catch {/* non-blocking */}
        }
        showToast('Enrollment created with links!', 'success')
      }
      closeModal()
      router.refresh()
      setRefreshKey(k => k + 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      if (message.includes('QUOTA_EXCEEDED')) {
        setIsOverageModalOpen(true)
      } else {
        showToast(message, 'error')
      }
    }
  }

  const handleSendNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (formData.targetType === 'Listener' && !formData.listenerId) {
      showToast('Please select a Listener', 'error'); return
    }
    if (!formData.projectId) { showToast('Please select a Project', 'error'); return }
    if (!editingId) {
      showToast('Please save the enrollment first', 'error'); return
    }

    setIsSendingInvitation(true)
    setInvitationSent(false)

    try {
      const res = await fetch('/api/enrollments/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: editingId }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setInvitationSent(true)
        showToast(`✓ Invitation sent to ${json.sentTo || 'listener'}!`, 'success')
        // Auto-fill Schedule Send with current date/time to record when it was sent
        const now = new Date()
        setScheduledDate(now.toISOString().split('T')[0])
        setScheduledTime(now.toTimeString().slice(0, 5))
        // Reset success state after 4s
        setTimeout(() => setInvitationSent(false), 4000)
      } else {
        showToast(json.error || 'Failed to send email', 'error')
      }
    } catch (err) {
      console.error('send-invitation fetch error:', err)
      showToast('Network error sending invitation', 'error')
    } finally {
      setIsSendingInvitation(false)
    }
  }

  const handleDelete = (id: string) => {
    setConfirmDialog({
      message: 'Delete this enrollment? Link redirects will stop immediately.',
      onConfirm: async () => {
        try { await deleteEnrollment(id); showToast('Deleted', 'success'); router.refresh(); setRefreshKey(k => k + 1) }
        catch (err) { const message = err instanceof Error ? err.message : 'Failed to delete'; showToast(message, 'error') }
      }
    })
  }

  const handleDuplicate = async (id: string) => {
    const enrollment = enrollments.find(e => e.id === id)
    if (!enrollment) return

    setEditingId(null)
    setEnrollmentLinks([])
    setFormData({
      title: `${enrollment.title} (Copy)`,
      targetType: enrollment.groupId ? 'Group' : (enrollment.listenerId ? 'Listener' : 'Anonymous'),
      listenerId: '',
      contentType: enrollment.contentType?.toLowerCase() === 'course' ? 'Course' : 'Project',
      projectId: enrollment.projectId,
      status: 'Pending',
      startDate: enrollment.startDate ? enrollment.startDate.split('T')[0] : '',
      emailSchedule: {
        sendInvite: enrollment.emailSchedule?.sendInvite ?? true,
        sendReminders: enrollment.emailSchedule?.sendReminders ?? true,
        reminderFrequency: enrollment.emailSchedule?.reminderFrequency ?? 'daily',
        inviteSubject: enrollment.emailSchedule?.inviteSubject ?? emptyFormState.emailSchedule.inviteSubject,
        inviteBody: enrollment.emailSchedule?.inviteBody ?? emptyFormState.emailSchedule.inviteBody,
        translateToListenerLang: enrollment.emailSchedule?.translateToListenerLang ?? true,
        invitationSubject: enrollment.emailSchedule?.invitationSubject ?? '',
        reminderSubject: enrollment.emailSchedule?.reminderSubject ?? '',
        reminderText: enrollment.emailSchedule?.reminderText ?? '',
        reminderCount: enrollment.emailSchedule?.reminderCount ?? 3,
        stopRemindersWhenOpened: enrollment.emailSchedule?.stopRemindersWhenOpened ?? true,
      },
      results: {
        recording: enrollment.emailSchedule?.results?.recording ?? false,
        sendResultsToListener: enrollment.emailSchedule?.results?.sendResultsToListener ?? true,
        sendResultsToPresenter: enrollment.emailSchedule?.results?.sendResultsToPresenter ?? false,
        generateSummary: enrollment.emailSchedule?.results?.generateSummary ?? false,
        answerLimitedTime: enrollment.emailSchedule?.results?.answerLimitedTime ?? false,
        customMetrics: enrollment.emailSchedule?.results?.customMetrics ?? [],
      },
    } as any)
    setQuotaExceeded(false)
    setActiveTab('general')
    setIsOpen(true)
    window.history.pushState(null, '', `/enrollments/add`)

    setPresenters(enrollment.emailSchedule?.presenters ?? ['info@roi4cio.com'])
    setCalendarUrl(enrollment.emailSchedule?.calendarUrl ?? 'https://meetings.hubspot.com/your-handle')
    setDontSendOpenNotifications(enrollment.emailSchedule?.dontSendOpenNotifications ?? false)
    setBookCalendarOrStartAvatar(enrollment.emailSchedule?.bookCalendarOrStartAvatar ?? false)
    setSendAnimatedGif(enrollment.emailSchedule?.sendAnimatedGif ?? false)
    setScheduledDate(enrollment.emailSchedule?.scheduledDate ?? '')
    setScheduledTime(enrollment.emailSchedule?.scheduledTime ?? '')
    setEnableReminders(enrollment.emailSchedule?.sendReminders ?? true)

    setSecurityHumanDetection(enrollment.emailSchedule?.security?.humanDetection ?? false)
    setSecurityAntiFraud(enrollment.emailSchedule?.security?.antiFraud ?? false)
    setSecurityIdentityVerification(enrollment.emailSchedule?.security?.identityVerification ?? false)
    setSecurityAntiImpersonation(enrollment.emailSchedule?.security?.antiImpersonation ?? false)

    setResultsRecording(enrollment.emailSchedule?.results?.recording ?? false)
    setResultsSendToListener(enrollment.emailSchedule?.results?.sendResultsToListener ?? true)
    setResultsSendToPresenterListener(enrollment.emailSchedule?.results?.sendResultsToPresenterListener ?? false)
    setResultsSendToPresenterGroup(enrollment.emailSchedule?.results?.sendResultsToPresenterGroup ?? false)
    setResultsGenerateSummary(enrollment.emailSchedule?.results?.generateSummary ?? false)
    setResultsShowCorrectAnswer(enrollment.emailSchedule?.results?.showCorrectAnswer ?? false)
    setResultsAnswerLimitedTime(enrollment.emailSchedule?.results?.answerLimitedTime ?? false)
    setCustomResultsList(enrollment.emailSchedule?.results?.customMetrics ?? [])
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
      setSelectedIds([]); router.refresh(); setRefreshKey(k => k + 1)
    } catch { showToast('Failed to update', 'error') }
  }

  const handleInlineStatusChange = async (id: string, newStatus: typeof ENROLLMENT_STATUS[number]) => {
    try {
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
      setActiveInlineStatusId(null)
      await updateEnrollment(id, { status: newStatus })
      showToast('Status updated', 'success')
    } catch (e) {
      showToast('Failed to update status', 'error')
      setRefreshKey(k => k + 1)
    }
  }

  const handleBulkDelete = () => {
    setConfirmDialog({
      message: `Delete ${selectedIds.length} enrollment${selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => deleteEnrollment(id)))
          showToast(`${selectedIds.length} deleted`, 'success')
          setSelectedIds([]); router.refresh(); setRefreshKey(k => k + 1)
        } catch { showToast('Failed to delete', 'error') }
      }
    })
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
      setIsManualOpen(false); router.refresh(); setRefreshKey(k => k + 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed'
      showToast(message, 'error')
    }
  }

  const handleCopyLink = (id: string) => {
    const baseDomain = typeof window !== 'undefined' ? window.location.origin : 'https://pitch-avatar.com';
    const uniqueUrl = `${baseDomain}/v/enroll-${id.slice(0, 8)}`;
    setShareLinkModal({ isOpen: true, url: uniqueUrl });
  }
  const handleSendInviteNow = () => showToast('Invitation email sent!', 'success')
  const handleSendReminderNow = () => showToast('Reminder email sent!', 'success')
  const handleUpdateWebLink = () => {
    showToast(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>Link updated</span>
        <span style={{ fontSize: '13px', color: '#475569' }}>The shared link now serves the latest project data.</span>
      </div>,
      'link-updated'
    )
  }

  // Global click handler to dismiss dropdowns on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      setShowStatusDropdown(false)
      setShowGroupDropdown(false)
      setShowColumnsDropdown(false)
      setActiveGearId(null)
      setActiveInlineStatusId(null)
    }
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  // ── Status badge helper ───────────────────────────────────────────────────────
  const getStatusClass = (status: string) => {
    if (status === 'In Progress') return styles.statusInProgress
    if (status === 'Completed') return styles.statusCompleted
    if (status === 'Failed') return styles.statusFailed
    if (status === 'Sent') return styles.statusSent
    if (status === 'Draft') return styles.statusDraft
    if (status === 'Expired') return styles.statusExpired
    return styles.statusPending
  }

  // Use database enrollments
  const allEnrollments = enrollments

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filteredEnrollments = allEnrollments.filter(e => {
    // 4. Toggle filters
    // If showListenersInGroups is false, hide mock rows that are group members
    if (!showListenersInGroups && e.targetType === 'listener' && e.groupName) {
      return false
    }

    // If showProjectsInCourses is false, hide projects in courses (or Course types)
    if (!showProjectsInCourses && e.contentType === 'course') {
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
          {quotaLoaded && (
            <div style={{ width: '220px' }}>
              <QuotaWidget />
            </div>
          )}
          <button className={styles.btnPrimary} onClick={() => handleOpenCreate()} aria-label="Create Enrollment">
            <Plus size={16} /> Create Enrollment
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ gap: '0.25rem', padding: '1rem 1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completed</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {stats.completedCount}
          </span>
        </div>
        <div className="card" style={{ gap: '0.25rem', padding: '1rem 1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Unique Listeners</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {stats.uniqueListeners}
          </span>
        </div>
        <div className="card" style={{ gap: '0.25rem', padding: '1rem 1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completion Rate</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
            {stats.completionRate}%
          </span>
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
                {['All Status', 'Completed', 'In Progress', 'Pending', 'Sent', 'Failed', 'Draft']
                  .filter(st => isFutureVersion ? true : !['Sent', 'Draft'].includes(st))
                  .map(st => (
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

          {/* Group Dropdown (Hidden for now) */}
          {false && (
            <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
              <button className={styles.dropdownBtn} onClick={() => { setShowGroupDropdown(!showGroupDropdown); setShowStatusDropdown(false); setShowColumnsDropdown(false); }}>
                <span>{groupFilter}</span>
                <ChevronDown size={14} />
              </button>
              {showGroupDropdown && (
                <div className={styles.dropdownPopover}>
                  {['All Group', ...groups.map(g => g.name)].map(gp => (
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
          )}

          {/* More Filters Dropdown */}
          {isFutureVersion && (
          <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.dropdownBtn} onClick={() => { setShowFiltersDropdown(!showFiltersDropdown); setShowGroupDropdown(false); setShowStatusDropdown(false); setShowColumnsDropdown(false); }}>
              <Settings size={14} style={{ color: '#64748b' }} />
              <span>More Filters</span>
            </button>
            {showFiltersDropdown && (
              <div className={styles.dropdownPopover} style={{ padding: '1rem', width: '250px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Additional Toggles</div>
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
                    <span>Listeners in Groups</span>
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
                    <span>Projects in Courses</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          )}

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

        {/* View toggle */}
        {isFutureVersion && (
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
        )}
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
            <button className={styles.bulkBtn} onClick={() => { showToast('Invitations sent to ' + selectedIds.length + ' enrollments', 'success'); setSelectedIds([]); }}>
              <Mail size={14} /> Send Invitations
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
        <EnrollmentsTable
          styles={styles}
          enrollments={filteredEnrollments}
          selectedIds={selectedIds}
          visibleColumns={visibleColumns}
          isLoading={isLoading}
          isPending={isPending}
          toggleSelectAll={toggleSelectAll}
          toggleSelect={toggleSelect}
          handleCopyLink={handleCopyLink}
          handleOpenEdit={handleOpenEdit}
          activeInlineStatusId={activeInlineStatusId}
          setActiveInlineStatusId={setActiveInlineStatusId}
          handleInlineStatusChange={handleInlineStatusChange}
          activeGearId={activeGearId}
          setActiveGearId={setActiveGearId}
          handleOpenManual={handleOpenManual}
          handleUpdateWebLink={handleUpdateWebLink}
          handleDelete={handleDelete}
          handleDuplicate={handleDuplicate}
          getStatusClass={getStatusClass}
          page={page}
          setPage={setPage}
          totalCount={totalCount}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          isFutureVersion={isFutureVersion}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* ── Kanban view ── */}
      {viewMode === 'kanban' && (
        <div className={styles.kanbanBoard}>
          {KANBAN_COLUMNS.map((col) => {
            const colItems = filteredEnrollments.filter(e => e.status === col.key)
            return (
              <div
                key={col.key}
                className={styles.kanbanColumn}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onDragLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.backgroundColor = '';
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) {
                    handleInlineStatusChange(id, col.key);
                  }
                }}
              >
                <div className={styles.kanbanColumnHeader} style={{ borderTop: `3px solid ${col.color}` }}>
                  <span className={styles.kanbanColumnTitle}>{col.label}</span>
                  <span className={styles.kanbanColumnCount} style={{ background: col.bg, color: col.color }}>
                    {colItems.length}
                  </span>
                </div>
                <div className={styles.kanbanColumnBody}>
                  {isLoading || isPending ? (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={`skeleton-card-${i}`} className={styles.kanbanCard} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ width: '80%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '26px', height: '26px', backgroundColor: '#e2e8f0', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <div style={{ width: '60%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                              <div style={{ width: '40%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : colItems.length === 0 ? (
                    <div className={styles.kanbanEmpty}>
                      {hasActiveFilters ? 'No enrollments match filters' : 'No enrollments'}
                    </div>
                  ) : (
                    colItems.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className={styles.kanbanCard}
                        style={{ cursor: 'pointer' }}
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', enrollment.id); }}
                        onClick={() => handleOpenEdit(enrollment)}
                      >
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
                        <div className={styles.kanbanCardActions} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleCopyLink(enrollment.id)} title="Copy link" aria-label="Copy link">
                            <LinkIcon size={13} />
                          </button>
                          <button onClick={() => handleOpenEdit(enrollment)} title="Edit Enrollment" aria-label="Edit">
                            <Edit3 size={13} />
                          </button>
                          <button className={styles.kanbanCardBtnDanger} onClick={() => handleDelete(enrollment.id)} title="Delete Enrollment" aria-label="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Add card shortcut */}
                  <button className={styles.kanbanAddBtn} onClick={() => handleOpenCreate(col.key)} aria-label={`Add to ${col.label}`}>
                    <Plus size={14} /> Add enrollment
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Load More Button for both views */}
      {viewMode === 'kanban' && enrollments.length < totalCount && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
          <button
            className={styles.btnSecondary}
            onClick={() => setPage(page + 1)}
            disabled={isPending}
          >
            {isPending ? 'Loading...' : `Load More (${enrollments.length} of ${totalCount})`}
          </button>
        </div>
      )}

      {/* ── Upgraded Create / Edit Enrollment Wizard Modal ── */}
      {isOpen && (
        <div className={styles.wideModalOverlay} onClick={closeModal}>
          <div className={styles.modalContentWide} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle} style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Share & Enroll</h2>
                <h2 className={styles.modalTitle}>{editingId ? 'Edit Enrollment' : 'Add Enrollment'}</h2>
                {formData.title && <p className={styles.modalSub}>{formData.title}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancel</button>
                <button type="submit" form="enrollment-form" className={styles.btnPrimary}>
                  {editingId ? 'Save Changes' : 'Create Enrollment'}
                </button>
              </div>
            </div>

            {/* Tab Headers */}
            <div className={styles.tabsHeader}>
              <button type="button" className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`} onClick={() => setActiveTab('general')}>General</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`} onClick={() => setActiveTab('invitations')}>Invitation and Reminders</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'links' ? styles.tabActive : ''}`} onClick={() => setActiveTab('links')}>Links</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'leadForm' ? styles.tabActive : ''}`} onClick={() => setActiveTab('leadForm')}>Lead form</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'advanced' ? styles.tabActive : ''}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
              <button type="button" className={`${styles.tab} ${activeTab === 'languageSettings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('languageSettings')}>Language settings</button>
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
                        You have used <strong>{quotaActive} of {quotaMax} seats</strong>. New active enrollments are blocked.
                      </p>
                      <a href="/plans#listener-seats-addons" className={styles.alertLink}>Upgrade Listener Seats →</a>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="title">Title (shown to listener) *</label>
                    <input type="text" id="title" className={styles.input} required
                      value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="targetType">Target Type</label>
                      <select id="targetType" className={styles.input} value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value as typeof formData.targetType })}>
                        <option value="anonymous">Anonymous (Shared Link)</option>
                        <option value="listener">Listener (Personalized Link)</option>
                        <option value="group">Group (soon)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="contentType">Content Type</label>
                      <select id="contentType" className={styles.input} value={formData.contentType}
                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value as typeof formData.contentType })}>
                        <option value="project">Project</option>
                        <option value="course">Course (soon)</option>
                      </select>
                    </div>
                  </div>

                  {formData.targetType?.toLowerCase() === 'listener' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="listenerSelect">Select Listener *</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select id="listenerSelect" className={styles.input} required
                          value={formData.listenerId} onChange={(e) => setFormData({ ...formData, listenerId: e.target.value })}
                          style={{ flex: 1 }}>
                          <option value="" disabled>Select listener…</option>
                          {listeners.map(l => (
                            <option key={l.id} value={l.id}>{l.firstName || ''} {l.lastName || ''} ({l.email})</option>
                          ))}
                        </select>
                        {/* Create Listener button — hidden for now */}
                        {/* <button type="button" className={styles.btnSecondary} onClick={() => setIsCreateListenerOpen(true)} style={{ whiteSpace: 'nowrap' }}>
                          <Plus size={16} /> Create Listener
                        </button> */}
                      </div>
                    </div>
                  )}

                  {formData.targetType?.toLowerCase() === 'group' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="groupSelect">Select Group *</label>
                      <select id="groupSelect" className={styles.input} required
                        value={(formData as any).groupId || ''} onChange={(e) => setFormData({ ...formData, targetType: 'Group', groupId: e.target.value } as any)}>
                        <option value="" disabled>Select group…</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.contentType?.toLowerCase() === 'project' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="projectSelect">Select Project *</label>
                      <select id="projectSelect" className={styles.input} required
                        value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                        <option value="" disabled>Select project…</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.title} ({p.type})</option>)}
                      </select>
                    </div>
                  )}

                  {formData.contentType?.toLowerCase() === 'course' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="courseSelect">Select Course *</label>
                      <select id="courseSelect" className={styles.input} required
                        value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                        <option value="" disabled>Select course…</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Presenter(s)</label>
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
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>
                      These email addresses will receive session transcripts and results notifications. Add the team members who should be informed when a listener completes this enrollment.
                    </p>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="hubspotCalendar">Link to Calendar</label>
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
                      <span className={styles.formLabel}>Don&apos;t send notification when listener opens enrollment</span>
                    </label>

                    <label className={styles.switchWrapper}>
                      <input type="checkbox" className={styles.switchInput} checked={bookCalendarOrStartAvatar} onChange={(e) => setBookCalendarOrStartAvatar(e.target.checked)} />
                      <div className={styles.switchTrack}>
                        <div className={styles.switchThumb} />
                      </div>
                      <span className={styles.formLabel}>Choice at the beginning: book calendar OR start avatar now</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Invitation and Reminders */}
              {activeTab === 'invitations' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Email Invitation Template</div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="inviteSubject">Invitation Subject</label>
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
                      {[
                        { tag: '{{listener_first_name}}', label: '#Listener First Name#' },
                        { tag: '{{listener_last_name}}', label: '#Listener Last Name#' },
                        { tag: '{{listener_second_name}}', label: '#Listener Second Name#' },
                        { tag: '{{listener_company}}', label: '#Listener Company#' },
                        { tag: '{{presenter_first_name}}', label: '#Presenter First Name#' },
                        { tag: '{{presenter_last_name}}', label: '#Presenter Last Name#' },
                        { tag: '{{presentation_title}}', label: '#Presentation Title#' },
                        { tag: '{{course_name}}', label: '#Course Name#' },
                        { tag: '{{presentation_link}}', label: '#Presentation Link#' },
                        { tag: '{{avatar_name}}', label: '#Avatar Name#' }
                      ].map(p => (
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

                  <div className={styles.formCardTitle} style={{ marginTop: '0.5rem' }}>Delivery Scheduling</div>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="scheduleDate">Scheduled Send Date</label>
                      <input type="date" id="scheduleDate" className={styles.input}
                        value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="scheduleTime">Scheduled Send Time</label>
                      <input type="time" id="scheduleTime" className={styles.input}
                        value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                    </div>
                  </div>

                  {(!scheduledDate && !scheduledTime) && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{
                        marginTop: '0.5rem',
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minWidth: '180px',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        ...(invitationSent ? { background: '#22c55e', borderColor: '#22c55e', color: '#fff' } : {}),
                      }}
                      disabled={isSendingInvitation}
                      onClick={handleSendNow}
                    >
                      {isSendingInvitation ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Sending...
                        </>
                      ) : invitationSent ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Sent!
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                          Send Invitation Now
                        </>
                      )}
                    </button>
                  )}

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput} checked={enableReminders} onChange={(e) => setEnableReminders(e.target.checked)} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span className={styles.formLabel} style={{ fontWeight: 600 }}>Enable Reminders</span>
                      </label>
                    </div>

                  {enableReminders && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '2.5rem' }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="reminderSubject">Reminder Subject</label>
                        <input type="text" id="reminderSubject" className={styles.input}
                          value={formData.emailSchedule.reminderSubject || ''}
                          onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderSubject: e.target.value } })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="reminderText">Reminder Text</label>
                        <textarea id="reminderText" className={styles.textarea} style={{ minHeight: '80px' }}
                          value={formData.emailSchedule.reminderText || ''}
                          onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderText: e.target.value } })} />
                      </div>
                      <div className={styles.row}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="reminderFrequency">Reminder Frequency</label>
                          <select id="reminderFrequency" className={styles.input}
                            value={formData.emailSchedule.reminderFrequency || 'daily'}
                            onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderFrequency: e.target.value } })}>
                            <option value="daily">Every day</option>
                            <option value="every_2_days">Every 2 days</option>
                            <option value="weekly">Every week</option>
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="reminderCount">Reminder Count</label>
                          <select id="reminderCount" className={styles.input}
                            value={formData.emailSchedule.reminderCount?.toString() || '3'}
                            onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderCount: e.target.value === 'unlimited' ? 999 : parseInt(e.target.value) } })}>
                            <option value="1">1</option>
                            <option value="3">3</option>
                            <option value="5">5</option>
                            <option value="999">Unlimited</option>
                          </select>
                        </div>
                      </div>
                      <label className={styles.switchWrapper}>
                        <input type="checkbox" className={styles.switchInput}
                          checked={formData.emailSchedule.stopRemindersWhenOpened ?? true}
                          onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, stopRemindersWhenOpened: e.target.checked } })} />
                        <div className={styles.switchTrack}>
                          <div className={styles.switchThumb} />
                        </div>
                        <span className={styles.formLabel}>Stop reminders when project is opened</span>
                      </label>
                      <button type="button" className={styles.btnSecondary} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                        Send Reminder Now
                      </button>
                    </div>
                  )}

                </div>

                {/* Right: Email Preview */}
                <div style={{ position: 'sticky', top: '1rem' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', fontSize: '0.82rem' }}>
                    <div style={{ padding: '0.6rem 1rem', background: '#e8ecf0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e' }} />
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '0.4rem', fontWeight: 600 }}>Email Preview</span>
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>Subject</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          {formData.emailSchedule.inviteSubject || 'Welcome to your onboarding session'}
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                        {(formData.emailSchedule.inviteBody || 'Hello {{listener_first_name}},\n\nYour interactive video presentation is ready!')
                          .replace('{{listener_first_name}}', (() => {
                            const l = listeners.find((x: any) => x.id === formData.listenerId)
                            return (l as any)?.firstName || (l as any)?.email?.split('@')[0] || 'Listener'
                          })())}
                      </div>
                      <div style={{ padding: '0.55rem 1rem', background: '#2563eb', borderRadius: '8px', color: '#fff', fontWeight: 600, textAlign: 'center', fontSize: '0.8rem' }}>
                        Open Presentation →
                      </div>
                    </div>
                  </div>
                  {scheduledDate && (
                    <div style={{ marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '0.76rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Sent {new Date(scheduledDate).toLocaleDateString('uk-UA')} {scheduledTime}
                    </div>
                  )}
                </div>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <button type="button" className={styles.btnSecondary} disabled={isGeneratingLinks} onClick={async () => {
                          if (!editingId) return
                          setIsGeneratingLinks(true)
                          try {
                            const updated = await generateEnrollmentLinks(editingId)
                            setEnrollmentLinks(updated)
                            showToast('Links successfully updated', 'success')
                          } catch (err: any) {
                            showToast(err.message || 'Failed to update links', 'error')
                          } finally {
                            setIsGeneratingLinks(false)
                          }
                        }}>
                          <RefreshCw size={14} style={{ marginRight: '0.25rem' }} /> {isGeneratingLinks ? 'Updating...' : 'Update All Links'}
                        </button>
                        <button type="button" className={styles.btnPrimary} disabled={isGeneratingLinks} onClick={async () => {
                          if (!editingId) return
                          setIsGeneratingLinks(true)
                          try {
                            const updated = await generateEnrollmentLinks(editingId)
                            setEnrollmentLinks(updated)
                            showToast('Links successfully generated', 'success')
                          } catch (err: any) {
                            showToast(err.message || 'Failed to generate links', 'error')
                          } finally {
                            setIsGeneratingLinks(false)
                          }
                        }}>
                          <LinkIcon size={14} style={{ marginRight: '0.25rem' }} /> {isGeneratingLinks ? 'Generating...' : 'Create Enrollment Links'}
                        </button>
                      </div>

                      <div className={styles.tableCard} style={{ overflowX: 'auto' }}>
                        <table className={styles.table} style={{ minWidth: '700px' }}>
                          <thead>
                            <tr>
                              <th>Groups / Listeners</th>
                              <th>Courses / Projects</th>
                              <th>Date Created</th>
                              <th>Link</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {enrollmentLinks.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                  No links generated yet. Click &quot;Create Enrollment Links&quot; to generate.
                                </td>
                              </tr>
                            ) : (
                              enrollmentLinks.map((l) => (
                                <tr key={l.id}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <div className={styles.listenerAvatar} style={{ backgroundColor: '#3b82f6', width: '24px', height: '24px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', borderRadius: '50%' }}>
                                        {(l.listenerName?.[0] || 'A').toUpperCase()}
                                      </div>
                                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{l.listenerName || 'Anonymous'}</span>
                                    </div>
                                  </td>
                                  <td><span style={{ fontSize: '0.85rem' }}>{l.projectTitle}</span></td>
                                  <td><span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(l.createdAt).toLocaleDateString()}</span></td>
                                  <td>
                                    <button type="button" className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(l.uniqueUrl); showToast('Link copied!', 'success'); }} style={{ padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6' }}>
                                      <span style={{ textDecoration: 'underline', fontSize: '0.82rem' }}>{l.uniqueUrl}</span>
                                    </button>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      <button type="button" className={styles.actionBtn} title="Copy Link" onClick={() => { navigator.clipboard.writeText(l.uniqueUrl); showToast('Link copied!', 'success'); }}><Copy size={14} /></button>
                                      <button type="button" className={styles.actionBtn} title="Open Link" onClick={() => window.open(l.uniqueUrl.startsWith('http') ? l.uniqueUrl : `https://${l.uniqueUrl}`, '_blank')}><ExternalLink size={14} /></button>
                                      <button type="button" className={styles.actionBtn} title="QR Code" onClick={() => setQrCodeModal({ isOpen: true, url: l.uniqueUrl.startsWith('http') ? l.uniqueUrl : `https://${l.uniqueUrl}`, title: l.listenerName || formData.title })}><QrCode size={14} /></button>
                                      <button type="button" className={styles.actionBtn} title="HTML Embed" onClick={() => setEmbedModal({ isOpen: true, url: l.uniqueUrl.startsWith('http') ? l.uniqueUrl : `https://${l.uniqueUrl}`, title: l.listenerName || formData.title })}><Code size={14} /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leadForm' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Lead form settings</div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <Info size={18} style={{ color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Note: If you don't mark any fields as required in your lead form, listener can skip it without completing.</span>
                  </div>
                  
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                    {[
                      { name: 'First Name', req: false },
                      { name: 'Last Name', req: false },
                      { name: 'Email', req: false },
                      { name: 'Phone', req: false },
                      { name: 'Company', req: false },
                      { name: 'Role', req: false },
                      { name: 'Country', req: false },
                      { name: 'Industry', req: false },
                    ].map((field) => (
                      <div key={field.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>{field.name}</span>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Required</span>
                          <div className={styles.switchWrapper} style={{ opacity: 0.5 }}>
                            <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button type="button" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', background: '#fff', border: '1px dashed #3b82f6', borderRadius: '8px', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                      + Add a field
                    </button>
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                    <label className={styles.formLabel}>Select the slide before which to show the data collection form</label>
                    <select className={styles.input}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="end">At the end</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Message</label>
                    <input type="text" className={styles.input} placeholder="To continue presentation please enter your data" />
                  </div>
                </div>
              )}

              {/* Tab 5: Advanced Options */}
              {activeTab === 'advanced' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Advanced Presentation Capabilities</div>

                  {[
                    'Show slide feed',
                    'Allow listener to share slides',
                    'Enable chat with listener',
                    'Allow comments',
                    'Allow to download original presentation file',
                    'Allow listener to call presenter',
                    'Allow listener to schedule meeting',
                    'Enable subtitles',
                    'Voice recognition',
                    'Send PDF report to email after each session',
                    'Send report on this link performance to email',
                    'Allow listeners to view presentation via link',
                    'Enable text chat Avatar with Listener',
                    'Enable text chat Presenter with Listener'
                  ].map((setting, idx, arr) => (
                    <div key={idx} style={{ padding: '0.75rem 0', borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>{setting}</span>
                          <Info size={14} style={{ color: '#94a3b8' }} />
                        </div>
                        <label className={styles.switchWrapper} style={{ opacity: 0.8, cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            className={styles.switchInput} 
                            checked={!!advancedSettings[setting]} 
                            onChange={() => toggleAdvancedSetting(setting)} 
                          />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                        </label>
                      </div>
                      {setting === 'Allow listener to call presenter' && (
                        <div style={{ marginTop: '0.75rem', paddingLeft: '1rem' }}>
                          <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Text for button</label>
                          <input type="text" className={styles.input} value="Call presenter" readOnly style={{ background: '#f8fafc' }} />
                        </div>
                      )}
                      {setting === 'Allow listener to schedule meeting' && (
                        <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div>
                            <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Link to calendar</label>
                            <input type="text" className={styles.input} placeholder="Link to calendar" />
                          </div>
                          <div>
                            <label className={styles.formLabel} style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Text for button</label>
                            <input type="text" className={styles.input} value="Schedule meeting" readOnly style={{ background: '#f8fafc' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div className={styles.formGroup}>
                      <input type="text" className={styles.input} placeholder="Presentation Link" />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <textarea className={styles.input} placeholder="Comment" style={{ minHeight: '80px', resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Language Settings */}
              {activeTab === 'languageSettings' && (
                <div className={styles.formCard}>
                  <div className={styles.formCardTitle}>Language Settings</div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Languages the avatar can respond in</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '42px', alignItems: 'center' }}>
                      {['Amharic', 'Bosnian', 'Azerbaijani'].map((lang) => (
                        <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#eff6ff', color: '#1e40af', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {lang} <X size={12} style={{ cursor: 'pointer' }} />
                        </div>
                      ))}
                      <input type="text" style={{ border: 'none', outline: 'none', flex: 1, minWidth: '100px', fontSize: '0.85rem' }} placeholder="Add language..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 7: Security & Verification */}
              {activeTab === 'security' && (
                <div className={styles.formCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', marginBottom: '0.25rem' }}>
                    <Shield size={20} style={{ color: '#2563eb' }} />
                    <span className={styles.formCardTitle} style={{ borderBottom: 'none', padding: 0, margin: 0 }}>Security & Verification</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Enable safeguards to verify the listener&apos;s identity and protect against fraud during the session.
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

              {/* Tab 8: Results */}
              {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className={styles.formCard}>
                    <div className={styles.formCardTitle}>Results Settings</div>

                    {/* Group 1: Recording & AI */}
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Recording &amp; AI</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsRecording} onChange={(e) => setResultsRecording(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Recording (enable video recording + request consent)</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Save screen or selfie video recording of the entire session.</div>
                          </div>
                        </label>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsGenerateSummary} onChange={(e) => setResultsGenerateSummary(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Generate AI Summary</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Leverage generative AI to summarize main questions and key takeaways.</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Group 2: Notifications */}
                    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Notifications</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsSendToListener} onChange={(e) => setResultsSendToListener(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Email results to Listener on completion</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Automatically trigger final completion scores and summaries directly to target watcher.</div>
                          </div>
                        </label>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsSendToPresenterListener} onChange={(e) => setResultsSendToPresenterListener(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Email results to Presenter per Listener</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Send personal session transcript and score logs to all presenters listed.</div>
                          </div>
                        </label>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsSendToPresenterGroup} onChange={(e) => setResultsSendToPresenterGroup(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Email aggregated report to Presenter after Group completes</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Deliver aggregated progress reports to instructors once cohort finishes.</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Group 3: Interactivity */}
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Interactivity</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsShowCorrectAnswer} onChange={(e) => setResultsShowCorrectAnswer(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Show correct answer after submission</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Let the listener see detailed feedback immediately upon completing questions.</div>
                          </div>
                        </label>
                        <label className={styles.switchWrapper}>
                          <input type="checkbox" className={styles.switchInput} checked={resultsAnswerLimitedTime} onChange={(e) => setResultsAnswerLimitedTime(e.target.checked)} />
                          <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Answer Limited Time</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Limit the timeframe allowed to solve or reply to interactive slides questions.</div>
                          </div>
                        </label>
                        {resultsAnswerLimitedTime && (
                          <div className={styles.formGroup} style={{ paddingLeft: '2.5rem', marginTop: '0.25rem' }}>
                            <label className={styles.formLabel} htmlFor="answerTimeLimit">Time limit per question (seconds)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="number" id="answerTimeLimit" className={styles.input}
                                min={5} max={600} step={5} style={{ maxWidth: '120px' }}
                                value={resultsAnswerTimeLimit}
                                onChange={(e) => setResultsAnswerTimeLimit(Number(e.target.value))}
                              />
                              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>sec</span>
                            </div>
                          </div>
                        )}
                      </div>
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

      {/* ── Custom Confirm Dialog ── */}
      {confirmDialog && (
        <div
          className={styles.wideModalOverlay}
          style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmDialog(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '12px', padding: '1.75rem',
              maxWidth: '400px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Confirm Deletion</h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button className={styles.btnSecondary} onClick={() => setConfirmDialog(null)}>Cancel</button>
              <button
                className={styles.btnPrimary}
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Preview Modal ── */}
      {qrModal.isOpen && (
        <div className={styles.wideModalOverlay} style={{ zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setQrCodeModal({ ...qrModal, isOpen: false })}>
          <div className={styles.modalContentWide} style={{ maxWidth: '400px', textAlign: 'center', height: 'auto', padding: '1.5rem', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ padding: '0 0 1rem 0' }}>
              <h3 className={styles.modalTitle}>QR Access Code</h3>
              <button className={styles.modalClose} onClick={() => setQrCodeModal({ ...qrModal, isOpen: false })}><X size={20} /></button>
            </div>
            <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <QRCodeCanvas ref={qrCanvasRef} value={qrModal.url} size={200} level="H" includeMargin={true} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{qrModal.title || 'Enrollment Access'}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', wordBreak: 'break-all' }}>{qrModal.url}</div>
              </div>
              <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => {
                const canvas = qrCanvasRef.current
                if (canvas) {
                  const url = canvas.toDataURL('image/png')
                  const link = document.createElement('a')
                  link.download = `qr-code-${qrModal.title.replace(/\s+/g, '-').toLowerCase()}.png`
                  link.href = url
                  link.click()
                  showToast('QR Code downloaded', 'success')
                }
              }}>
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      <LinkReadyModal
        isOpen={shareLinkModal.isOpen}
        onClose={() => setShareLinkModal({ ...shareLinkModal, isOpen: false })}
        linkUrl={shareLinkModal.url}
      />

      <OverageModal
        isOpen={isOverageModalOpen}
        onClose={() => setIsOverageModalOpen(false)}
      />

      {embedModal.isOpen && (
        <div className={styles.wideModalOverlay} style={{ zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEmbedModal({ ...embedModal, isOpen: false })}>
          <div className={styles.modalContentWide} style={{ maxWidth: '500px', height: 'auto', padding: '1.5rem', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ padding: '0 0 1rem 0' }}>
              <h3 className={styles.modalTitle}>HTML Embed Frame Code</h3>
              <button className={styles.modalClose} onClick={() => setEmbedModal({ ...embedModal, isOpen: false })}><X size={20} /></button>
            </div>
            <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
                Copy the HTML code snippet below to embed this secure interactive presentation onto your own website or portal:
              </p>
              <textarea
                readOnly
                className={styles.textarea}
                style={{ fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '100px', background: '#f8fafc' }}
                value={`<iframe src="${embedModal.url.startsWith('http') ? embedModal.url : `https://${embedModal.url}`}" width="100%" height="600px" frameborder="0" allowfullscreen allow="microphone; camera"></iframe>`}
              />
              <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => {
                const iframeCode = `<iframe src="${embedModal.url.startsWith('http') ? embedModal.url : `https://${embedModal.url}`}" width="100%" height="600px" frameborder="0" allowfullscreen allow="microphone; camera"></iframe>`
                navigator.clipboard.writeText(iframeCode)
                showToast('HTML embed code copied!', 'success')
                setEmbedModal({ ...embedModal, isOpen: false })
              }}>
                Copy HTML Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Preview Modal ── */}
      {previewEmailOpen && (
        <div className={styles.wideModalOverlay} style={{ zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewEmailOpen(false)}>
          <div className={styles.modalContentWide} style={{ maxWidth: '600px', minHeight: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Email Preview</h2>
              <button className={styles.closeBtn} onClick={() => setPreviewEmailOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.modalBody} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Subject:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                    {formData.emailSchedule.inviteSubject || 'No Subject'}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'system-ui, sans-serif' }}>
                  {formData.emailSchedule.inviteBody
                    .replace(/{{listener_first_name}}/g, listeners.find(l => l.id === formData.listenerId)?.firstName || 'John')
                    .replace(/{{listener_last_name}}/g, listeners.find(l => l.id === formData.listenerId)?.lastName || 'Doe')
                    .replace(/{{listener_second_name}}/g, listeners.find(l => l.id === formData.listenerId)?.lastName || 'Doe')
                    .replace(/{{listener_company}}/g, 'Acme Corp')
                    .replace(/{{presenter_first_name}}/g, 'Jane')
                    .replace(/{{presenter_last_name}}/g, 'Smith')
                    .replace(/{{presentation_title}}/g, projects.find(p => p.id === formData.projectId)?.title || 'Interactive Presentation')
                    .replace(/{{course_name}}/g, courses.find(c => c.id === formData.projectId)?.name || 'Onboarding & Training Course')
                    .replace(/{{presentation_link}}/g, 'https://pitch-avatar.com/v/enroll-example')
                    .replace(/{{avatar_name}}/g, 'AI Assistant')
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Create Listener Modal ── */}
      {isCreateListenerOpen && (
        <div className={styles.wideModalOverlay} style={{ zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsCreateListenerOpen(false)}>
          <div className={styles.modalContentWide} style={{ maxWidth: '640px', padding: 0, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Listener</h2>
              <button type="button" className={styles.closeBtn} onClick={() => setIsCreateListenerOpen(false)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', backgroundColor: '#f8fafc', padding: '0.25rem 0.75rem 0', gap: '0.25rem' }}>
              <button className={styles.btnSecondary} style={{ background: 'none', border: 'none', borderBottom: '2px solid var(--primary)', color: 'var(--primary)', borderRadius: '0', padding: '0.65rem 0.85rem', fontWeight: 600, fontSize: '0.82rem' }}>
                <Edit3 size={13} style={{ marginRight: '0.4rem' }} /> Edit Profile
              </button>
            </div>

            <form onSubmit={handleQuickCreateListener} className={styles.modalBody} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '0 0 16px 16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

              <div className={styles.formCard}>
                <h3 className={styles.formCardTitle}>Listener Details</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-firstName">First Name</label>
                    <input type="text" id="ql-firstName" className={styles.input} placeholder="John"
                      value={newListenerForm.firstName} onChange={e => setNewListenerForm({ ...newListenerForm, firstName: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-lastName">Last Name</label>
                    <input type="text" id="ql-lastName" className={styles.input} placeholder="Doe"
                      value={newListenerForm.lastName} onChange={e => setNewListenerForm({ ...newListenerForm, lastName: e.target.value })} />
                  </div>
                  <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                    <label className={styles.formLabel} htmlFor="ql-email">Email <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" id="ql-email" className={styles.input} required placeholder="name@company.com"
                      value={newListenerForm.email} onChange={e => setNewListenerForm({ ...newListenerForm, email: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-company">Company</label>
                    <input type="text" id="ql-company" className={styles.input} placeholder="Acme Corp"
                      value={newListenerForm.company} onChange={e => setNewListenerForm({ ...newListenerForm, company: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-industry">Industry</label>
                    <input type="text" id="ql-industry" className={styles.input} placeholder="Software"
                      value={newListenerForm.industry} onChange={e => setNewListenerForm({ ...newListenerForm, industry: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-position">Position</label>
                    <input type="text" id="ql-position" className={styles.input} placeholder="Lead Designer"
                      value={newListenerForm.position} onChange={e => setNewListenerForm({ ...newListenerForm, position: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-linkedin">LinkedIn</label>
                    <input type="text" id="ql-linkedin" className={styles.input} placeholder="https://linkedin.com/in/username"
                      value={newListenerForm.linkedin} onChange={e => setNewListenerForm({ ...newListenerForm, linkedin: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-country">Country</label>
                    <input type="text" id="ql-country" className={styles.input} placeholder="e.g. USA, Germany, Ukraine"
                      value={newListenerForm.country} onChange={e => setNewListenerForm({ ...newListenerForm, country: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-department">Department</label>
                    <input type="text" id="ql-department" className={styles.input} placeholder="e.g. Engineering, Sales, HR"
                      value={newListenerForm.department} onChange={e => setNewListenerForm({ ...newListenerForm, department: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="ql-language">Language</label>
                    <select id="ql-language" className={styles.input} value={newListenerForm.language}
                      onChange={e => setNewListenerForm({ ...newListenerForm, language: e.target.value })}>
                      <option value="en">English</option>
                      <option value="pl">Polish</option>
                      <option value="de">German</option>
                      <option value="fr">French</option>
                      <option value="sv">Swedish</option>
                      <option value="ru">Russian</option>
                      <option value="uk">Ukrainian</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formCard}>
                <h3 className={styles.formCardTitle}>Documents</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Save the listener first to upload documents.</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)', position: 'sticky', bottom: '-1.5rem', margin: '0 -1.5rem -1.5rem -1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsCreateListenerOpen(false)} disabled={isCreatingListener}>Cancel</button>
                <button type="submit" className={styles.btnPrimary} disabled={isCreatingListener}>
                  {isCreatingListener ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
