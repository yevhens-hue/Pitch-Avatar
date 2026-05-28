'use client'

import React, { useState, useMemo } from 'react'
import styles from './AnalyticsDashboard.module.css'
import {
  Search, Download, BarChart2, CheckSquare, Clock,
  Award, FileDown, RefreshCw, ChevronDown, X, Users,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface AssignmentResult {
  id: string
  assignment: string
  listenerName: string
  listenerEmail: string
  listenerGroup?: string
  project: string
  course?: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
  progress: number
  timeSpent: string
  score: number | null
  completedAt: string | null
  startedAt: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#ec4899,#d946ef)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#3b82f6,#2563eb)',
]
const getAvatarStyle = (seed: string) => {
  let h = 0; for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
  return { background: AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length] }
}

const MOCK_RESULTS: AssignmentResult[] = [
  { id: 'r1', assignment: 'HR-001', listenerName: 'Anna Kowalski', listenerEmail: 'anna@acme.com', listenerGroup: 'Q1 Cohort', project: 'HR Onboarding Essentials', course: 'HR Onboarding 2024', status: 'Completed', progress: 100, timeSpent: '18 min', score: 92, completedAt: '2026-05-15', startedAt: '2026-05-12' },
  { id: 'r2', assignment: 'HR-002', listenerName: 'Bob Smith', listenerEmail: 'bob@techco.com', listenerGroup: 'Q1 Cohort', project: 'HR Onboarding Essentials', course: 'HR Onboarding 2024', status: 'Completed', progress: 100, timeSpent: '22 min', score: 78, completedAt: '2026-05-14', startedAt: '2026-05-10' },
  { id: 'r3', assignment: 'SA-001', listenerName: 'Chen Wei', listenerEmail: 'chen@startup.io', project: 'Sales Qualification Q2', status: 'In Progress', progress: 60, timeSpent: '12 min', score: null, completedAt: null, startedAt: '2026-05-20' },
  { id: 'r4', assignment: 'CO-001', listenerName: 'Marie Dupont', listenerEmail: 'marie@corp.fr', listenerGroup: 'Compliance 2026', project: 'Annual Compliance Certification', course: 'Annual Compliance Certification', status: 'Completed', progress: 100, timeSpent: '35 min', score: 95, completedAt: '2026-05-10', startedAt: '2026-05-08' },
  { id: 'r5', assignment: 'HR-003', listenerName: 'Ivan Petrov', listenerEmail: 'ivan@corp.ru', project: 'HR Onboarding Essentials', status: 'Pending', progress: 0, timeSpent: '—', score: null, completedAt: null, startedAt: '2026-05-25' },
  { id: 'r6', assignment: 'SA-002', listenerName: 'Sarah Johnson', listenerEmail: 'sarah@startup.com', project: 'Sales Qualification Q2', status: 'Failed', progress: 45, timeSpent: '9 min', score: 38, completedAt: '2026-05-22', startedAt: '2026-05-21' },
  { id: 'r7', assignment: 'TR-001', listenerName: 'Marta Nowak', listenerEmail: 'marta@acme.pl', listenerGroup: 'Q1 Cohort', project: 'Technical Interview Process', course: 'Technical Interview Process', status: 'Completed', progress: 100, timeSpent: '28 min', score: 88, completedAt: '2026-05-18', startedAt: '2026-05-17' },
  { id: 'r8', assignment: 'HR-004', listenerName: 'Luca Ferrari', listenerEmail: 'luca@corp.it', project: 'HR Onboarding Essentials', status: 'In Progress', progress: 40, timeSpent: '7 min', score: null, completedAt: null, startedAt: '2026-05-26' },
]

