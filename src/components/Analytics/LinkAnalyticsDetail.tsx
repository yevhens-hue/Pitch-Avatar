'use client'

import React, { useState, useEffect, useMemo } from 'react'
import styles from './LinkAnalyticsDetail.module.css'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Download, Search, X, Users, Clock, Link2,
  Phone, CalendarClock, User, ChevronRight, ChevronLeft as ChevLeft, RefreshCw,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ListenerRow {
  id: string
  firstName: string
  country: string
  dateTimeEntered: string
  slidesSeen: number
  timeSpent: string
  calledPresenter: number
  reactions: number
  chatMessageSent: number
  presenterConnected: number
}

interface DetailData {
  id: string
  title: string
  presenter: string
  totalListeners: number
  avgSessionTime: string
  leadsGenerated: number
  callPresenterClicks: number
  scheduleMeetingClicks: number
  listeners: ListenerRow[]
  performance: {
    completedBy: number
    interactionsWithPresenter: number
    reactions: number
    goalsAchieved: number
  }
  slideDropoff: number[]
}

// ── Circular progress ring ─────────────────────────────────────────────────────
function CircleProgress({ value, label, desc }: { value: number; label: string; desc: string }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const isActive = value > 0
  return (
    <div className={styles.circleCard}>
      <div className={styles.circleLabel}>{label}:</div>
      <div className={styles.circleWrapper}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e8edf2" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={isActive ? '#2563eb' : '#d1d5db'}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="700" fill={isActive ? '#1e40af' : '#6b7280'}>
            {value}%
          </text>
        </svg>
      </div>
      <div className={styles.circleDesc}>{desc}</div>
    </div>
  )
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
function SlideDropoffChart({ data }: { data: number[] }) {
  const maxVal = Math.max(...data, 1)
  const yTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  const chartH = 260
  const chartW = 900
  const paddingL = 46
  const paddingB = 28
  const barW = Math.min(32, (chartW - paddingL) / data.length - 8)

  return (
    <div className={styles.chartWrapper}>
      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + paddingB}`} style={{ overflow: 'visible' }}>
        {yTicks.map(tick => {
          const y = chartH - (tick / maxVal) * chartH
          return (
            <g key={tick}>
              <line x1={paddingL} y1={y} x2={chartW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={paddingL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{tick}%</text>
            </g>
          )
        })}
        {data.map((val, i) => {
          const barH = (val / maxVal) * chartH
          const xStep = (chartW - paddingL) / data.length
          const x = paddingL + i * xStep + xStep / 2 - barW / 2
          const y = chartH - barH
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill="#2563eb" rx="3" opacity="0.85" />
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fill="#6b7280">{i + 1}</text>
            </g>
          )
        })}
        <line x1={paddingL} y1={chartH} x2={chartW} y2={chartH} stroke="#e5e7eb" strokeWidth="1" />
      </svg>
      <div className={styles.chartAxisLabels}>
        <span>y axis: listeners percent</span>
        <span>x axis: presentation slice</span>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
interface LinkAnalyticsDetailProps {
  id: string
}

const LinkAnalyticsDetail: React.FC<LinkAnalyticsDetailProps> = ({ id }) => {
  const router = useRouter()
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [scriptMode, setScriptMode] = useState<'short' | 'pitch'>('short')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setApiError(null)
      try {
        const res = await fetch(`/api/analytics/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setApiError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const filtered = useMemo(() =>
    (data?.listeners || []).filter(l =>
      !search ||
      l.firstName.toLowerCase().includes(search.toLowerCase()) ||
      l.country.toLowerCase().includes(search.toLowerCase())
    ), [data, search])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
        Loading analytics…
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>
        {apiError ? `Error: ${apiError}` : 'No data found for this presentation.'}
        <br />
        <button onClick={() => router.back()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>

      {/* ── Title + breadcrumb ─────────────────────────────────────────────── */}
      <div className={styles.titleRow}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Back">
          <ChevronLeft size={16} />
        </button>
        <h1 className={styles.title}>{data.title}</h1>
      </div>
      <div className={styles.breadcrumb}>
        <Link2 size={12} style={{ color: '#2563eb' }} />
        <span className={styles.breadcrumbLink} onClick={() => router.back()}>{data.title}</span>
      </div>

      {apiError && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', color: '#92400e', fontSize: '0.8rem' }}>
          ⚠️ Using partial data — some fields unavailable: {apiError}
        </div>
      )}

      {/* ── Top stat cards ─────────────────────────────────────────────────── */}
      <div className={styles.statCards}>
        <div className={styles.statCard}>
          <div className={styles.statCardLabel}>Presenter:</div>
          <div className={styles.statCardValue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className={styles.presenterAvatar}><User size={13} /></div>
            {data.presenter}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardLabel}>Total number of listeners:</div>
          <div className={styles.statCardValue}>
            <Users size={16} style={{ color: '#6b7280' }} /> {data.totalListeners}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardLabel}>Average session time:</div>
          <div className={styles.statCardValue}>
            <Clock size={16} style={{ color: '#6b7280' }} /> {data.avgSessionTime}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardLabel}>Leads generated:</div>
          <div className={styles.statCardValue}>{data.leadsGenerated}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardLabel}>Call presenter clicks count:</div>
          <div className={styles.statCardValue}>
            <Phone size={14} style={{ color: '#6b7280' }} /> {data.callPresenterClicks}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statCardLabel}>Schedule meeting clicks count:</div>
          <div className={styles.statCardValue}>
            <CalendarClock size={14} style={{ color: '#6b7280' }} /> {data.scheduleMeetingClicks}
          </div>
        </div>
      </div>

      {/* ── Listeners report ───────────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Listeners report</h2>
          <button className={styles.downloadLink} aria-label="Download listeners table">
            <Download size={13} /> Download table as
          </button>
        </div>

        <div className={styles.tableControls}>
          <div className={styles.searchWrapper}>
            <Search size={13} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              aria-label="Search listeners"
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
                <X size={12} />
              </button>
            )}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={styles.pageSizeLabel}>Rows per page:</span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              aria-label="Rows per page"
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className={styles.paginationInfo}>
              {filtered.length === 0 ? '0' : `${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)}`} из {filtered.length}
            </span>
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
              <ChevLeft size={13} />
            </button>
            <button className={styles.pageArrow} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Next page">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>First name</th>
                <th className={styles.th}>Country</th>
                <th className={styles.th}>Date &amp; time entered</th>
                <th className={styles.th}>Slides seen</th>
                <th className={styles.th}>Time spent</th>
                <th className={styles.th}>Called presenter</th>
                <th className={styles.th}>Reactions</th>
                <th className={styles.th}>Chat message sent</th>
                <th className={styles.th}>Presenter connected</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={9} className={styles.emptyCell}>No listeners found</td></tr>
              ) : paged.map(l => (
                <tr key={l.id} className={styles.tr}>
                  <td className={styles.td}>{l.firstName}</td>
                  <td className={styles.td}>{l.country}</td>
                  <td className={styles.td} style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{l.dateTimeEntered}</td>
                  <td className={styles.tdNum}>{l.slidesSeen}</td>
                  <td className={styles.tdNum} style={{ fontFamily: 'monospace' }}>{l.timeSpent}</td>
                  <td className={styles.tdNum}>{l.calledPresenter}</td>
                  <td className={styles.tdNum}>{l.reactions}</td>
                  <td className={styles.tdNum}>{l.chatMessageSent}</td>
                  <td className={styles.tdNum}>{l.presenterConnected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Link performance circles ───────────────────────────────────────── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Link performance: {data.title}</h2>
        <div className={styles.circlesRow}>
          <CircleProgress
            value={data.performance.completedBy}
            label="Completed by"
            desc="% of listeners who stayed until the end of the presentation"
          />
          <CircleProgress
            value={data.performance.interactionsWithPresenter}
            label="Interactions with the presenter"
            desc="% of listeners who called the presenter or sent chat messages"
          />
          <CircleProgress
            value={data.performance.reactions}
            label="Reactions"
            desc="% of listeners who left at least one reaction on the slides"
          />
          <CircleProgress
            value={data.performance.goalsAchieved}
            label="Goals achieved"
            desc="% of listeners who achieved the goal"
          />
        </div>
      </div>

      {/* ── Where listeners stopped ────────────────────────────────────────── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Where listeners stopped</h2>
        <div className={styles.scriptToggleRow}>
          <span className={styles.scriptToggleLabel}>Short/Long script</span>
          <button
            className={`${styles.toggleSwitch} ${scriptMode === 'pitch' ? styles.toggleSwitchOn : ''}`}
            onClick={() => setScriptMode(m => m === 'short' ? 'pitch' : 'short')}
            aria-label="Toggle script mode"
          >
            <span className={styles.toggleThumb} />
          </button>
          <span className={styles.scriptToggleLabel}>Pitch</span>
        </div>
        <SlideDropoffChart data={data.slideDropoff} />
      </div>

    </div>
  )
}

export default LinkAnalyticsDetail
