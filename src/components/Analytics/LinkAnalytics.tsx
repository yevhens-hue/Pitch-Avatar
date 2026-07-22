'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LinkAnalytics.module.css'
import {
  Search, Download, Link2, Users, MonitorPlay, Clock, CheckSquare,
  ArrowUpDown, ChevronLeft, ChevronRight, X, List, LayoutGrid, Columns, LayoutList,
  RefreshCw,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
interface AnalyticsRow {
  id: string
  presentationTitle: string
  author: string
  presenter: string
  dateCreated: string
  source: string
  linkOpened: number
  formsFilled: number
  presenterConnected: number
  chats: number
  listenerCalledPresenter: number
  slidesSeen: number
  avgTimeSpent: string
  lastViewed: string
  presenterConnectionRate: string
  goalsActivated: number
}

interface AnalyticsStats {
  totalLinks: number
  totalListeners: number
  avgVisits: number
  completed: number
  avgTime: string
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// ── Main component ─────────────────────────────────────────────────────────────
const LinkAnalytics: React.FC = () => {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table')

  const [rows, setRows] = useState<AnalyticsRow[]>([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<AnalyticsStats>({ totalLinks: 0, totalListeners: 0, avgVisits: 0, completed: 0, avgTime: '00:00' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (opts?: { resetPage?: boolean }) => {
    setLoading(true)
    setError(null)
    const currentPage = opts?.resetPage ? 1 : page
    if (opts?.resetPage) setPage(1)

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
        search,
        dateFrom,
        dateTo,
      })
      const res = await fetch(`/api/analytics?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRows(data.rows || [])
      setTotal(data.total || 0)
      setStats(data.stats || { totalLinks: 0, totalListeners: 0, avgVisits: 0, completed: 0, avgTime: '00:00' })
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, dateFrom, dateTo])

  // Initial load
  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const handleGenerate = () => fetchData({ resetPage: true })
  const handleClear = () => {
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setPage(1)
    setTimeout(() => fetchData({ resetPage: true }), 0)
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const header = 'Presentation title,Author,Presenter,Date created,Source,Link opened,Forms filled,Presenter connected,Chats,Listener called the presenter,Slides seen,Average time spent,Last viewed,Presenter connection rate,Goals activated'
    const csvRows = rows.map(r =>
      `"${r.presentationTitle}","${r.author}","${r.presenter}","${r.dateCreated}","${r.source}",${r.linkOpened},${r.formsFilled},${r.presenterConnected},${r.chats},${r.listenerCalledPresenter},${r.slidesSeen},"${r.avgTimeSpent}","${r.lastViewed}","${r.presenterConnectionRate}",${r.goalsActivated}`
    )
    const csv = header + '\n' + csvRows.join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `link-analytics.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className={styles.container}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <h1 className={styles.title}>Link analytics</h1>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          aria-label="From date"
        />
        <span className={styles.toLabel}>to</span>
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          aria-label="To date"
        />
        <button className={styles.btnPrimary} onClick={handleGenerate} disabled={loading}>
          {loading ? 'Loading…' : 'GENERATE REPORT'}
        </button>
        <button className={styles.btnGhost} onClick={handleClear}>
          CLEAR REPORT
        </button>
        <button className={styles.btnGhost} onClick={() => fetchData()} title="Refresh" aria-label="Refresh">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Link2 size={18} /></div>
          <div>
            <div className={styles.statLabel}>Links generated</div>
            <div className={styles.statValue}>{loading ? '…' : stats.totalLinks}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={18} /></div>
          <div>
            <div className={styles.statLabel}>Listeners visited presentations</div>
            <div className={styles.statValue}>{loading ? '…' : stats.totalListeners}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><MonitorPlay size={18} /></div>
          <div>
            <div className={styles.statLabel}>Listeners visits/session</div>
            <div className={styles.statValue}>{loading ? '…' : stats.avgVisits}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><CheckSquare size={18} /></div>
          <div>
            <div className={styles.statLabel}>Least links completed</div>
            <div className={styles.statValue}>{loading ? '…' : stats.completed}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Clock size={18} /></div>
          <div>
            <div className={styles.statLabel}>Average time spent</div>
            <div className={styles.statValue}>{loading ? '…' : stats.avgTime}</div>
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.85rem' }}>
          ⚠️ Error loading data: {error}
        </div>
      )}

      {/* ── Table controls ───────────────────────────────────────────────────── */}
      <div className={styles.tableControls}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData({ resetPage: true })}
            aria-label="Search analytics"
          />
          {search && (
            <button className={styles.searchClear} onClick={() => { setSearch(''); setTimeout(() => fetchData({ resetPage: true }), 0) }} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </div>

        <div className={styles.tableRightControls}>
          <button className={styles.iconBtn} onClick={handleExportCSV} title="Download table as CSV">
            <Download size={15} />
            <span style={{ fontSize: '0.8rem' }}>Download table as</span>
          </button>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('table')} aria-label="Table view">
              <List size={14} />
            </button>
            <button className={`${styles.viewBtn} ${viewMode === 'compact' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('compact')} aria-label="Compact view">
              <LayoutList size={14} />
            </button>
            <button className={styles.viewBtn} aria-label="Grid view"><LayoutGrid size={14} /></button>
            <button className={styles.viewBtn} aria-label="Columns view"><Columns size={14} /></button>
          </div>

          <div className={styles.pageSizeRow}>
            <span className={styles.pageSizeLabel}>Rows per page:</span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <span className={styles.paginationInfo}>
            {total === 0 ? '0' : `${Math.min((page - 1) * pageSize + 1, total)}–${Math.min(page * pageSize, total)}`} of {total}
          </span>
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} aria-label="Previous page">
            <ChevronLeft size={15} />
          </button>
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading} aria-label="Next page">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {(['Presentation title','Author','Presenter','Date created','Source','Link opened','Forms filled','Presenter connected','Chats','Listener called the presenter','Slides seen','Average time spent','Last viewed','Presenter connection rate','Goals activated'] as const).map(label => (
                <th key={label} className={styles.th}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={15} className={styles.emptyCell}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={15} className={styles.emptyCell}>No data found</td>
              </tr>
            ) : rows.map(r => (
              <tr
                key={r.id}
                className={styles.tr}
                onClick={() => router.push(`/analytics/${r.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td className={styles.td} style={{ fontWeight: 500, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.presentationTitle}>
                  {r.presentationTitle}
                </td>
                <td className={styles.td}>{r.author}</td>
                <td className={styles.td}>{r.presenter}</td>
                <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>{r.dateCreated}</td>
                <td className={styles.td}>{r.source}</td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.linkOpened}</td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.formsFilled}</td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.presenterConnected}</td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.chats}</td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.listenerCalledPresenter}</td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.slidesSeen}</td>
                <td className={`${styles.td} ${styles.numCell}`} style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.avgTimeSpent}</td>
                <td className={styles.td} style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748b' }}>{r.lastViewed}</td>
                <td className={`${styles.td} ${styles.numCell}`}>
                  <span style={{ color: r.presenterConnectionRate === '0%' ? '#94a3b8' : '#10b981', fontWeight: 600 }}>
                    {r.presenterConnectionRate}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.numCell}`}>{r.goalsActivated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom pagination ────────────────────────────────────────────────── */}
      <div className={styles.bottomPagination}>
        <span className={styles.pageSizeLabel}>{total} result{total !== 1 ? 's' : ''}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} aria-label="Previous page">
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
            <button key={n} className={`${styles.pageNumBtn} ${n === page ? styles.pageNumBtnActive : ''}`} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
          {totalPages > 7 && <span style={{ color: '#94a3b8' }}>…</span>}
          <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading} aria-label="Next page">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default LinkAnalytics