const ALL_COLUMNS = [
  { key: 'assignment', label: 'Assignment' },
  { key: 'listenerName', label: 'Listener / Group' },
  { key: 'project', label: 'Project / Course' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
  { key: 'timeSpent', label: 'Time Spent' },
  { key: 'score', label: 'Score' },
  { key: 'startedAt', label: 'Start Date' },
  { key: 'completedAt', label: 'Completed' },
]

// ── Main component ────────────────────────────────────────────────────────────
const AnalyticsDashboard: React.FC = () => {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('2026-05-01')
  const [dateTo, setDateTo] = useState('2026-05-31')
  const [showGroups, setShowGroups] = useState(false)
  const [showCourses, setShowCourses] = useState(false)
  const [showColumnsMenu, setShowColumnsMenu] = useState(false)
  const [activeColumns, setActiveColumns] = useState<string[]>(['assignment', 'listenerName', 'project', 'status', 'progress', 'timeSpent', 'score'])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleColumn = (key: string) => {
    setActiveColumns(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])
  }

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(r => r.id))

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return MOCK_RESULTS.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q || r.listenerName.toLowerCase().includes(q) || r.listenerEmail.toLowerCase().includes(q) || r.project.toLowerCase().includes(q) || r.assignment.toLowerCase().includes(q)
      return matchSearch
    })
  }, [search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: filtered.length,
    completed: filtered.filter(r => r.status === 'Completed').length,
    inProgress: filtered.filter(r => r.status === 'In Progress').length,
    avgScore: Math.round(filtered.filter(r => r.score !== null).reduce((s, r) => s + (r.score ?? 0), 0) / (filtered.filter(r => r.score !== null).length || 1)),
    failed: filtered.filter(r => r.status === 'Failed').length,
  }), [filtered])

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = filtered.map(r =>
      `"${r.assignment}","${r.listenerName}","${r.listenerEmail}","${r.project}","${r.status}","${r.progress}%","${r.timeSpent}","${r.score ?? ''}","${r.completedAt ?? ''}"`
    )
    const csv = 'Assignment,Listener,Email,Project,Status,Progress,Time Spent,Score,Completed At\n' + rows.join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `assignment-results-${dateFrom}-to-${dateTo}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const getStatusClass = (status: AssignmentResult['status']) => {
    if (status === 'In Progress') return styles.statusInProgress
    if (status === 'Completed')   return styles.statusCompleted
    if (status === 'Failed')      return styles.statusFailed
    return styles.statusPending
  }

  const STATUS_ICON: Record<string, string> = {
    'Completed': '✓', 'In Progress': '⟳', 'Failed': '✗', 'Pending': '○'
  }

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Assignment Results</h1>
          <p className={styles.subtitle}>Track HR onboarding completion, scores, and engagement metrics across all assignments.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => setSelectedIds([])}>
            <RefreshCw size={15} /> Clear Report
          </button>
          <button className={styles.btnPrimary} onClick={handleExportCSV}>
            <FileDown size={15} /> Download CSV
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Assignments', value: stats.total, icon: <BarChart2 size={18} />, color: '#6366f1' },
          { label: 'Completed', value: stats.completed, icon: <CheckSquare size={18} />, color: '#10b981' },
          { label: 'In Progress', value: stats.inProgress, icon: <Clock size={18} />, color: '#3b82f6' },
          { label: 'Avg. Score', value: `${stats.avgScore}%`, icon: <Award size={18} />, color: '#f59e0b' },
          { label: 'Failed', value: stats.failed, icon: <X size={18} />, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterRow}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text" className={styles.searchInput}
              placeholder="Search by listener, project, assignment ID…"
              value={search} onChange={e => setSearch(e.target.value)}
              aria-label="Search results"
            />
          </div>
          <input type="date" className={styles.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} aria-label="Start date" />
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>to</span>
          <input type="date" className={styles.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} aria-label="End date" />

          {/* Columns dropdown */}
          <div className={styles.columnsDropdownWrapper}>
            <button className={styles.btnSecondary} onClick={() => setShowColumnsMenu(v => !v)} style={{ padding: '0.6rem 0.85rem' }}>
              <ChevronDown size={14} /> Columns ({activeColumns.length})
            </button>
            {showColumnsMenu && (
              <div className={styles.columnsDropdown}>
                {ALL_COLUMNS.map(col => (
                  <button key={col.key} type="button" className={styles.columnOption} onClick={() => toggleColumn(col.key)}>
                    <input type="checkbox" checked={activeColumns.includes(col.key)} onChange={() => {}} style={{ accentColor: 'var(--primary)', pointerEvents: 'none' }} />
                    {col.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.filterRow}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" className={styles.toggleInput} checked={showGroups} onChange={e => setShowGroups(e.target.checked)} />
            <Users size={14} /> Show Listeners in Groups
          </label>
          <label className={styles.toggleLabel}>
            <input type="checkbox" className={styles.toggleInput} checked={showCourses} onChange={e => setShowCourses(e.target.checked)} />
            <BarChart2 size={14} /> Show Projects in Courses
          </label>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {!filtered.length ? (
          <div className={styles.emptyState}>
            <BarChart2 size={48} style={{ color: '#cbd5e1' }} />
            <h3 className={styles.emptyStateTitle}>No results found</h3>
            <p className={styles.emptyStateDesc}>Try adjusting your search filters or date range.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox" className={styles.checkbox}
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll} aria-label="Select all"
                  />
                </th>
                {ALL_COLUMNS.filter(c => activeColumns.includes(c.key)).map(col => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={selectedIds.includes(r.id) ? { background: 'rgba(99,102,241,.03)' } : {}}>
                  <td>
                    <input
                      type="checkbox" className={styles.checkbox}
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      aria-label={`Select ${r.listenerName}`}
                    />
                  </td>
                  {activeColumns.includes('assignment') && (
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: 4 }}>{r.assignment}</span></td>
                  )}
                  {activeColumns.includes('listenerName') && (
                    <td>
                      <div className={styles.listenerCell}>
                        <div className={styles.listenerAvatar} style={getAvatarStyle(r.listenerEmail)}>
                          {r.listenerName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{r.listenerName}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{r.listenerEmail}</div>
                          {showGroups && r.listenerGroup && (
                            <div style={{ fontSize: '0.72rem', color: '#6366f1', marginTop: '0.15rem' }}>👥 {r.listenerGroup}</div>
                          )}
                        </div>
                      </div>
                    </td>
                  )}
                  {activeColumns.includes('project') && (
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.88rem', color: '#0f172a' }}>{r.project}</div>
                      {showCourses && r.course && (
                        <div style={{ fontSize: '0.72rem', color: '#6366f1', marginTop: '0.15rem' }}>📚 {r.course}</div>
                      )}
                    </td>
                  )}
                  {activeColumns.includes('status') && (
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(r.status)}`}>
                        {STATUS_ICON[r.status]} {r.status}
                      </span>
                    </td>
                  )}
                  {activeColumns.includes('progress') && (
                    <td>
                      <div className={styles.progressCell}>
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{
                            width: `${r.progress}%`,
                            background: r.status === 'Completed' ? '#10b981' : r.status === 'Failed' ? '#ef4444' : '#3b82f6',
                          }} />
                        </div>
                        <span className={styles.progressPct}>{r.progress}%</span>
                      </div>
                    </td>
                  )}
                  {activeColumns.includes('timeSpent') && (
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#475569' }}><Clock size={13} />{r.timeSpent}</span></td>
                  )}
                  {activeColumns.includes('score') && (
                    <td>
                      {r.score !== null ? (
                        <span style={{ fontWeight: 700, color: r.score >= 70 ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                          {r.score}<span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#94a3b8' }}>/100</span>
                        </span>
                      ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                  )}
                  {activeColumns.includes('startedAt') && (
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{r.startedAt}</td>
                  )}
                  {activeColumns.includes('completedAt') && (
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{r.completedAt ?? '—'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer bar ── */}
      <div className={styles.footerBar}>
        <span className={styles.footerLeft}>
          {selectedIds.length > 0
            ? `${selectedIds.length} row${selectedIds.length !== 1 ? 's' : ''} selected`
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} · ${dateFrom} to ${dateTo}`}
        </span>
        <div className={styles.footerRight}>
          <button className={styles.btnSecondary} onClick={handleExportCSV} style={{ gap: '0.4rem' }}>
            <Download size={14} /> Export Table as CSV
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
