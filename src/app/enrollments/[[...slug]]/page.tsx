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
  const activeSkinDomain = useUIStore((state) => state.activeSkinDomain)
  const isHRSkin = activeSkinDomain === 'hr.localhost:3000'

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
        // Quota check removed
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
    <div className={isExpanded ? styles.containerExpanded : styles.container} style={{ background: isOpen ? '#f8fafc' : undefined, minHeight: '100vh' }}>
      {!isOpen ? (
        <>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>{isHRSkin ? 'Enrollments' : 'Links & Enrollments'}</h1>
          <p className={styles.subtitle}>
            {isHRSkin 
              ? 'Link presentation projects to listeners, schedule reminders, and track status.' 
              : 'Anonymous links and targeted enrollments across all projects'}
          </p>
        </div>
        <div className={styles.headerActions}>
          {!isHRSkin && (
            <button className={styles.btnSecondary} onClick={() => {
              const baseDomain = typeof window !== 'undefined' ? window.location.origin : 'https://pitch-avatar.com';
              const randomId = Math.random().toString(36).substring(2, 10);
              setShareLinkModal({ isOpen: true, url: `${baseDomain}/v/enroll-${randomId}` });
            }} aria-label="Create link" style={{ borderRadius: '20px' }}>
              <LinkIcon size={16} /> Create link
            </button>
          )}
          <button className={styles.btnPrimary} onClick={() => handleOpenCreate()} aria-label="Create Enrollment" style={{ borderRadius: '20px' }}>
            <Plus size={16} /> {isHRSkin ? 'Create Enrollment' : 'New enrollment'}
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ gap: '0.75rem', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>Completed</span>
            <Info size={14} style={{ color: '#94a3b8' }} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', lineHeight: '1' }}>
            {stats.completedCount}
          </span>
        </div>
        
        <div className="card" style={{ gap: '0.75rem', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>Total unique Listeners</span>
            <Info size={14} style={{ color: '#94a3b8' }} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', lineHeight: '1' }}>
            {stats.uniqueListeners}
          </span>
        </div>
        
        <div className="card" style={{ gap: '0.75rem', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>Completion Rate</span>
            <Info size={14} style={{ color: '#94a3b8' }} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', lineHeight: '1' }}>
            {stats.completionRate}%
          </span>
        </div>

        {quotaLoaded && quota && (
          <div 
            className="card" 
            style={{ cursor: 'pointer', gap: '0.75rem', padding: '1rem 1.25rem', border: quota.activeCount >= quota.maxSeats ? '1px solid #facc15' : '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
            onClick={() => { window.location.href = '/plans' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>Enrollments {quota.activeCount}/{quota.maxSeats}</span>
              <Info size={14} style={{ color: '#94a3b8' }} />
            </div>
            <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '0.25rem' }}>
              <div style={{ 
                width: `${Math.min(100, (quota.activeCount / Math.max(1, quota.maxSeats)) * 100)}%`, 
                height: '100%', 
                background: quota.activeCount >= quota.maxSeats ? '#ef4444' : '#3b82f6',
                borderRadius: '4px'
              }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {quota.activeCount >= quota.maxSeats 
                ? `Only 0 seat left. Buy more →` 
                : `Only ${quota.maxSeats - quota.activeCount} seat left. Buy more →`}
            </span>
          </div>
        )}
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

              </>
      ) : (
        <div className={styles.fullPageContainer}>
          <div className={styles.fullPageBreadcrumb}>
            Enrollments / {editingId ? 'Edit enrollment' : 'New enrollment'} / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()} / Target type — {formData.targetType === 'anonymous' ? 'Global shared link' : 'Listener (Personalized Link)'}
          </div>
          
          <div className={styles.fullPageCard}>
             <button className={styles.modalClose} onClick={closeModal} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
             
             <div className={styles.fullPageHeader}>
               <h1 className={styles.fullPageTitle}>{editingId ? 'Edit Enrollment' : 'Add Enrollment'}</h1>
               <p className={styles.fullPageSubtitle}>Set up a new enrollment: pick who's enrolled, link a project, and configure access</p>
             </div>
             
             <div className={styles.tabsHeaderPill}>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'general' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('general')}>General</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'invitations' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('invitations')}>Invitation and Reminders</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'links' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('links')}>Links</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'leadForm' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('leadForm')}>Lead form</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'advanced' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('advanced')}>Advanced</button>
                <button type="button" className={`${styles.tabPill} ${activeTab === 'languageSettings' ? styles.tabPillActive : ''}`} onClick={() => setActiveTab('languageSettings')}>Language settings</button>
             </div>
             
             <form id="enrollment-form" onSubmit={handleSave} className={styles.fullPageFormBody}>
                {/* Tab 1: General */}
                {activeTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
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

                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Identity</div>
                        <div className={styles.formSectionDesc}>Basic information about this enrollment</div>
                      </div>
                      <div className={styles.formSectionRight}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel} htmlFor="title">Title (shown to listener) *</label>
                          <input type="text" id="title" className={styles.input} required
                            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Content & Target</div>
                        <div className={styles.formSectionDesc}>What is being shared and with whom</div>
                      </div>
                      <div className={styles.formSectionRight}>
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
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Notifications</div>
                        <div className={styles.formSectionDesc}>Who gets informed when a listener completes this enrollment</div>
                      </div>
                      <div className={styles.formSectionRight}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Presenter(s)</label>
                          <div className={styles.tagList}>
                            {presenters.map((p, i) => (
                              <span key={i} className={styles.removableTag}>
                                {p}
                                <button type="button" onClick={() => removePresenter(p)}><X size={12} /></button>
                              </span>
                            ))}
                            <input
                              type="email"
                              className={styles.input}
                              placeholder="Add email and press Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addPresenter(e.currentTarget.value)
                                  e.currentTarget.value = ''
                                }
                              }}
                              style={{ flex: 1, minWidth: '200px', border: 'none', boxShadow: 'none', padding: '0.25rem' }}
                            />
                          </div>
                          <p className={styles.helperText}>These email addresses will receive session transcripts and results notifications.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Scheduling</div>
                        <div className={styles.formSectionDesc}>When it runs and how listener can book</div>
                      </div>
                      <div className={styles.formSectionRight}>
                         {/* We omit this implementation to keep it simple, but we can add dummy inputs based on the screenshot */}
                         <div className={styles.formGroup}>
                           <label className={styles.formLabel}>Link to calendar</label>
                           <input type="text" className={styles.input} placeholder="https://meetings.hubspot.com/your-handle" />
                         </div>
                         <div className={styles.row}>
                           <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Start date</label>
                             <input type="date" className={styles.input} />
                           </div>
                           <div className={styles.formGroup}>
                             <label className={styles.formLabel}>Status</label>
                             <select className={styles.input}>
                               <option>In progress</option>
                             </select>
                           </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className={styles.formSectionRow}>
                      <div className={styles.formSectionLeft}>
                        <div className={styles.formSectionTitle}>Options</div>
                        <div className={styles.formSectionDesc}>Extra behavior for this enrollment</div>
                      </div>
                      <div className={styles.formSectionRight}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                             <input type="checkbox" style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} defaultChecked />
                             Don't send notifications when listener opens enrollment
                           </label>
                           <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155' }}>
                             <input type="checkbox" style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                             Choice at the beginning: book calendar OR start avatar now
                           </label>
                         </div>
                      </div>
                    </div>

                  </div>
                )}
                
                

                <div className={styles.formFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancel</button>
                  <button type="submit" className={styles.btnPrimary}>
                    {editingId ? 'Save Changes' : 'Create Enrollment'}
                  </button>
                </div>
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
