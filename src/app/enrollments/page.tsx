'use client'

import React, { useState, useEffect, useTransition } from 'react'
import styles from './Enrollments.module.css'
import {
  ClipboardList,
  Search,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  UploadCloud,
  Link as LinkIcon,
  X,
  Languages,
  Clock,
  BookOpen,
  UserCheck,
  AlertTriangle,
  QrCode,
  Code
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  manualEnterResult,
  getSeatsQuota
} from '@/app/actions/enrollments'
import { getListeners } from '@/app/actions/listeners'
import { getProjects } from '@/app/actions/projects'
import { Enrollment, Listener, ListenerSeat } from '@/types/listeners'
import { Project } from '@/types'

const emptyFormState = {
  title: '',
  targetType: 'Listener' as 'Anonymous' | 'Listener' | 'Group',
  listenerId: '',
  contentType: 'Project' as 'Project' | 'Course',
  projectId: '',
  status: 'Pending' as 'Pending' | 'In Progress' | 'Completed' | 'Failed',
  startDate: '',
  emailSchedule: {
    sendInvite: true,
    sendReminders: true,
    reminderFrequency: 'daily',
    inviteSubject: 'Welcome to your onboarding training session',
    inviteBody: 'Hello {{listener_first_name}},\n\nYour interactive video presentation is ready! Your onboarding AI assistant avatar {{avatar_name}} is waiting to help. Please use the link below to get started.',
    translateToListenerLang: true
  }
}

