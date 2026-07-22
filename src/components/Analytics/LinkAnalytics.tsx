'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import styles from './LinkAnalytics.module.css'
import {
  Search, Download, Link2, Users, MonitorPlay, Clock, CheckSquare,
  ArrowUpDown, ChevronLeft, ChevronRight, X, List, LayoutGrid, Columns, LayoutList,
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

// ── Mock data (mirrors the real data from the screenshot) ──────────────────────
const MOCK_ANALYTICS: AnalyticsRow[] = [
  { id: '1', presentationTitle: 'Hybrid_Widget_UA (2)', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-07-14', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 1, listenerCalledPresenter: 0, slidesSeen: 6, avgTimeSpent: '00:01:08', lastViewed: '16/07/2026, 14:21:28', presenterConnectionRate: '100%', goalsActivated: 0 },
  { id: '2', presentationTitle: 'chat avatar (16.07.2026)', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-07-16', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 1, listenerCalledPresenter: 0, slidesSeen: 8, avgTimeSpent: '00:03:08', lastViewed: '16/07/2026, 13:17:15', presenterConnectionRate: '100%', goalsActivated: 0 },
  { id: '3', presentationTitle: 'Chat Avatar (03.05.2026)', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-05-03', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:02:40', lastViewed: '12/07/2026, 13:31:42', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '4', presentationTitle: 'Widget_test_dit_dita (8)', author: 'Yevhen Shaforostov', presenter: 'Yevhen Shaforostov', dateCreated: '2026-07-09', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:21:21', lastViewed: '04/07/2026, 13:47:08', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '5', presentationTitle: 'Chat Avatar (08.07.2026)', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-07-08', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:22:12', lastViewed: '08/07/2026, 15:42:07', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '6', presentationTitle: 'Chat Avatar (07.07.2026)', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-07-07', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:10:48', lastViewed: '07/07/2026, 16:22:04', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '7', presentationTitle: 'Chat Avatar (07.07.2026) B', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-07-07', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:38:30', lastViewed: '07/07/2026, 13:04:40', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '8', presentationTitle: 'Chat Avatar (30.06.2026)', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-07-31', source: 'Web', linkOpened: 2, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:40:46', lastViewed: '07/07/2026, 13:04:43', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '9', presentationTitle: 'Probation presentation (Shaforostov)', author: 'Yevhen Shaforostov', presenter: 'Yevhen Shaforostov', dateCreated: '2026-06-30', source: 'Web', linkOpened: 4, formsFilled: 0, presenterConnected: 0, chats: 28, listenerCalledPresenter: 0, slidesSeen: 0, avgTimeSpent: '31:53:49', lastViewed: '30/06/2026, 20:52:28', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '10', presentationTitle: 'probate e-presentation', author: 'Yevhen Shaforostov', presenter: 'Yevhen Shaforostov', dateCreated: '2026-06-18', source: 'Web', linkOpened: 1, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 1, slidesSeen: 0, avgTimeSpent: '00:28:09', lastViewed: '30/06/2026, 18:13:31', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '11', presentationTitle: 'Sales Demo Q2 2026', author: 'Yevhen Shaforostov', presenter: 'Yevhen Shaforostov', dateCreated: '2026-06-10', source: 'Web', linkOpened: 3, formsFilled: 1, presenterConnected: 1, chats: 2, listenerCalledPresenter: 0, slidesSeen: 12, avgTimeSpent: '00:15:22', lastViewed: '25/06/2026, 10:11:08', presenterConnectionRate: '33%', goalsActivated: 1 },
  { id: '12', presentationTitle: 'Onboarding Flow 2026', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-05-20', source: 'Web', linkOpened: 6, formsFilled: 2, presenterConnected: 0, chats: 5, listenerCalledPresenter: 0, slidesSeen: 24, avgTimeSpent: '00:08:44', lastViewed: '15/06/2026, 09:30:00', presenterConnectionRate: '0%', goalsActivated: 2 },
  { id: '13', presentationTitle: 'Widget Pitch EN', author: 'Yevhen Shaforostov', presenter: 'Yevhen Shaforostov', dateCreated: '2026-05-15', source: 'Email', linkOpened: 2, formsFilled: 0, presenterConnected: 0, chats: 0, listenerCalledPresenter: 0, slidesSeen: 5, avgTimeSpent: '00:04:10', lastViewed: '10/06/2026, 14:00:00', presenterConnectionRate: '0%', goalsActivated: 0 },
  { id: '14', presentationTitle: 'HR Onboarding Essentials', author: 'Yevhen Shaforostov', presenter: 'Ai-chat-avatar', dateCreated: '2026-04-01', source: 'Web', linkOpened: 10, formsFilled: 4, presenterConnected: 2, chats: 8, listenerCalledPresenter: 1, slidesSeen: 40, avgTimeSpent: '00:12:00', lastViewed: '01/06/2026, 11:00:00', presenterConnectionRate: '20%', goalsActivated: 4 },
  { id: '15', presentationTitle: 'Annual Compliance Cert', author: 'Yevhen Shaforostov', presenter: 'Yevhen Shaforostov', dateCreated: '2026-03-15', source: 'Email', linkOpened: 5, formsFilled: 5, presenterConnected: 0, chats: 0, listenerCalledPresenter: 0, slidesSeen: 20, avgTimeSpent: '00:35:00', lastViewed: '20/05/2026, 16:00:00', presenterConnectionRate: '0%', goalsActivated: 5 },
]

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

type SortKey = keyof AnalyticsRow
type SortDir = 'asc' | 'desc'

// ── Main component ─────────────────────────────────────────────────────────────
const LinkAnalytics: React.FC = () => {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [reportGenerated, setReportGenerated] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<SortKey>('dateCreated')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'compact'>('table')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const handleGenerate = () => {
    setReportGenerated(true)
    setPage(1)
  }

  const handleClear = () => {
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setReportGenerated(false)
    setPage(1)
  }

  // ── Filtered & sorted data ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = [...MOCK_ANALYTICS]
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.presentationTitle.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.presenter.toLowerCase().includes(q)
      )
    }
    rows.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const data = MOCK_ANALYTICS
    const totalLinks = data.reduce((s, r) => s + r.linkOpened, 0)
    const totalListeners = data.reduce((s, r) => s + r.linkOpened, 0) // approximation
    const avgVisits = Math.round(totalListeners / (data.length || 1))
    const completed = data.filter(r => r.slidesSeen > 0).length
    // avg time in seconds
    const parseTime = (t: string) => {
      const parts = t.split(':').map(Number)
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)
    }
    const avgSecs = Math.round(data.reduce((s, r) => s + parseTime(r.avgTimeSpent), 0) / data.length)
    const h = Math.floor(avgSecs / 3600).toString().padStart(2, '0')
    const m = Math.floor((avgSecs % 3600) / 60).toString().padStart(2, '0')
    const s = (avgSecs % 60).toString().padStart(2, '0')
    return { totalLinks, totalListeners, avgVisits, completed, avgTime: `${h}:${m}:${s}` }
  }, [])

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const header = 'Presentation title,Author,Presenter,Date created,Source,Link opened,Forms filled,Presenter connected,Chats,Listener called the presenter,Slides seen,Average time spent,Last viewed,Presenter connection rate,Goals activated'
    const rows = filtered.map(r =>
      `"${r.presentationTitle}","${r.author}","${r.presenter}","${r.dateCreated}","${r.source}",${r.linkOpened},${r.formsFilled},${r.presenterConnected},${r.chats},${r.listenerCalledPresenter},${r.slidesSeen},"${r.avgTimeSpent}","${r.lastViewed}","${r.presenterConnectionRate}",${r.goalsActivated}`
    )
    const csv = header + '\n' + rows.join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `link-analytics${dateFrom ? `-${dateFrom}` : ''}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const SortTh = ({ label, sortK }: { label: string; sortK: SortKey }) => (
    <th
      className={styles.th}
      onClick={() => handleSort(sortK)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {label}
        <ArrowUpDown size={11} style={{ opacity: sortKey === sortK ? 1 : 0.35, color: sortKey === sortK ? '#0076ff' : 'inherit' }} />
      </span>
    </th>
  )

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
        <button className={styles.btnPrimary} onClick={handleGenerate}>
          GENERATE REPORT
        </button>
        <button className={styles.btnGhost} onClick={handleClear}>
          CLEAR REPORT
        </button>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Link2 size={18} /></div>
          <div>
            <div className={styles.statLabel}>Links generated</div>
            <div className={styles.statValue}>{stats.totalLinks}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={18} /></div>
          <div>
            <div className={styles.statLabel}>Listeners visited presentations</div>
            <div className={styles.statValue}>{stats.totalListeners}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><MonitorPlay size={18} /></div>
          <div>
            <div className={styles.statLabel}>Listeners visits/session</div>
            <div className={styles.statValue}>{stats.avgVisits}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><CheckSquare size={18} /></div>
          <div>
            <div className={styles.statLabel}>Least links completed</div>
            <div className={styles.statValue}>{stats.completed}</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Clock size={18} /></div>
          <div>
            <div className={styles.statLabel}>Average time spent</div>
            <div className={styles.statValue}>{stats.avgTime}</div>
          </div>
        </div>
      </div>

      {/* ── Table controls ───────────────────────────────────────────────────── */}
      <div className={styles.tableControls}>
        <div className={styles.searchWrapper}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            aria-label="Search analytics"
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
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
            <button
              className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Table view"
              aria-label="Table view"
            >
              <List size={14} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'compact' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('compact')}
              title="Compact view"
              aria-label="Compact view"
            >
              <LayoutList size={14} />
            </button>
            <button className={styles.viewBtn} title="Grid view" aria-label="Grid view">
              <LayoutGrid size={14} />
            </button>
            <button className={styles.viewBtn} title="Columns view" aria-label="Columns view">
              <Columns size={14} />
            </button>
          </div>

          <div className={styles.pageSizeRow}>
            <span className={styles.pageSizeLabel}>Rows per page:</span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <span className={styles.paginationInfo}>
            {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <button
            className={styles.pageArrow}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            className={styles.pageArrow}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <SortTh label="Presentation title" sortK="presentationTitle" />
              <SortTh label="Author" sortK="author" />
              <SortTh label="Presenter" sortK="presenter" />
              <SortTh label="Date created" sortK="dateCreated" />
              <SortTh label="Source" sortK="source" />
              <SortTh label="Link opened" sortK="linkOpened" />
              <SortTh label="Forms filled" sortK="formsFilled" />
              <SortTh label="Presenter connected" sortK="presenterConnected" />
              <SortTh label="Chats" sortK="chats" />
              <SortTh label="Listener called the presenter" sortK="listenerCalledPresenter" />
              <SortTh label="Slides seen" sortK="slidesSeen" />
              <SortTh label="Average time spent" sortK="avgTimeSpent" />
              <SortTh label="Last viewed" sortK="lastViewed" />
              <SortTh label="Presenter connection rate" sortK="presenterConnectionRate" />
              <SortTh label="Goals activated" sortK="goalsActivated" />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={15} className={styles.emptyCell}>No data found</td>
              </tr>
            ) : paged.map(r => (
              <tr key={r.id} className={styles.tr} onClick={() => router.push(`/analytics/${r.id}`)} style={{ cursor: 'pointer' }}>
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
        <span className={styles.pageSizeLabel}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={styles.pageArrow}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              className={`${styles.pageNumBtn} ${n === page ? styles.pageNumBtnActive : ''}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          {totalPages > 7 && <span style={{ color: '#94a3b8' }}>…</span>}
          <button
            className={styles.pageArrow}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

    </div>
  )
}

export default LinkAnalytics
