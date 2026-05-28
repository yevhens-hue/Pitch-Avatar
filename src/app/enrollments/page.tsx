'use client'

import React, { useState, useEffect, useTransition } from 'react'
import styles from './Enrollments.module.css'
import {
  ClipboardList, Search, Plus, Trash2, Edit3, Calendar,
  ChevronLeft, ChevronRight, Link as LinkIcon, X, Languages,
  Clock, BookOpen, UserCheck, AlertTriangle, QrCode,
  LayoutGrid, Table2, CheckCircle,
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

  // Filters
  const [search, setSearch] = useState('')
  const [showGroups, setShowGroups] = useState(false)
  const [showCourses, setShowCourses] = useState(false)

  // Drawer state
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'invitations' | 'links' | 'results'>('general')
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
    setQuotaExceeded(false); setActiveTab('general'); setIsOpen(true)
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
    setQuotaExceeded(false); setActiveTab('general'); setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.targetType === 'Listener' && !formData.listenerId) {
      showToast('Please select a Listener', 'error'); return
    }
    if (!formData.projectId) { showToast('Please select a Project', 'error'); return }

    try {
      if (editingId) {
        await updateEnrollment(editingId, {
          title: formData.title, status: formData.status,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: { ...formData.emailSchedule, results: formData.results },
        })
        showToast('Enrollment updated', 'success')
      } else {
        if (quotaExceeded) { showToast('Seats limit exceeded', 'error'); return }
        await createEnrollment({
          title: formData.title,
          listenerId: formData.targetType === 'Listener' ? formData.listenerId : null,
          projectId: formData.projectId, status: formData.status,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: formData.emailSchedule,
        })
        showToast('Enrollment assigned!', 'success')
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

  // ── Status badge helper ───────────────────────────────────────────────────────
  const getStatusClass = (status: Enrollment['status']) => {
    if (status === 'In Progress') return styles.statusInProgress
    if (status === 'Completed')   return styles.statusCompleted
    if (status === 'Failed')      return styles.statusFailed
    return styles.statusPending
  }

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filteredEnrollments = search
    ? enrollments.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.listenerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.projectTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        e.status.toLowerCase().includes(search.toLowerCase())
      )
    : enrollments

  return (
    <div className={styles.container}>

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
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Create enrollment">
            <Plus size={16} /> Share / Assign
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
              placeholder="Search by project, listener, status…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              aria-label="Search enrollments"
            />
          </div>
          <div className={styles.togglesGroup}>
            <label className={styles.toggleLabel}>
              <input type="checkbox" className={styles.toggleInput} checked={showGroups} onChange={(e) => setShowGroups(e.target.checked)} />
              Listener Groups
            </label>
            <label className={styles.toggleLabel}>
              <input type="checkbox" className={styles.toggleInput} checked={showCourses} onChange={(e) => setShowCourses(e.target.checked)} />
              Course Sequences
            </label>
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
                  <th>Project / Courses</th>
                  <th>Listener / Group</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Reminders</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isPending ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</td></tr>
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
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.urlText}>…/enroll-{enrollment.id.slice(0, 8)}</span>
                          <span className={styles.projectTitle}>{enrollment.projectTitle || 'Loading…'}</span>
                          {showCourses && (
                            <span className={styles.courseTag}><BookOpen size={10} /> Course: Onboarding Essentials</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {enrollment.listenerId ? (
                            <>
                              <div className={styles.listenerAvatar} style={getAvatarStyle(enrollment.listenerEmail || enrollment.id)}>
                                {(enrollment.listenerName?.[0] || 'L').toUpperCase()}
                              </div>
                              <div className={styles.nameCell}>
                                <span className={styles.listenerName}>{enrollment.listenerName || 'Listener'}</span>
                                <span className={styles.listenerEmail}>{enrollment.listenerEmail}</span>
                                {showGroups && (
                                  <span className={styles.groupTag}><UserCheck size={10} /> Group: Q1 Cohort</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontStyle: 'italic' }}>Anonymous Access</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span style={{ fontSize: '0.85rem' }}>
                            {enrollment.startDate ? enrollment.startDate.split('T')[0] : 'Immediate'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {enrollment.emailSchedule?.sendInvite ? (
                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 500 }}>✓ Invite configured</span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>No invite</span>
                          )}
                          {enrollment.emailSchedule?.sendReminders && (
                            <span style={{ fontSize: '0.7rem', color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Clock size={10} /> {enrollment.emailSchedule.reminderFrequency}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button className={styles.actionBtn} onClick={() => handleCopyLink(enrollment.id)} title="Copy link" aria-label="Copy link"><LinkIcon size={14} /></button>
                          <button className={styles.actionBtn} onClick={() => handleOpenEdit(enrollment)} title="Edit" aria-label="Edit"><Edit3 size={14} /></button>
                          <button className={styles.actionBtn} onClick={() => handleOpenManual(enrollment)} title="Manual override" aria-label="Manual override">✏️</button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(enrollment.id)} title="Delete" aria-label="Delete"><Trash2 size={14} /></button>
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

      {/* ── Side Drawer ── */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{editingId ? 'Edit Enrollment' : 'Share & Assign'}</h2>
                <p className={styles.modalSub}>{formData.title}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setIsOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>

            <div className={styles.tabsHeader}>
              <button className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`} onClick={() => setActiveTab('general')}>⚙️ General</button>
              <button className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`} onClick={() => setActiveTab('invitations')}>📧 Invitations</button>
              <button
                className={`${styles.tab} ${activeTab === 'links' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('links')}
                disabled={!editingId}
                style={{ opacity: editingId ? 1 : 0.5, cursor: editingId ? 'pointer' : 'not-allowed' }}
              >
                🔗 Links
              </button>
              <button className={`${styles.tab} ${activeTab === 'results' ? styles.tabActive : ''}`} onClick={() => setActiveTab('results')}>📊 Results</button>
            </div>

            <form id="enrollment-form" onSubmit={handleSave} className={styles.modalBody}>
              {activeTab === 'general' && (
                <>
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
                    <label className={styles.formLabel} htmlFor="title">Enrollment Reference</label>
                    <input type="text" id="title" className={styles.input} required
                      value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="targetType">Target Recipient</label>
                    <select id="targetType" className={styles.input} value={formData.targetType}
                      onChange={(e) => setFormData({ ...formData, targetType: e.target.value as typeof formData.targetType })}>
                      <option value="Listener">Individual Listener (Personalized Link)</option>
                      <option value="Anonymous">Anonymous Access (Shared Link)</option>
                      <option value="Group" disabled>Cohort Group (Sprint 2)</option>
                    </select>
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
                </>
              )}

              {activeTab === 'invitations' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" className={styles.toggleInput}
                        checked={formData.emailSchedule.sendInvite}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, sendInvite: e.target.checked } })} />
                      Send automated email invitation
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" className={styles.toggleInput}
                        checked={formData.emailSchedule.sendReminders}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, sendReminders: e.target.checked } })} />
                      Send reminders if not opened
                    </label>
                  </div>

                  {formData.emailSchedule.sendReminders && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="reminderFrequency">Reminder Frequency</label>
                      <select id="reminderFrequency" className={styles.input}
                        value={formData.emailSchedule.reminderFrequency}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, reminderFrequency: e.target.value } })}>
                        <option value="daily">Daily (max 3 times)</option>
                        <option value="weekly">Weekly (max 3 times)</option>
                        <option value="custom">Every 3 days (max 3 times)</option>
                      </select>
                    </div>
                  )}

                  {formData.emailSchedule.sendInvite && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="inviteSubject">Email Subject</label>
                        <input type="text" id="inviteSubject" className={styles.input}
                          value={formData.emailSchedule.inviteSubject}
                          onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, inviteSubject: e.target.value } })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="inviteBody">Email Body (supports {'{{listener_first_name}}'} and {'{{avatar_name}}'})</label>
                        <textarea id="inviteBody" className={styles.textarea}
                          value={formData.emailSchedule.inviteBody}
                          onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, inviteBody: e.target.value } })} />
                      </div>
                    </>
                  )}

                  <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <label className={styles.toggleLabel} style={{ color: '#166534' }}>
                      <input type="checkbox" className={styles.toggleInput}
                        checked={formData.emailSchedule.translateToListenerLang}
                        onChange={(e) => setFormData({ ...formData, emailSchedule: { ...formData.emailSchedule, translateToListenerLang: e.target.checked } })} />
                      <Languages size={14} style={{ marginRight: '0.2rem' }} />
                      Auto-translate to Listener's language
                    </label>
                    <p style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                      Translates slides and voice into the language set in the listener's profile.
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'results' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Configure what data is collected and reported after this enrollment session completes.
                  </p>
                  {([
                    { key: 'recording',              label: 'Session Recording',           desc: 'Save a screen/voice recording of the entire session', icon: '🎥' },
                    { key: 'sendResultsToListener',  label: 'Send Results to Listener',    desc: 'Email a summary report to the listener after completion', icon: '📤' },
                    { key: 'sendResultsToPresenter', label: 'Notify Presenter',            desc: 'Notify the assigned presenter about session outcome and score', icon: '📋' },
                    { key: 'generateSummary',        label: 'Generate AI Summary',         desc: 'LLM generates a concise Q&A summary with key insights', icon: '🧠' },
                    { key: 'answerLimitedTime',      label: 'Limited Answer Time',         desc: 'Listener must respond to each question within a time limit', icon: '⏱' },
                  ] as { key: keyof typeof formData.results; label: string; desc: string; icon: string }[]).map(({ key, label, desc, icon }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border-light)', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.15rem' }}>
                          <span>{icon}</span> {label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.results[key] as boolean}
                        onChange={e => setFormData({ ...formData, results: { ...formData.results, [key]: e.target.checked } })}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0, marginTop: '0.1rem' }}
                        aria-label={label}
                      />
                    </div>
                  ))}

                  {/* Custom Results Metrics */}
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Custom Results Metrics</span>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', gap: '0.25rem' }}
                        onClick={() => setShowMetricDropdown(v => !v)}
                      >
                        + Add result
                      </button>
                    </div>
                    {showMetricDropdown && (
                      <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 8, padding: '0.4rem', marginBottom: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
                        {METRICS_CATALOG.filter(m => !formData.results.customMetrics.includes(m)).map(metric => (
                          <button key={metric} type="button"
                            onClick={() => { setFormData({ ...formData, results: { ...formData.results, customMetrics: [...formData.results.customMetrics, metric] } }); setShowMetricDropdown(false) }}
                            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 0.6rem', fontSize: '0.82rem', color: '#334155', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 4 }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                          >
                            {metric}
                          </button>
                        ))}
                      </div>
                    )}
                    {formData.results.customMetrics.length === 0 ? (
                      <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>No custom metrics added. Click "+ Add result" to select from catalog.</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {formData.results.customMetrics.map(metric => (
                          <span key={metric} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(99,102,241,.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600 }}>
                            {metric}
                            <button type="button"
                              onClick={() => setFormData({ ...formData, results: { ...formData.results, customMetrics: formData.results.customMetrics.filter(m => m !== metric) } })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: '0.9rem', lineHeight: 1 }}
                              aria-label={`Remove ${metric}`}
                            >×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: '0.25rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => {
                        const current = editingId ? enrollments.find(e => e.id === editingId) : null
                        if (current) handleOpenManual(current)
                      }}
                      disabled={!editingId}
                    >
                      ✏️ Enter Results Manually (Override)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'links' && editingId && (
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

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendInviteNow}>
                      📧 Send Invite Now
                    </button>
                    <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendReminderNow}>
                      ⏰ Send Reminder Now
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
              {activeTab !== 'links' && (
                <button type="submit" form="enrollment-form" className={styles.btnPrimary} disabled={quotaExceeded && !editingId}>
                  {editingId ? 'Save Changes' : 'Create Enrollment'}
                </button>
              )}
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
