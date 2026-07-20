import React from 'react'
import {
  Link as LinkIcon, Edit3, Trash2, Video, Calendar,
  Settings, ClipboardCheck, BarChart2, Share2, GraduationCap,
  RefreshCw, FileText, Users, Copy, Plus, MoreHorizontal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import { Enrollment, ENROLLMENT_COLUMNS, ENROLLMENT_STATUS } from '@/types/listeners'
import { useToast } from '@/components/ui/ToastProvider'
import { useRouter } from 'next/navigation'

interface EnrollmentsTableProps {
  styles: any
  enrollments: Enrollment[]
  selectedIds: string[]
  visibleColumns: string[]
  isLoading: boolean
  isPending: boolean
  toggleSelectAll: () => void
  toggleSelect: (id: string) => void
  handleCopyLink: (id: string) => void
  handleOpenEdit: (enrollment: Enrollment) => void
  activeInlineStatusId: string | null
  setActiveInlineStatusId: (id: string | null) => void
  handleInlineStatusChange: (id: string, status: typeof ENROLLMENT_STATUS[number]) => void
  activeGearId: string | null
  setActiveGearId: (id: string | null) => void
  handleOpenManual: (enrollment: Enrollment) => void
  handleUpdateWebLink: () => void
  handleDelete: (id: string) => void
  handleDuplicate: (id: string) => void
  getStatusClass: (status: string) => string
  page: number
  setPage: (page: number) => void
  totalCount: number
  rowsPerPage: number
  setRowsPerPage: (n: number) => void
  sortBy: string
  setSortBy: (sortBy: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
  isFutureVersion: boolean
  hasActiveFilters?: boolean
}

export default function EnrollmentsTable({
  styles, enrollments, selectedIds, visibleColumns, isLoading, isPending,
  toggleSelectAll, toggleSelect, handleCopyLink, handleOpenEdit,
  activeInlineStatusId, setActiveInlineStatusId, handleInlineStatusChange,
  activeGearId, setActiveGearId, handleOpenManual, handleUpdateWebLink, handleDelete, handleDuplicate, getStatusClass,
  page, setPage, totalCount, rowsPerPage, setRowsPerPage, sortBy, setSortBy, sortOrder, setSortOrder, isFutureVersion, hasActiveFilters
}: EnrollmentsTableProps) {
  
  const { showToast } = useToast()
  const router = useRouter()

  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage))
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * rowsPerPage + 1
  const rangeEnd = Math.min(page * rowsPerPage, totalCount)

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('desc')
    }
  }

  return (
    <div className={styles.tableCard}>
      {!enrollments.length && !isPending && !isLoading ? (
        hasActiveFilters ? (
          <div className={styles.emptyState}>
            <ClipboardCheck size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 className={styles.emptyStateTitle} style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              No enrollments found
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Try adjusting your filters or search query to find what you&apos;re looking for.
            </p>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ClipboardCheck size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 className={styles.emptyStateTitle} style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1e293b' }}>Let&apos;s set up your first Enrollment</h3>
            
            <div style={{ display: 'flex', gap: '2rem', textAlign: 'left', marginBottom: '2rem', color: '#475569' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem' }}>1</div>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>Select Content</strong>
                <p style={{ fontSize: '0.85rem' }}>Choose a Project or Course you want to share.</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem' }}>2</div>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>Assign Listener</strong>
                <p style={{ fontSize: '0.85rem' }}>Pick a specific listener or an entire group.</p>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem' }}>3</div>
                <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem' }}>Share & Track</strong>
                <p style={{ fontSize: '0.85rem' }}>Generate the link and monitor progress.</p>
              </div>
            </div>

            <button className={styles.btnPrimary} onClick={() => handleOpenEdit({} as any)}>
              <Plus size={16} /> Create Enrollment
            </button>
          </div>
        )
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {isFutureVersion && (
                <th style={{ width: '40px', paddingRight: '0.5rem', paddingLeft: '1rem' }}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedIds.length === enrollments.length && enrollments.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
              )}
                {ENROLLMENT_COLUMNS.filter(col => visibleColumns.includes(col.id)).map(col => (
                  <th 
                    key={col.id} 
                    onClick={() => {
                      if (col.id === 'Name' || col.id === 'ListenerGroup' || col.id === 'ProjectCourse' || col.id === 'Status' || col.id === 'StartDate') {
                        const sortKeyMap: Record<string, string> = {
                          'Name': 'title',
                          'ListenerGroup': 'listenerName',
                          'ProjectCourse': 'projectTitle',
                          'Status': 'status',
                          'StartDate': 'start_date'
                        }
                        handleSort(sortKeyMap[col.id] || 'created_at')
                      }
                    }}
                    style={{ 
                      cursor: ['Name', 'ListenerGroup', 'ProjectCourse', 'Status', 'StartDate'].includes(col.id) ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {col.label}
                      {['Name', 'ListenerGroup', 'ProjectCourse', 'Status', 'StartDate'].includes(col.id) && (
                        <span style={{ opacity: sortBy === (
                          col.id === 'Name' ? 'title' : 
                          col.id === 'ListenerGroup' ? 'listenerName' : 
                          col.id === 'ProjectCourse' ? 'projectTitle' : 
                          col.id === 'Status' ? 'status' : 'start_date'
                        ) ? 1 : 0.3, fontSize: '0.7rem' }}>
                          {sortBy === (
                            col.id === 'Name' ? 'title' : 
                            col.id === 'ListenerGroup' ? 'listenerName' : 
                            col.id === 'ProjectCourse' ? 'projectTitle' : 
                            col.id === 'Status' ? 'status' : 'start_date'
                          ) && sortOrder === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isPending ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td colSpan={visibleColumns.length + (isFutureVersion ? 2 : 1)} style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '16px', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ width: '40%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                          <div style={{ width: '25%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                        </div>
                        <div style={{ width: '15%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ width: '10%', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id} className={selectedIds.includes(enrollment.id) ? styles.rowSelected : ''} style={{ cursor: 'pointer' }} onClick={() => handleOpenEdit(enrollment)}>
                  {isFutureVersion && (
                    <td style={{ paddingRight: '0.5rem', paddingLeft: '1rem' }} onClick={(e) => e.stopPropagation()}>
                      <input
                         type="checkbox"
                         className={styles.checkbox}
                         checked={selectedIds.includes(enrollment.id)}
                         onChange={() => toggleSelect(enrollment.id)}
                         aria-label={`Select ${enrollment.title}`}
                      />
                    </td>
                  )}
                  {visibleColumns.includes('Name') && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {enrollment.contentType === 'course' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                            <GraduationCap size={16} />
                          </div>
                        ) : enrollment.targetType === 'group' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#0061d6' }}>
                            <Users size={16} />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                            <FileText size={16} />
                          </div>
                        )}
                        <span className={styles.projectTitle}>
                          {enrollment.title && enrollment.title !== 'Enrollment' 
                            ? enrollment.title 
                            : `${enrollment.listenerName ? enrollment.listenerName + ' → ' : ''}${enrollment.projectTitle || 'Untitled Project'}`
                          }
                        </span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('ListenerGroup') && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {enrollment.targetType === 'group' ? (
                          <>
                            {isFutureVersion && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569' }}>
                                <Users size={14} />
                              </div>
                            )}
                            <div className={styles.nameCell}>
                              <span className={styles.listenerName}>{enrollment.listenerName}</span>
                            </div>
                          </>
                        ) : enrollment.listenerId ? (
                          <>
                            {isFutureVersion && (
                              <div className={styles.listenerAvatar} style={{ backgroundColor: '#f43f5e' }}>
                                {(enrollment.listenerName?.[0] || 'L').toUpperCase()}
                              </div>
                            )}
                            <div className={styles.nameCell}>
                              <span className={styles.listenerName}>{enrollment.listenerName || 'Listener'}</span>
                              <span className={styles.listenerEmail}>{enrollment.listenerEmail}</span>
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Anonymous</span>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('ProjectCourse') && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {enrollment.contentType === 'course' ? (
                          <GraduationCap size={15} style={{ color: '#8b5cf6' }} />
                        ) : (
                          <FileText size={15} style={{ color: '#64748b' }} />
                        )}
                        <span style={{ fontWeight: 500, color: '#334155' }}>{enrollment.projectTitle || 'Loading…'}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('TargetType') && (
                    <td><span style={{ fontSize: '0.85rem' }}>{enrollment.targetType}</span></td>
                  )}
                  {visibleColumns.includes('ContentType') && (
                    <td><span style={{ fontSize: '0.85rem' }}>{enrollment.contentType || 'Project'}</span></td>
                  )}
                  {visibleColumns.includes('Status') && (
                    <td>
                      <div style={{ position: 'relative', display: 'inline-block', zIndex: activeInlineStatusId === enrollment.id ? 150 : 1 }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', cursor: isFutureVersion ? 'pointer' : 'default', padding: 0 }}
                          onClick={() => {
                            if (isFutureVersion) {
                              setActiveInlineStatusId(activeInlineStatusId === enrollment.id ? null : enrollment.id)
                            }
                          }}
                        >
                          <span 
                            className={`${styles.statusBadge} ${getStatusClass(enrollment.status)}`}
                            title={enrollment.status === 'Failed' ? 'System error or insufficient credits' : ''}
                          >
                            {enrollment.status}
                          </span>
                        </button>
                        {isFutureVersion && activeInlineStatusId === enrollment.id && (
                          <div className={styles.dropdownPopover} style={{ top: '100%', left: 0, marginTop: '4px', width: '130px', zIndex: 100 }}>
                            {ENROLLMENT_STATUS.map(st => (
                              <button
                                key={st}
                                type="button"
                                className={`${styles.dropdownItem} ${enrollment.status === st ? styles.dropdownItemActive : ''}`}
                                onClick={() => handleInlineStatusChange(enrollment.id, st as any)}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('Link') && (
                    <td onClick={(e) => e.stopPropagation()}>
                      {(enrollment.targetType?.toLowerCase() === 'listener' || enrollment.targetType?.toLowerCase() === 'anonymous') && enrollment.contentType?.toLowerCase() === 'project' ? (
                        <div className={styles.linkCell}>
                          <span className={styles.linkIconRef}><LinkIcon size={16} /></span>
                          <span className={styles.linkThumb} aria-hidden="true" />
                          <button
                            type="button"
                            className={styles.linkUrl}
                            onClick={() => handleCopyLink(enrollment.id)}
                            title="Open / copy link"
                          >
                            {`${typeof window !== 'undefined' ? window.location.host : 'pitch-avatar.com'}/v/enroll-${enrollment.id.slice(0, 6)}`}
                          </button>
                          <button
                            type="button"
                            className={styles.copyLinkBtn}
                            onClick={() => handleCopyLink(enrollment.id)}
                            aria-label="Copy link"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Multiple links</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('Progress') && (
                    <td>
                      {enrollment.progress && enrollment.progress > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className={styles.progressBar} style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div className={styles.progressFill} style={{ width: `${enrollment.progress}%`, height: '100%', backgroundColor: '#3b82f6' }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{enrollment.progress}%</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('LastActivity') && (
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {(() => {
                          const val = (enrollment as any).lastActivityAt
                          if (!val) return '—'
                          const d = new Date(val)
                          const now = new Date()
                          const diffMs = now.getTime() - d.getTime()
                          const diffMin = Math.floor(diffMs / 60000)
                          if (diffMin < 1) return 'Just now'
                          if (diffMin < 60) return `${diffMin}m ago`
                          const diffHours = Math.floor(diffMin / 60)
                          if (diffHours < 24) return `${diffHours}h ago`
                          const diffDays = Math.floor(diffHours / 24)
                          if (diffDays < 7) return `${diffDays}d ago`
                          return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        })()}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes('DateCreated') && (
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  )}
                  <td>
                    <div className={styles.gearContainer} style={{ zIndex: activeGearId === enrollment.id ? 150 : 1 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={styles.gearBtn}
                        onClick={() => setActiveGearId(activeGearId === enrollment.id ? null : enrollment.id)}
                        aria-label="Actions"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {activeGearId === enrollment.id && (
                        <div className={styles.gearDropdown}>
                          <button type="button" className={styles.gearItem} onClick={() => { handleOpenManual(enrollment); setActiveGearId(null); }}>
                            <ClipboardCheck size={14} /> Enter Results
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { router.push('/analytics'); setActiveGearId(null); }}>
                            <BarChart2 size={14} /> Analytics
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleCopyLink(enrollment.id); setActiveGearId(null); }}>
                            <Share2 size={14} /> Share Link
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleCopyLink(enrollment.id); setActiveGearId(null); }}>
                            <Users size={14} /> Enrollment
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { showToast('Train coming soon!', 'info'); setActiveGearId(null); }}>
                            <GraduationCap size={14} /> Train (Soon)
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleDuplicate(enrollment.id); setActiveGearId(null); }}>
                            <Copy size={14} /> Duplicate
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleOpenEdit(enrollment); setActiveGearId(null); }}>
                            <Edit3 size={14} /> Edit
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleUpdateWebLink(); setActiveGearId(null); }}>
                            <RefreshCw size={14} /> Update Links
                          </button>
                          <button type="button" className={`${styles.gearItem} ${styles.gearItemDelete}`} onClick={() => { handleDelete(enrollment.id); setActiveGearId(null); }}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      
      {/* Reference-style pagination strip */}
      {enrollments.length > 0 && (
        <div className={styles.tablePagination}>
          <div className={styles.rowsPerPage}>
            <span>Rows per page</span>
            <select
              className={styles.rowsPerPageSelect}
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }}
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className={styles.pageRange}>{rangeStart}–{rangeEnd} of {totalCount}</span>
          <div className={styles.pageNav}>
            <button className={styles.pageBtn} disabled={page <= 1 || isPending} onClick={() => setPage(1)} aria-label="First page">
              <ChevronsLeft size={18} />
            </button>
            <button className={styles.pageBtn} disabled={page <= 1 || isPending} onClick={() => setPage(page - 1)} aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <button className={styles.pageBtn} disabled={page >= totalPages || isPending} onClick={() => setPage(page + 1)} aria-label="Next page">
              <ChevronRight size={18} />
            </button>
            <button className={styles.pageBtn} disabled={page >= totalPages || isPending} onClick={() => setPage(totalPages)} aria-label="Last page">
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
