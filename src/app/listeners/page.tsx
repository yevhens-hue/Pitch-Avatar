'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import styles from './listeners.module.css'
import {
  Users, Search, Plus, Trash2, Edit3, Globe, X, Settings,
  ChevronLeft, ChevronRight, Download, UploadCloud, Linkedin,
  File, FileText, BarChart2, Clock, Award, FileSpreadsheet,
  AlertCircle, CheckCircle, Columns, Maximize2, Minimize2, Filter, Check, FilterX
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { getListeners, createListener, updateListener, deleteListener } from '@/app/actions/listeners'
import { Listener } from '@/types/listeners'
import * as xlsx from 'xlsx'

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
]
const getAvatarStyle = (email: string) => {
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash)
  return { background: AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] }
}

// ── CSV import mock data ───────────────────────────────────────────────────────
const MOCK_CSV_COLUMNS = ['First Name', 'Last Name', 'Work Email', 'Department', 'Job Title', 'Company', 'Country']
const MOCK_CSV_ROWS = [
  ['Anna', 'Kowalski', 'anna@acme.com', 'Engineering', 'Senior Engineer', 'Acme Corp', 'Poland'],
  ['Bob', 'Smith', 'bob@techco.com', 'Sales', 'Account Manager', 'TechCo', 'USA'],
  ['Chen', 'Wei', 'chen@startup.io', 'Product', 'Product Manager', 'StartupIO', 'Singapore'],
]
const LISTENER_FIELD_OPTIONS = [
  { value: '', label: '— Skip —' },
  { value: 'email', label: 'Email *' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'company', label: 'Company' },
  { value: 'department', label: 'Department' },
  { value: 'position', label: 'Job Title' },
  { value: 'country', label: 'Country' },
  { value: 'industry', label: 'Industry' },
  { value: 'linkedin', label: 'LinkedIn URL' },
  { value: 'language', label: 'Language' },
]
const DEFAULT_CSV_MAPPINGS: Record<string, string> = {
  'First Name': 'firstName', 'Last Name': 'lastName', 'Work Email': 'email',
  'Email': 'email', 'Department': 'department', 'Job Title': 'position',
  'Position': 'position', 'Company': 'company', 'Country': 'country',
}

// ── Analytics mock data (per listener) ────────────────────────────────────────
const MOCK_ANALYTICS = [
  { id: '1', project: 'HR Onboarding Essentials 2024', date: '2026-05-15', progress: 87, score: 92, time: '18 min', status: 'Completed' },
  { id: '2', project: 'Sales Qualification Q2 Deck',   date: '2026-04-28', progress: 100, score: 78, time: '24 min', status: 'Completed' },
  { id: '3', project: 'Interactive Product Demo',       date: '2026-03-10', progress: 45, score: null, time: '8 min', status: 'In Progress' },
  { id: '4', project: 'Compliance Training v3',          date: null,         progress: 0,  score: null, time: '—',     status: 'Pending' },
]

const ALL_COLUMNS = ['Name', 'First Name', 'Last Name', 'Email', 'Phone', 'Position', 'Department', 'Company', 'Country', 'LinkedIn', 'Language', 'Group', 'Documents', 'Last Activity', 'Assignments', 'Last Result', 'Positive Result Date', 'Last Assignment Summary']
const AUTO_COLUMNS = ['Name', 'Assignments', 'Last Result', 'Positive Result Date', 'Last Assignment Summary']
const DEFAULT_COLUMNS = ['Name', 'Email', 'Position', 'Group', 'Last Activity']

const emptyFormState = {
  email: '', firstName: '', lastName: '', company: '',
  industry: '', position: '', linkedin: '', country: '',
  department: '', language: 'en', documents: [] as string[],
}