export default function EnrollmentsDashboard() {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // State lists
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [listeners, setListeners] = useState<Listener[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [quota, setQuota] = useState<ListenerSeat | null>(null)

  // Filter states
  const [search, setSearch] = useState('')
  const [showGroups, setShowGroups] = useState(false)
  const [showCourses, setShowCourses] = useState(false)

  // Drawer / modals state
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'invitations' | 'links'>('general')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyFormState)

  // Manual override modal state
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [manualId, setManualId] = useState<string | null>(null)
  const [manualStatus, setManualStatus] = useState<'Completed' | 'Failed'>('Completed')
  const [manualDate, setManualDate] = useState('')

  // Quota alerts simulation
  const [quotaExceeded, setQuotaExceeded] = useState(false)

  // Load database entities
  const loadData = () => {
    startTransition(async () => {
      try {
        // Fetch enrollments
        const results = await getEnrollments(search)
        setEnrollments(results)

        // Fetch active seat limits
        const seats = await getSeatsQuota()
        setQuota(seats)

        // Fetch listeners for target selector
        const lRes = await getListeners('', 1, 100)
        setListeners(lRes.data)

        // Fetch projects for content selector
        const pRes = await getProjects()
        setProjects(pRes)
      } catch (err) {
        showToast('Failed to load dashboard data', 'error')
      }
    })
  }

  useEffect(() => {
    loadData()
  }, [search])

  // Check quota dynamically when filling the drawer
  useEffect(() => {
    if (quota && formData.listenerId) {
      // Find if this listener is already in active enrollments
      const isAlreadyActive = enrollments.some(
        e => e.listenerId === formData.listenerId && (e.status === 'Pending' || e.status === 'In Progress')
      )
      if (!isAlreadyActive && quota.activeCount >= quota.maxSeats) {
        setQuotaExceeded(true)
      } else {
        setQuotaExceeded(false)
      }
    } else {
      setQuotaExceeded(false)
    }
  }, [formData.listenerId, quota, enrollments])

  // Open Create Form Drawer
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      ...emptyFormState,
      title: `Enrollment-${Date.now().toString().slice(-6)}`,
      projectId: projects[0]?.id || '',
      listenerId: listeners[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0]
    })
    setQuotaExceeded(false)
    setActiveTab('general')
    setIsOpen(true)
  }

  // Open Edit Form Drawer
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
        inviteSubject: enrollment.emailSchedule?.inviteSubject ?? 'Welcome to your onboarding training session',
        inviteBody: enrollment.emailSchedule?.inviteBody ?? 'Hello {{listener_first_name}},\n\nYour interactive video presentation is ready! Your onboarding AI assistant avatar {{avatar_name}} is waiting to help. Please use the link below to get started.',
        translateToListenerLang: enrollment.emailSchedule?.translateToListenerLang ?? true
      }
    })
    setQuotaExceeded(false)
    setActiveTab('general')
    setIsOpen(true)
  }

  // Save Enrollment (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.targetType === 'Listener' && !formData.listenerId) {
      showToast('Please select a Listener', 'error')
      return
    }
    if (!formData.projectId) {
      showToast('Please select a Project content', 'error')
      return
    }

    try {
      if (editingId) {
        await updateEnrollment(editingId, {
          title: formData.title,
          status: formData.status,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: formData.emailSchedule
        })
        showToast('Enrollment updated successfully', 'success')
      } else {
        if (quotaExceeded) {
          showToast('Seats limit exceeded. You cannot add new active listeners.', 'error')
          return
        }
        await createEnrollment({
          title: formData.title,
          listenerId: formData.targetType === 'Listener' ? formData.listenerId : null,
          projectId: formData.projectId,
          status: formData.status,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          emailSchedule: formData.emailSchedule
        })
        showToast('Enrollment successfully assigned!', 'success')
      }
      setIsOpen(false)
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to save enrollment', 'error')
    }
  }

  // Delete Enrollment
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this enrollment assignment? Link redirects will stop immediately.')) return
    try {
      await deleteEnrollment(id)
      showToast('Enrollment deleted successfully', 'success')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete enrollment', 'error')
    }
  }

  // Manual Override modal actions
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
      showToast('Enrollment results updated manually!', 'success')
      setIsManualOpen(false)
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to override results', 'error')
    }
  }

  // Copy Link action
  const handleCopyLink = (id: string) => {
    const url = `pitch-avatar.com/v/enroll-${id.slice(0, 8)}`
    navigator.clipboard.writeText(`https://${url}`)
    showToast('Enrollment web link copied to clipboard!', 'success')
  }

  // Simulator actions for notifications sending
  const handleSendInviteNow = () => {
    showToast('Onboarding Invitation email successfully sent to listener!', 'success')
  }

  const handleSendReminderNow = () => {
    showToast('Active reminder email successfully sent to listener inbox!', 'success')
  }

  const handleUpdateWebLink = () => {
    showToast('Web link successfully re-synchronized with latest presentation edits!', 'success')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Enrollments</h1>
          <p className={styles.subtitle}>Link presentation projects to listeners, schedule onboarding reminders, and view status.</p>
        </div>
        <div className={styles.headerActions}>
          {quota && (
            <div className={styles.quotaProgressCard} style={{ marginRight: '1rem', minWidth: '180px', padding: '0.4rem 0.8rem' }}>
              <div className={styles.quotaHeader} style={{ fontSize: '0.75rem' }}>
                <span>Active Seats: {quota.activeCount} / {quota.maxSeats}</span>
              </div>
              <div className={styles.progressBar} style={{ height: '6px' }}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(quota.activeCount / quota.maxSeats) * 100}%` }}
                />
              </div>
            </div>
          )}
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Assign project to listener">
            <Plus size={16} /> Share / Assign
          </button>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.searchAndToggles}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by project, listener email, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search enrollments"
            />
          </div>
          <div className={styles.togglesGroup}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={showGroups}
                onChange={(e) => setShowGroups(e.target.checked)}
              />
              Show Listeners in Groups
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={showCourses}
                onChange={(e) => setShowCourses(e.target.checked)}
              />
              Show Projects in Courses
            </label>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        {enrollments.length === 0 && !isPending ? (
          <div className={styles.emptyState}>
            <ClipboardList size={48} style={{ color: '#cbd5e1' }} />
            <h3 className={styles.emptyStateTitle}>No enrollments found</h3>
            <p className={styles.emptyStateDesc}>Establish personalized web links for candidates, attach courses, and configure auto-translations.</p>
            <button className={styles.btnPrimary} onClick={handleOpenCreate}>
              <Plus size={16} /> Create First Enrollment
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project / Courses</th>
                <th>Listener / Group</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Reminder Schedule</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading enrollments list...
                  </td>
                </tr>
              ) : (
                enrollments.map((enrollment) => {
                  let badgeClass = styles.statusPending
                  if (enrollment.status === 'In Progress') badgeClass = styles.statusInProgress
                  if (enrollment.status === 'Completed') badgeClass = styles.statusCompleted
                  if (enrollment.status === 'Failed') badgeClass = styles.statusFailed

                  return (
                    <tr key={enrollment.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.urlText}>pitch-avatar.com/v/enroll-{enrollment.id.slice(0, 8)}</span>
                          <span className={styles.projectTitle}>{enrollment.projectTitle || 'Loading...'}</span>
                          {showCourses && (
                            <span className={styles.courseTag}>
                              <BookOpen size={10} /> Course: Onboarding Essentials
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.nameCell}>
                          <span className={styles.listenerName}>{enrollment.listenerName}</span>
                          <span className={styles.listenerEmail}>{enrollment.listenerEmail}</span>
                          {showGroups && enrollment.listenerId && (
                            <span className={styles.groupTag}>
                              <UserCheck size={10} /> Group: Q1 Recruiting Cohort
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${badgeClass}`}>
                          {enrollment.status === 'In Progress' ? 'In Progress' : enrollment.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span>{enrollment.startDate ? enrollment.startDate.split('T')[0] : 'Immediate'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {enrollment.emailSchedule?.sendInvite ? (
                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>✓ Email Invitation Configured</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No invitation mail</span>
                          )}
                          {enrollment.emailSchedule?.sendReminders ? (
                            <span style={{ fontSize: '0.7rem', color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Clock size={10} /> Reminders: {enrollment.emailSchedule.reminderFrequency}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No reminders</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleCopyLink(enrollment.id)}
                            title="Copy enrollment web link"
                            aria-label={`Copy Link for ${enrollment.title}`}
                          >
                            <LinkIcon size={15} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleOpenEdit(enrollment)}
                            title="Edit enrollment settings"
                            aria-label={`Edit ${enrollment.title}`}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleOpenManual(enrollment)}
                            title="Manual override result status"
                            aria-label={`Manual status for ${enrollment.title}`}
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => handleDelete(enrollment.id)}
                            title="Delete enrollment"
                            aria-label={`Delete ${enrollment.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-in Edit / Create Drawer Sheet */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>
                  {editingId ? 'Edit Enrollment' : 'Share & Assign (Enrollment)'}
                </h2>
                <p className={styles.modalSub}>{formData.title}</p>
              </div>
              <button className={styles.modalClose} onClick={() => setIsOpen(false)} aria-label="Close sheet">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabsHeader}>
              <button
                className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('general')}
              >
                ⚙️ General
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'invitations' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('invitations')}
              >
                📧 Invitation & Reminders
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'links' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('links')}
                disabled={!editingId}
                style={{ opacity: editingId ? 1 : 0.5, cursor: editingId ? 'pointer' : 'not-allowed' }}
              >
                🔗 Web Links
              </button>
            </div>

            <form onSubmit={handleSave} className={styles.modalBody}>
              {activeTab === 'general' && (
                <>
                  {/* Quota Exceeded Block Warning (Sprint 4) */}
                  {quotaExceeded && (
                    <div className={styles.alertBox}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertTriangle size={18} />
                        <span className={styles.alertTitle}>Active Seats Limit Reached</span>
                      </div>
                      <p className={styles.alertDesc}>
                        You have reached your maximum purchased active limit of <strong>{quota?.maxSeats} Listener Seats</strong>. Creating this active enrollment would exceed your billing tier.
                      </p>
                      <a href="/profile#billing-seats" className={styles.alertLink}>
                        Upgrade Listener Seats capacity now
                      </a>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="title">
                      Enrollment Reference / Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className={styles.input}
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="targetType">
                      Target Audience / Recipient
                    </label>
                    <select
                      id="targetType"
                      className={styles.input}
                      value={formData.targetType}
                      onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}
                    >
                      <option value="Listener">Individual Listener (Personalized Link)</option>
                      <option value="Anonymous">Anonymous Access (Shared Link)</option>
                      <option value="Group" disabled>Cohort Group (Sprint 2 - coming soon)</option>
                    </select>
                  </div>

                  {formData.targetType === 'Listener' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="listenerSelect">
                        Select Listener Profile *
                      </label>
                      <select
                        id="listenerSelect"
                        className={styles.input}
                        required
                        value={formData.listenerId}
                        onChange={(e) => setFormData({ ...formData, listenerId: e.target.value })}
                      >
                        <option value="" disabled>Select listener email...</option>
                        {listeners.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.firstName || ''} {l.lastName || ''} ({l.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="contentType">
                      Content Type
                    </label>
                    <select
                      id="contentType"
                      className={styles.input}
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value as any })}
                    >
                      <option value="Project">Presentation Project</option>
                      <option value="Course" disabled>Interactive Course Sequence (Sprint 2 - coming soon)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="projectSelect">
                      Select Presentation Project *
                    </label>
                    <select
                      id="projectSelect"
                      className={styles.input}
                      required
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    >
                      <option value="" disabled>Select project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="startDate">
                        Invitation Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className={styles.input}
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="status">
                        Current Enrollment Status
                      </label>
                      <select
                        id="status"
                        className={styles.input}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="Pending">Pending (Not Opened)</option>
                        <option value="In Progress">In Progress (Opened)</option>
                        <option value="Completed">Completed (Passed)</option>
                        <option value="Failed">Failed (Not Passed)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'invitations' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={formData.emailSchedule.sendInvite}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailSchedule: { ...formData.emailSchedule, sendInvite: e.target.checked }
                        })}
                      />
                      Send automated Email Onboarding Invitation
                    </label>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={formData.emailSchedule.sendReminders}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailSchedule: { ...formData.emailSchedule, sendReminders: e.target.checked }
                        })}
                      />
                      Send email reminders if not opened
                    </label>
                  </div>

                  {formData.emailSchedule.sendReminders && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="reminderFrequency">
                        Reminder Delivery Frequency
                      </label>
                      <select
                        id="reminderFrequency"
                        className={styles.input}
                        value={formData.emailSchedule.reminderFrequency}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailSchedule: { ...formData.emailSchedule, reminderFrequency: e.target.value }
                        })}
                      >
                        <option value="daily">Daily reminders (max 3 times)</option>
                        <option value="weekly">Weekly reminders (max 3 times)</option>
                        <option value="custom">Every 3 days (max 3 times)</option>
                      </select>
                    </div>
                  )}

                  {formData.emailSchedule.sendInvite && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="inviteSubject">
                          Invitation Email Subject
                        </label>
                        <input
                          type="text"
                          id="inviteSubject"
                          className={styles.input}
                          value={formData.emailSchedule.inviteSubject}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailSchedule: { ...formData.emailSchedule, inviteSubject: e.target.value }
                          })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="inviteBody">
                          Email Template Body (Supports `{"{{listener_first_name}}"}` and `{"{{avatar_name}}"}`)
                        </label>
                        <textarea
                          id="inviteBody"
                          className={styles.textarea}
                          value={formData.emailSchedule.inviteBody}
                          onChange={(e) => setFormData({
                            ...formData,
                            emailSchedule: { ...formData.emailSchedule, inviteBody: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.formGroup} style={{ marginTop: '0.5rem', backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <label className={styles.toggleLabel} style={{ color: '#166534' }}>
                      <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={formData.emailSchedule.translateToListenerLang}
                        onChange={(e) => setFormData({
                          ...formData,
                          emailSchedule: { ...formData.emailSchedule, translateToListenerLang: e.target.checked }
                        })}
                      />
                      <Languages size={15} style={{ marginRight: '0.1rem' }} />
                      Translate to Listener Language (Auto-translation toggle)
                    </label>
                    <p style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                      Automatically translates slide text and synthetic voice speech into the primary language selected in the listener's profile.
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'links' && editingId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className={styles.linkBox}>
                    <div className={styles.linkHeader}>
                      <span className={styles.linkTitle}>Personalized Web Link URL</span>
                      <div className={styles.linkActions}>
                        <button type="button" className={styles.btnSecondary} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleCopyLink(editingId)}>Copy Link</button>
                        <button type="button" className={styles.btnSecondary} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} onClick={handleUpdateWebLink}>Update Link</button>
                      </div>
                    </div>
                    <div className={styles.urlCopyArea}>
                      <input type="text" className={styles.urlInput} readOnly value={`https://pitch-avatar.com/v/enroll-${editingId.slice(0, 8)}`} />
                    </div>
                  </div>

                  <div className={styles.qrContainer}>
                    <div className={styles.qrPlaceholder}>
                      <QrCode size={36} style={{ color: '#cbd5e1' }} />
                    </div>
                    <div className={styles.qrInfo}>
                      <span className={styles.qrTitle}>QR Access Code</span>
                      <span className={styles.qrDesc}>Download the unique access code to print on training brochures or scan during offline events.</span>
                      <button type="button" className={styles.btnSecondary} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                        📥 Download QR Code
                      </button>
                    </div>
                  </div>

                  <div className={styles.linkBox}>
                    <span className={styles.linkTitle} style={{ marginBottom: '0.25rem' }}>HTML Iframe Code Embed</span>
                    <textarea className={styles.textarea} style={{ fontSize: '0.75rem', fontFamily: 'monospace', minHeight: '60px' }} readOnly value={`<iframe src="https://pitch-avatar.com/v/enroll-${editingId.slice(0, 8)}" width="100%" height="520" frameborder="0" allow="autoplay; fullscreen"></iframe>`} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendInviteNow}>
                      📧 Send Invitation Email Now
                    </button>
                    <button type="button" className={styles.btnSecondary} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSendReminderNow}>
                      ⏰ Send Reminder Now
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} styles.btnSecondary`}
                style={{ backgroundColor: 'transparent', border: '1px solid var(--border-light)' }}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              {activeTab !== 'links' && (
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleSave}
                  disabled={quotaExceeded && !editingId}
                >
                  Save Enrollment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Override modal popup popup */}
      {isManualOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsManualOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ height: 'auto', maxHeight: '90%', borderRadius: '12px', maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manual Result Entry</h2>
              <button className={styles.modalClose} onClick={() => setIsManualOpen(false)} aria-label="Close manual override">
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '0.85rem', color: 'var(--sara-text-muted)', lineHeight: '1.4' }}>
                If this cohort does not sync automatically with standard ATS/CRM platforms, you can manually override the final enrollment result state.
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="manualStatus">
                  Final Status Result
                </label>
                <select
                  id="manualStatus"
                  className={styles.input}
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as any)}
                >
                  <option value="Completed">Completed (Passed / Success)</option>
                  <option value="Failed">Failed (Not Passed / Rejected)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="manualDate">
                  Completion / Execution Date
                </label>
                <input
                  type="date"
                  id="manualDate"
                  className={styles.input}
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} styles.btnSecondary`}
                style={{ backgroundColor: 'transparent', border: '1px solid var(--border-light)' }}
                onClick={() => setIsManualOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveManual}>
                Confirm Manual Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
