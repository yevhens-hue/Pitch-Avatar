'use client'

import React, { useState, useEffect, useTransition } from 'react'
import styles from './listeners.module.css'
import {
  Users,
  Search,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Building,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  UploadCloud,
  Linkedin,
  File,
  FileText
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getListeners,
  createListener,
  updateListener,
  deleteListener
} from '@/app/actions/listeners'
import { Listener } from '@/types/listeners'

// Gradient backgrounds for user avatars
const AVATAR_COLORS = [
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
]

const getAvatarStyle = (email: string) => {
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % AVATAR_COLORS.length
  return { background: AVATAR_COLORS[colorIndex] }
}

const emptyFormState = {
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  industry: '',
  position: '',
  linkedin: '',
  country: '',
  department: '',
  language: 'en',
  documents: [] as string[],
}

export default function ListenersDashboard() {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  // State lists
  const [listeners, setListeners] = useState<Listener[]>([])
  const [total, setTotal] = useState(0)

  // Search & Pagination state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 6

  // Form sheet state
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyFormState)

  // File drag & drop simulator state
  const [isDragging, setIsDragging] = useState(false)

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Load listeners
  const loadListeners = () => {
    startTransition(async () => {
      try {
        const result = await getListeners(debouncedSearch, page, limit)
        setListeners(result.data)
        setTotal(result.total)
      } catch (err) {
        showToast('Failed to load listeners', 'error')
      }
    })
  }

  useEffect(() => {
    loadListeners()
  }, [debouncedSearch, page])

  // Action: Add / Create form open
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData(emptyFormState)
    setIsOpen(true)
  }

  // Action: Edit form open
  const handleOpenEdit = (listener: Listener) => {
    setEditingId(listener.id)
    setFormData({
      email: listener.email,
      firstName: listener.firstName || '',
      lastName: listener.lastName || '',
      company: listener.company || '',
      industry: listener.industry || '',
      position: listener.position || '',
      linkedin: listener.linkedin || '',
      country: listener.country || '',
      department: listener.department || '',
      language: listener.language || 'en',
      documents: listener.documents || [],
    })
    setIsOpen(true)
  }

  // Action: Save Form (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim()) {
      showToast('Email is required', 'error')
      return
    }

    try {
      if (editingId) {
        await updateListener(editingId, formData)
        showToast('Listener updated successfully', 'success')
      } else {
        await createListener({
          ...formData,
          userId: '00000000-0000-0000-0000-000000000000'
        })
        showToast('Listener created successfully', 'success')
      }
      setIsOpen(false)
      loadListeners()
    } catch (err: any) {
      showToast(err.message || 'Failed to save listener', 'error')
    }
  }

  // Action: Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listener? All historical metrics will be preserved as soft-archived.')) return
    try {
      await deleteListener(id)
      showToast('Listener deleted successfully', 'success')
      loadListeners()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listener', 'error')
    }
  }

  // Document management simulation (Drag & Drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      addSimulatorFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      addSimulatorFiles(files)
    }
  }

  const addSimulatorFiles = (files: FileList) => {
    const newDocs = [...formData.documents]
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        newDocs.push(file.name)
        showToast(`AI Parsing loaded: ${file.name}`, 'success')
      } else {
        showToast('Only PDF and Word (.docx) files are supported for AI parsing', 'error')
      }
    }
    setFormData({ ...formData, documents: newDocs })
  }

  const removeDoc = (index: number) => {
    const newDocs = formData.documents.filter((_, idx) => idx !== index)
    setFormData({ ...formData, documents: newDocs })
  }

  // Fake CSV Import / Export actions
  const handleImportCSV = () => {
    showToast('AI CV Parsing: Upload a PDF file in the user editor for resume extraction, or bulk import CSV files (CSV bulk imports coming soon)', 'info')
  }

  const handleExportCSV = () => {
    if (listeners.length === 0) {
      showToast('No listeners to export', 'error')
      return
    }
    const headers = 'FirstName,LastName,Email,Position,Company,Country,Language,Documents\n'
    const rows = listeners.map(l => 
      `"${l.firstName || ''}","${l.lastName || ''}","${l.email}","${l.position || ''}","${l.company || ''}","${l.country || ''}","${l.language}","${(l.documents || []).join(';')}"`
    ).join('\n')
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `pitch_avatar_listeners_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Listeners exported successfully!', 'success')
  }

  // derived values
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Listeners & Groups</h1>
          <p className={styles.subtitle}>Manage candidate resumes, employees, L&D testing cohorts and synchronization mapping.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleExportCSV} aria-label="Export listeners to CSV">
            <Download size={16} /> Export
          </button>
          <button className={styles.btnSecondary} onClick={handleImportCSV} aria-label="Import listeners database">
            <UploadCloud size={16} /> Import
          </button>
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Create new listener profile">
            <Plus size={16} /> Add Listener
          </button>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search listeners"
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        {listeners.length === 0 && !isPending ? (
          <div className={styles.emptyState}>
            <Users size={48} style={{ color: '#cbd5e1' }} />
            <h3 className={styles.emptyStateTitle}>No listeners found</h3>
            <p className={styles.emptyStateDesc}>Start by adding your first candidate, importing a spreadsheet, or loading a stack of PDF resumes.</p>
            <button className={styles.btnPrimary} onClick={handleOpenCreate}>
              <Plus size={16} /> Add First Listener
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Listener Info</th>
                <th>Company & Dept</th>
                <th>Location & Lang</th>
                <th>Documents</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading listeners list...
                  </td>
                </tr>
              ) : (
                listeners.map((listener) => {
                  const nameStr = `${listener.firstName || ''} ${listener.lastName || ''}`.trim()
                  const nameDisplay = nameStr || 'Anonymous Listener'
                  const initials = (listener.firstName?.[0] || '') + (listener.lastName?.[0] || '') || listener.email[0].toUpperCase()

                  return (
                    <tr key={listener.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar} style={getAvatarStyle(listener.email)}>
                            {initials}
                          </div>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{nameDisplay}</span>
                            <span className={styles.userEmail}>{listener.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{listener.position || '—'}</span>
                          <span className={styles.userEmail}>{listener.company ? `${listener.company} (${listener.department || 'N/A'})` : '—'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span className={`${styles.tag} ${styles.tagLanguage}`}>
                            <Globe size={12} style={{ marginRight: '0.2rem' }} /> {listener.language.toUpperCase()}
                          </span>
                          {listener.country && (
                            <span className={styles.userEmail}>{listener.country}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {listener.documents && listener.documents.length > 0 ? (
                          <span className={`${styles.tag} ${styles.tagDocs}`}>
                            <File size={12} /> {listener.documents.length} PDF / Word
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleOpenEdit(listener)}
                            title="Edit listener profile"
                            aria-label={`Edit ${nameDisplay}`}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            onClick={() => handleDelete(listener.id)}
                            title="Delete listener profile"
                            aria-label={`Delete ${nameDisplay}`}
                          >
                            <Trash2 size={16} />
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

      {listeners.length > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Page {page} of {totalPages} (Total {total} listeners)
          </span>
          <div className={styles.paginationActions}>
            <button
              className={styles.pagerBtn}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className={styles.pagerBtn}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Slide-in Edit / Create Drawer Sheet */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? 'Edit Listener Profile' : 'Add New Listener'}
              </h2>
              <button className={styles.modalClose} onClick={() => setIsOpen(false)} aria-label="Close form sheet">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="email">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className={styles.input}
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className={styles.input}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="position">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    className={styles.input}
                    placeholder="e.g. Lead Designer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="department">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    className={styles.input}
                    placeholder="e.g. Design"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="company">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className={styles.input}
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="industry">
                    Industry
                  </label>
                  <input
                    type="text"
                    id="industry"
                    className={styles.input}
                    placeholder="Software"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="country">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    className={styles.input}
                    placeholder="e.g. Poland"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="language">
                    Primary Language
                  </label>
                  <select
                    id="language"
                    className={styles.input}
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="en">English (EN)</option>
                    <option value="pl">Polish (PL)</option>
                    <option value="sv">Swedish (SV)</option>
                    <option value="ru">Russian (RU)</option>
                    <option value="de">German (DE)</option>
                    <option value="fr">French (FR)</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="linkedin">
                  LinkedIn URL
                </label>
                <div style={{ position: 'relative' }}>
                  <Linkedin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    id="linkedin"
                    className={styles.input}
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </div>
              </div>

              {/* Stub dropdown Group */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Assign Group <span className={styles.stubBadge}>Sprint 2 Stub</span>
                </label>
                <select className={styles.input} disabled defaultValue="">
                  <option value="" disabled>Select cohort group (disabled - stubs only)</option>
                  <option value="q1_candidates">Q1 Recruiting Cohort</option>
                  <option value="rnd_compliance">R&D Compliance Training</option>
                </select>
              </div>

              {/* CV Parsing documents upload area */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Documents & Resumes (AI CV Parsing)
                </label>
                <div
                  className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                >
                  <UploadCloud size={28} className={styles.dropzoneIcon} />
                  <span className={styles.dropzoneText}>Drag & drop resume PDF or Word file</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AI will parse first name, last name, skills & fill fields automatically</span>
                  <input
                    type="file"
                    id="resume-file-input"
                    multiple
                    accept=".pdf,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </div>
                {formData.documents && formData.documents.length > 0 && (
                  <div className={styles.docsList}>
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className={styles.docItem}>
                        <div className={styles.docInfo}>
                          <FileText size={14} style={{ color: 'var(--primary)' }} />
                          <span>{doc}</span>
                        </div>
                        <button type="button" className={styles.docRemoveBtn} onClick={() => removeDoc(idx)} aria-label={`Remove ${doc}`}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