export default function ListenersDashboard() {
  const { showToast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [listeners, setListeners] = useState<Listener[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 6

  // Drawer state
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState(emptyFormState)
  const [drawerTab, setDrawerTab] = useState<'edit' | 'files' | 'analytics'>('edit')

  // File drag state
  const [isDragging, setIsDragging] = useState(false)

  // Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importTab, setImportTab] = useState<'csv' | 'pdf'>('csv')
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvMappings, setCsvMappings] = useState<Record<string, string>>({ ...DEFAULT_CSV_MAPPINGS })
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null)
  
  // Action menu state
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null)
  
  // Delete confirmation state
  const [listenerToDelete, setListenerToDelete] = useState<string | null>(null)
  
  // Expand view state
  const [isExpanded, setIsExpanded] = useState(false)
  const importIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Columns & Filters state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS)
  const [isColumnsOpen, setIsColumnsOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [filterCountry, setFilterCountry] = useState('All Country')
  const [filterDepartment, setFilterDepartment] = useState('All Department')
  
  // Selection state
  const [selectedListeners, setSelectedListeners] = useState<string[]>([])
  
  // Close dropdowns on outside click
  const dropdownsRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownsRef.current && !dropdownsRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false)
        setIsColumnsOpen(false)
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  // Get unique filter options
  const countryOptions = ['All Country', ...Array.from(new Set(listeners.map(l => l.country).filter(Boolean)))].sort()
  const deptOptions = ['All Department', ...Array.from(new Set(listeners.map(l => l.department).filter(Boolean)))].sort()

  const filteredListeners = listeners.filter(l => {
    if (filterCountry !== 'All Country' && l.country !== filterCountry) return false
    if (filterDepartment !== 'All Department' && l.department !== filterDepartment) return false
    return true
  })

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => clearTimeout(h)
  }, [search])

  const loadListeners = () => {
    startTransition(async () => {
      try {
        const result = await getListeners(debouncedSearch, page, limit)
        setListeners(result.data)
        setTotal(result.total)
      } catch { showToast('Failed to load listeners', 'error') }
    })
  }
  useEffect(() => { loadListeners() }, [debouncedSearch, page])

  const handleOpenCreate = () => {
    setEditingId(null); setFormData(emptyFormState); setDrawerTab('edit'); setIsOpen(true)
  }



  // Handle Click Outside for Action Menu
  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpenId(null)
    if (actionMenuOpenId !== null) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [actionMenuOpenId])

  const handleOpenEdit = (listener: Listener) => {
    setEditingId(listener.id)
    setFormData({
      email: listener.email, firstName: listener.firstName || '',
      lastName: listener.lastName || '', company: listener.company || '',
      industry: listener.industry || '', position: listener.position || '',
      linkedin: listener.linkedin || '', country: listener.country || '',
      department: listener.department || '', language: listener.language || 'en',
      documents: listener.documents || [],
    })
    setDrawerTab('edit'); setIsOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim()) { showToast('Email is required', 'error'); return }
    try {
      if (editingId) {
        await updateListener(editingId, formData)
        showToast('Listener updated', 'success')
      } else {
        await createListener({ ...formData, userId: '00000000-0000-0000-0000-000000000000' })
        showToast('Listener created', 'success')
      }
      setIsOpen(false); loadListeners()
    } catch (err: any) { showToast(err.message || 'Failed to save', 'error') }
  }

  const handleDeleteClick = (id: string) => {
    setListenerToDelete(id)
    setActionMenuOpenId(null)
  }

  const confirmDelete = async () => {
    if (!listenerToDelete) return
    try { 
      await deleteListener(listenerToDelete)
      showToast('Deleted', 'success')
      loadListeners()
      setListenerToDelete(null)
    } catch (err: any) { 
      showToast(err.message || 'Failed to delete', 'error') 
    }
  }

  // File handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files.length) addSimulatorFiles(e.dataTransfer.files)
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addSimulatorFiles(e.target.files)
  }
  const addSimulatorFiles = (files: FileList) => {
    const newDocs = [...formData.documents]
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f.name.endsWith('.pdf') || f.name.endsWith('.docx')) {
        newDocs.push(f.name); showToast(`AI Parsing: ${f.name}`, 'success')
      } else { showToast('Only PDF and .docx supported', 'error') }
    }
    setFormData({ ...formData, documents: newDocs })
  }
  const removeDoc = (idx: number) =>
    setFormData({ ...formData, documents: formData.documents.filter((_, i) => i !== idx) })

  // Real Export logic
  const handleExportCSV = () => {
    if (!listeners.length) { showToast('No listeners to export', 'error'); return }
    const ws = xlsx.utils.json_to_sheet(listeners)
    const csv = xlsx.utils.sheet_to_csv(ws)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `listeners_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    showToast('Exported to CSV!', 'success')
  }

  const handleExportExcel = () => {
    if (!listeners.length) { showToast('No listeners to export', 'error'); return }
    const ws = xlsx.utils.json_to_sheet(listeners)
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'Listeners')
    xlsx.writeFile(wb, `listeners_${new Date().toISOString().split('T')[0]}.xlsx`)
    showToast('Exported to Excel!', 'success')
  }

  // Import logic
  const openImportModal = () => {
    setIsImportModalOpen(true)
    setImportProgress(0)
    setImportResult(null)
    setIsImporting(false)
  }

  const closeImportModal = () => {
    setIsImportModalOpen(false)
    if (importResult?.success) { loadListeners() }
  }

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(csv|xls|xlsx)$/i)) {
      showToast('Please upload a valid CSV or Excel file', 'error')
      return
    }

    setIsImporting(true)
    setImportProgress(10)

    try {
      const data = await file.arrayBuffer()
      const wb = xlsx.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = xlsx.utils.sheet_to_json<any>(ws)
      
      setImportProgress(40)

      let success = 0
      let errors = 0

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
          const nameStr = row['Name'] || row['name'] || ''
          const parts = nameStr.trim().split(' ')
          const firstName = parts[0] || ''
          const lastName = parts.slice(1).join(' ') || ''
          
          await createListener({
            firstName: firstName,
            lastName: lastName,
            email: row['Email'] || row['email'] || '',
            company: row['Company'] || row['company'] || '',
            position: row['Position'] || row['position'] || '',
            country: row['Country'] || row['country'] || '',
            linkedin: row['LinkedIn'] || row['linkedin'] || row['Linkedin'] || '',
            department: '',
            industry: '',
            language: 'en',
            documents: []
          })
          success++
        } catch (err) {
          errors++
        }
        setImportProgress(40 + Math.floor((i / rows.length) * 50))
      }

      setImportResult({ success, errors })
      setImportProgress(100)
    } catch (e) {
      console.error(e)
      showToast('Failed to parse file', 'error')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleImportDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className={isExpanded ? styles.containerExpanded : styles.container}>
      {/* ── Page Header ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Listeners &amp; Groups</h1>
          <p className={styles.subtitle}>Manage candidates, employees, L&amp;D cohorts and PDF-based AI extraction.</p>
        </div>
        <div className={styles.headerActionsRight}>
          <button className={styles.btnSecondary} onClick={() => setIsExpanded(!isExpanded)} aria-label="Expand view">
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />} {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <div className={styles.dropdownContainer} ref={exportRef}>
            <button className={styles.btnSecondary} onClick={() => setIsExportOpen(!isExportOpen)} aria-label="Export">
              <Download size={16} /> Export
            </button>
            {isExportOpen && (
              <div className={styles.dropdownMenu} style={{ right: 0, top: '100%', marginTop: '0.5rem', minWidth: '180px' }}>
                <button className={styles.dropdownAction} onClick={() => { handleExportCSV(); setIsExportOpen(false); }}>
                  <FileText size={16} /> Export as CSV
                </button>
                <button className={styles.dropdownAction} onClick={() => { handleExportExcel(); setIsExportOpen(false); }}>
                  <FileSpreadsheet size={16} /> Export as Excel
                </button>
              </div>
            )}
          </div>
          <button className={styles.btnSecondary} onClick={openImportModal} aria-label="Import listeners">
            <UploadCloud size={16} /> Import
          </button>
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Add listener">
            <Plus size={16} /> Add Listener
          </button>
        </div>
      </div>

      {/* ── Search & Filters bar ── */}
      <div className={styles.controlsBar} ref={dropdownsRef}>
        <div className={styles.searchWrapper} style={{ maxWidth: '300px' }}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text" className={styles.searchInput}
            placeholder="Search listeners..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            aria-label="Search listeners"
          />
        </div>

        <div className={styles.dropdownContainer}>
          <button className={styles.btnSecondary} onClick={() => { setIsFiltersOpen(!isFiltersOpen); setIsColumnsOpen(false); }}>
            <Filter size={16} /> Filters
          </button>
          {isFiltersOpen && (
            <div className={styles.dropdownMenu} style={{ minWidth: '240px', left: 0, right: 'auto' }}>
              <div className={styles.dropdownSelectGroup}>
                <label className={styles.dropdownSelectLabel}>Country</label>
                <select 
                  className={styles.dropdownSelect} 
                  value={filterCountry} 
                  onChange={(e) => setFilterCountry(e.target.value)}
                >
                  {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.dropdownSelectGroup} style={{ marginTop: '0.5rem' }}>
                <label className={styles.dropdownSelectLabel}>Department</label>
                <select 
                  className={styles.dropdownSelect} 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}></div>

        <div className={styles.dropdownContainer}>
          <button className={styles.btnSecondary} onClick={() => { setIsColumnsOpen(!isColumnsOpen); setIsFiltersOpen(false); }}>
            <Columns size={16} /> Columns
          </button>
          {isColumnsOpen && (
            <div className={styles.dropdownMenu} style={{ right: 0 }}>
              <div className={styles.dropdownHeader}>Visible columns</div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {ALL_COLUMNS.map(col => {
                  const isAuto = AUTO_COLUMNS.includes(col)
                  const isChecked = visibleColumns.includes(col)
                  return (
                    <div key={col} className={styles.dropdownItem} onClick={() => toggleColumn(col)}>
                      <div className={styles.dropdownCheckbox} data-checked={isChecked}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span>{col}</span>
                      {isAuto && <span className={styles.badgeAuto}>Auto</span>}
                    </div>
                  )
                })}
              </div>
              <div className={styles.dropdownAction} onClick={() => setVisibleColumns(DEFAULT_COLUMNS)}>
                Reset to default
              </div>
            </div>
          )}
        </div>
        
        <button className={styles.btnSecondary} onClick={() => setIsExpanded(!isExpanded)} aria-label="Expand view">
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />} {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {!listeners.length && !isPending ? (
          <div className={styles.emptyState}>
            <Users size={48} style={{ color: '#cbd5e1' }} />
            <h3 className={styles.emptyStateTitle}>No listeners found</h3>
            <p className={styles.emptyStateDesc}>Add a listener manually, import a CSV spreadsheet, or upload PDF resumes for AI parsing.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className={styles.btnSecondary} onClick={openImportModal}><UploadCloud size={15} /> Import</button>
              <button className={styles.btnPrimary} onClick={handleOpenCreate}><Plus size={15} /> Add First Listener</button>
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <div 
                    className={styles.tableCheckboxContainer}
                    data-checked={filteredListeners.length > 0 && selectedListeners.length === filteredListeners.length}
                    onClick={() => {
                      if (selectedListeners.length === filteredListeners.length) {
                        setSelectedListeners([])
                      } else {
                        setSelectedListeners(filteredListeners.map(l => l.id))
                      }
                    }}
                  >
                    {filteredListeners.length > 0 && selectedListeners.length === filteredListeners.length && <Check size={12} strokeWidth={3} />}
                  </div>
                </th>
                {ALL_COLUMNS.map(col => visibleColumns.includes(col) && <th key={col}>{col}</th>)}
                <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr><td colSpan={visibleColumns.length + 2} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading…</td></tr>
              ) : (
                filteredListeners.map((listener) => {
                  const nameStr = `${listener.firstName || ''} ${listener.lastName || ''}`.trim()
                  const nameDisplay = nameStr || 'Anonymous Listener'
                  const isChecked = selectedListeners.includes(listener.id)
                  
                  return (
                    <tr key={listener.id}>
                      <td className={styles.checkboxColumn}>
                        <div 
                          className={styles.tableCheckboxContainer}
                          data-checked={isChecked}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedListeners(prev => prev.filter(id => id !== listener.id))
                            } else {
                              setSelectedListeners(prev => [...prev, listener.id])
                            }
                          }}
                        >
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                      </td>
                      {visibleColumns.map(col => {
                        let content: React.ReactNode = '—'
                        
                        switch (col) {
                          case 'Name': content = <span className={styles.userName}>{nameDisplay}</span>; break;
                          case 'First Name': content = listener.firstName || '—'; break;
                          case 'Last Name': content = listener.lastName || '—'; break;
                          case 'Email': content = <span className={styles.userEmail}>{listener.email}</span>; break;
                          case 'Phone': content = '—'; break; // phone not in type currently
                          case 'Position': content = listener.position || '—'; break;
                          case 'Department': content = listener.department || '—'; break;
                          case 'Company': content = listener.company || '—'; break;
                          case 'Country': content = listener.country || '—'; break;
                          case 'LinkedIn': content = listener.linkedin ? 'Linked' : '—'; break;
                          case 'Language': content = listener.language || 'en'; break;
                          case 'Group': content = '—'; break; // Group not implemented in data yet
                          case 'Documents': 
                            content = listener.documents?.length > 0 ? (
                              <span
                                className={`${styles.tag} ${styles.tagDocs}`}
                                style={{ cursor: 'pointer', margin: 0 }}
                                onClick={() => { handleOpenEdit(listener); setDrawerTab('files') }}
                              >
                                {listener.documents.length} file{listener.documents.length > 1 ? 's' : ''}
                              </span>
                            ) : 'None';
                            break;
                          case 'Last Activity': content = 'Jun 1, 2026'; break; // Hardcoded mock based on screenshot
                          case 'Assignments': content = '—'; break;
                          case 'Last Result': content = '—'; break;
                          case 'Positive Result Date': content = '—'; break;
                          case 'Last Assignment Summary': content = '—'; break;
                        }
                        
                        return <td key={col}>{content}</td>
                      })}
                      <td>
                        <div className={styles.actionsCell} style={{ justifyContent: 'flex-end', position: 'relative' }}>
                          <button
                            className={styles.actionBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(actionMenuOpenId === listener.id ? null : listener.id)
                            }}
                            title="Actions"
                            aria-label={`Actions for ${nameDisplay}`}
                          >
                            <Settings size={16} />
                          </button>
                          {actionMenuOpenId === listener.id && (
                            <div className={styles.rowActionMenu} onClick={(e) => e.stopPropagation()}>
                              <button className={styles.rowActionItem} onClick={() => { handleOpenEdit(listener); setActionMenuOpenId(null) }}>
                                <Edit3 size={16} /> Edit
                              </button>
                              <button className={`${styles.rowActionItem} ${styles.rowActionItemDanger}`} onClick={() => handleDeleteClick(listener.id)}>
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
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

      {/* ── Pagination ── */}
      {listeners.length > 0 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>Page {page} of {totalPages} · {total} total listeners</span>
          <div className={styles.paginationActions}>
            <button className={styles.pagerBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous">
              <ChevronLeft size={16} /> Previous
            </button>
            <button className={styles.pagerBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Side Drawer ── */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>

            {/* Drawer header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{editingId ? 'Edit Listener' : 'Add Listener'}</h2>
                {editingId && formData.email && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{formData.email}</p>
                )}
              </div>
              <button className={styles.modalClose} onClick={() => setIsOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className={styles.drawerTabs}>
              <button
                className={`${styles.drawerTab} ${drawerTab === 'edit' ? styles.drawerTabActive : ''}`}
                onClick={() => setDrawerTab('edit')}
              >
                <Edit3 size={13} /> Edit Profile
              </button>
              {editingId && (
                <button
                  className={`${styles.drawerTab} ${drawerTab === 'analytics' ? styles.drawerTabActive : ''}`}
                  onClick={() => setDrawerTab('analytics')}
                >
                  <BarChart2 size={13} /> Analytics
                </button>
              )}
            </div>

            {/* Tab body */}
            <div className={styles.modalBody}>

              {/* ── Edit Profile tab ── */}
              {drawerTab === 'edit' && (
                <form id="listener-form" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* Listener Details card */}
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>Listener Details</h3>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="firstName">First Name</label>
                        <input type="text" id="firstName" className={styles.input} placeholder="John"
                          value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="lastName">Last Name</label>
                        <input type="text" id="lastName" className={styles.input} placeholder="Doe"
                          value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                      </div>
                      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.formLabel} htmlFor="email">Email <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="email" id="email" className={styles.input} required placeholder="name@company.com"
                          value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="company">Company</label>
                        <input type="text" id="company" className={styles.input} placeholder="Acme Corp"
                          value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="industry">Industry</label>
                        <input type="text" id="industry" className={styles.input} placeholder="Software"
                          value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="position">Position</label>
                        <input type="text" id="position" className={styles.input} placeholder="Lead Designer"
                          value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="linkedin">LinkedIn</label>
                        <input type="text" id="linkedin" className={styles.input}
                          placeholder="https://linkedin.com/in/username"
                          value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="country">Country</label>
                        <input type="text" id="country" className={styles.input} placeholder="e.g. USA, Germany, Ukraine"
                          value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="department">Department</label>
                        <input type="text" id="department" className={styles.input} placeholder="e.g. Engineering, Sales, HR"
                          value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="language">Language</label>
                        <select id="language" className={styles.input} value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                          <option value="en">English</option>
                          <option value="pl">Polish</option>
                          <option value="de">German</option>
                          <option value="fr">French</option>
                          <option value="sv">Swedish</option>
                          <option value="ru">Russian</option>
                          <option value="uk">Ukrainian</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="group">Group</label>
                        <select id="group" className={styles.input} defaultValue="">
                          <option value="">No Group</option>
                          <option value="sales">Sales Onboarding</option>
                          <option value="engineering">Engineering Team</option>
                          <option value="hr">HR Team</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Documents card */}
                  <div className={styles.formCard}>
                    <h3 className={styles.formCardTitle}>Documents</h3>
                    {!editingId ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Save the listener first to upload documents.</p>
                    ) : (
                      <div>
                        <div
                          className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                          onClick={() => document.getElementById('resume-file-input')?.click()}
                          style={{ marginBottom: '1rem' }}
                        >
                          <UploadCloud size={24} className={styles.dropzoneIcon} />
                          <span className={styles.dropzoneText}>Drag & drop PDF or Word resume</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AI will parse and auto-fill profile fields</span>
                          <input type="file" id="resume-file-input" multiple accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
                        </div>
                        {formData.documents.length > 0 && (
                          <div className={styles.docsList}>
                            {formData.documents.map((doc, idx) => {
                              const isPdf = doc.toLowerCase().endsWith('.pdf')
                              return (
                                <div key={idx} className={styles.docItem}>
                                  <div className={styles.docInfo}>
                                    <div className={styles.docIconWrapper} style={{ background: isPdf ? '#fee2e2' : '#dbeafe' }}>
                                      <FileText size={14} style={{ color: isPdf ? '#ef4444' : '#3b82f6' }} />
                                     </div>
                                    <div>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{doc}</div>
                                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{isPdf ? 'PDF Document' : 'Word Document'}</div>
                                    </div>
                                  </div>
                                  <button type="button" className={`${styles.docActionBtn} ${styles.docActionBtnDanger}`} onClick={() => removeDoc(idx)} aria-label={`Remove ${doc}`} title="Remove">
                                    <X size={13} />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </form>
              )}


              {/* ── Files tab (only for existing) ── */}
              {drawerTab === 'files' && (
                <div>
                  <div
                    className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-file-input')?.click()}
                    style={{ marginBottom: '1.25rem' }}
                  >
                    <UploadCloud size={28} className={styles.dropzoneIcon} />
                    <span className={styles.dropzoneText}>Drag &amp; drop PDF or Word resume</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AI will parse and auto-fill profile fields</span>
                    <input type="file" id="resume-file-input" multiple accept=".pdf,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
                  </div>

                  {formData.documents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      <File size={32} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                      <span style={{ fontSize: '0.85rem' }}>No documents uploaded yet</span>
                    </div>
                  ) : (
                    <div className={styles.docsList}>
                      {formData.documents.map((doc, idx) => {
                        const isPdf = doc.toLowerCase().endsWith('.pdf')
                        return (
                          <div key={idx} className={styles.docItem}>
                            <div className={styles.docInfo}>
                              <div className={styles.docIconWrapper} style={{ background: isPdf ? '#fee2e2' : '#dbeafe' }}>
                                <FileText size={14} style={{ color: isPdf ? '#ef4444' : '#3b82f6' }} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{doc}</div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                  {isPdf ? 'PDF Document' : 'Word Document'} · Uploaded today
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button type="button" className={styles.docActionBtn} onClick={() => showToast(`Downloading ${doc}…`, 'info')} aria-label={`Download ${doc}`} title="Download">
                                <Download size={13} />
                              </button>
                              <button type="button" className={`${styles.docActionBtn} ${styles.docActionBtnDanger}`} onClick={() => removeDoc(idx)} aria-label={`Remove ${doc}`} title="Remove">
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Analytics tab ── */}
              {drawerTab === 'analytics' && (
                <div>
                  {/* Summary stats */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                      { value: MOCK_ANALYTICS.filter(a => a.status === 'Completed').length, label: 'Completed', color: '#10b981' },
                      { value: MOCK_ANALYTICS.filter(a => a.status === 'In Progress').length, label: 'In Progress', color: '#3b82f6' },
                      { value: `${MOCK_ANALYTICS.reduce((s, a) => s + (a.time !== '—' ? parseInt(a.time) : 0), 0)} min`, label: 'Total Time', color: '#6366f1' },
                    ].map(stat => (
                      <div key={stat.label} className={styles.analyticsStatCard}>
                        <div className={styles.analyticsStatValue} style={{ color: stat.color }}>{stat.value}</div>
                        <div className={styles.analyticsStatLabel}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Presentation history */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {MOCK_ANALYTICS.map(item => {
                      const statusColor =
                        item.status === 'Completed' ? '#10b981' :
                        item.status === 'In Progress' ? '#3b82f6' : '#94a3b8'
                      return (
                        <div key={item.id} className={styles.analyticsCard}>
                          <div className={styles.analyticsCardHeader}>
                            <span className={styles.analyticsProjectName}>{item.project}</span>
                            <span className={styles.analyticsStatusBadge} style={{ color: statusColor, background: statusColor + '18' }}>
                              {item.status}
                            </span>
                          </div>
                          <div className={styles.analyticsProgressRow}>
                            <div className={styles.analyticsProgressBar}>
                              <div className={styles.analyticsProgressFill} style={{ width: `${item.progress}%`, background: statusColor }} />
                            </div>
                            <span className={styles.analyticsProgressPct}>{item.progress}%</span>
                          </div>
                          <div className={styles.analyticsMetaRow}>
                            <span><Clock size={11} /> {item.time}</span>
                            {item.score !== null && <span><Award size={11} /> Score: {item.score}/100</span>}
                            {item.date && <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>{item.date}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
              {drawerTab === 'edit' && (
                <button type="submit" form="listener-form" className={styles.btnPrimary}>
                  {editingId ? 'Save' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Real Import Modal ── */}
      {isImportModalOpen && (
        <div className={styles.importOverlay} onClick={closeImportModal}>
          <div className={styles.importModalNew} onClick={(e) => e.stopPropagation()}>
            <div className={styles.importModalHeader}>
              <h2 className={styles.importModalTitle}>Import Listeners</h2>
              <button className={styles.importModalCloseBtn} onClick={closeImportModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {!isImporting && !importResult && (
              <>
                <div className={styles.importTabs}>
                  <button
                    className={`${styles.importTab} ${importTab === 'csv' ? styles.importTabActive : ''}`}
                    onClick={() => setImportTab('csv')}
                  >
                    <FileSpreadsheet size={16} /> XLS / CSV
                  </button>
                  <button
                    className={`${styles.importTab} ${importTab === 'pdf' ? styles.importTabActive : ''}`}
                    onClick={() => setImportTab('pdf')}
                  >
                    <FileText size={16} /> CV Files
                  </button>
                </div>

                <div
                  className={`${styles.importDropzoneArea} ${isDragging ? styles.importDropzoneAreaActive : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleImportDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={32} style={{ color: '#64748b' }} />
                  <div>
                    <div className={styles.importDropzoneText}>
                      Drop XLS/XLSX/CSV file or click to browse
                    </div>
                    <div className={styles.importDropzoneSubtext}>
                      Columns: Name, Email, Phone, Position, Company, Country, LinkedIn
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.importHiddenInput}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button className={styles.btnSecondary} onClick={closeImportModal}>Cancel</button>
                </div>
              </>
            )}

            {isImporting && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <UploadCloud size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', animation: 'pulse 2s infinite' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Processing File...
                </h3>
                <div className={styles.importProgressBar} style={{ marginBottom: '0.5rem', background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                  <div className={styles.importProgressFill} style={{ width: `${importProgress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.2s' }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{importProgress}% complete</div>
              </div>
            )}

            {importResult && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle size={56} style={{ color: '#10b981', margin: '0 auto 1rem', display: 'block' }} />
                <h2 className={styles.importTitle} style={{ color: '#10b981', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Import Complete!</h2>
                <p className={styles.importSubtitle} style={{ marginBottom: '1.5rem' }}>
                  <strong>{importResult.success}</strong> listener{importResult.success !== 1 ? 's' : ''} successfully imported
                </p>
                {importResult.errors > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.85rem', margin: '0 0 1.5rem', color: '#ef4444', fontSize: '0.85rem', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>{importResult.errors} record{importResult.errors !== 1 ? 's' : ''} skipped</strong>
                      <br />This may be due to missing required fields or duplicate emails.
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button className={styles.btnSecondary} onClick={() => { setImportResult(null) }}>
                    Import Another
                  </button>
                  <button className={styles.btnPrimary} onClick={closeImportModal}>
                    View Listeners
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {listenerToDelete && (
        <div className={styles.modalOverlay} onClick={() => setListenerToDelete(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '1.5rem' }}>
            <h2 className={styles.modalTitle} style={{ marginBottom: '1rem', border: 'none', padding: 0 }}>Confirm Deletion</h2>
            <div style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to delete this listener? Historical data will be archived.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className={styles.btnSecondary} onClick={() => setListenerToDelete(null)}>Cancel</button>
              <button className={styles.btnPrimary} style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
