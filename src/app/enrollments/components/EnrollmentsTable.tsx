import React from 'react'
import {
  Link as LinkIcon, Edit3, Trash2, Video, Calendar,
  Settings, ClipboardCheck, BarChart2, Share2, GraduationCap,
  RefreshCw, FileText, Users, Copy, Plus
} from 'lucide-react'
import { Enrollment, ENROLLMENT_COLUMNS, ENROLLMENT_STATUS } from '@/types/listeners'
import { useToast } from '@/components/ui/ToastProvider'

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
  getStatusClass: (status: string) => string
  page: number
  setPage: (page: number) => void
  totalCount: number
  sortBy: string
  setSortBy: (sortBy: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
}

export default function EnrollmentsTable({
  styles, enrollments, selectedIds, visibleColumns, isLoading, isPending,
  toggleSelectAll, toggleSelect, handleCopyLink, handleOpenEdit,
  activeInlineStatusId, setActiveInlineStatusId, handleInlineStatusChange,
  activeGearId, setActiveGearId, handleOpenManual, handleUpdateWebLink, handleDelete, getStatusClass,
  page, setPage, totalCount, sortBy, setSortBy, sortOrder, setSortOrder
}: EnrollmentsTableProps) {
  
  const { showToast } = useToast()

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
        <div className={styles.emptyState}>
          <ClipboardCheck size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
          <h3 className={styles.emptyStateTitle} style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#1e293b' }}>Let's set up your first Enrollment</h3>
          
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
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px', paddingRight: '0.5rem', paddingLeft: '1rem' }}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.length === enrollments.length && enrollments.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
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
                    <td colSpan={visibleColumns.length + 2} style={{ padding: '1rem' }}>
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
                  <td style={{ paddingRight: '0.5rem', paddingLeft: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <input
                       type="checkbox"
                       className={styles.checkbox}
                       checked={selectedIds.includes(enrollment.id)}
                       onChange={() => toggleSelect(enrollment.id)}
                       aria-label={`Select ${enrollment.title}`}
                    />
                  </td>
                  {visibleColumns.includes('Name') && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {enrollment.contentType === 'course' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                            <GraduationCap size={16} />
                          </div>
                        ) : enrollment.targetType === 'group' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569' }}>
                              <Users size={14} />
                            </div>
                            <div className={styles.nameCell}>
                              <span className={styles.listenerName}>{enrollment.listenerName}</span>
                            </div>
                          </>
                        ) : enrollment.listenerId ? (
                          <>
                            <div className={styles.listenerAvatar} style={{ backgroundColor: '#f43f5e' }}>
                              {(enrollment.listenerName?.[0] || 'L').toUpperCase()}
                            </div>
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
                      <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onClick={() => setActiveInlineStatusId(activeInlineStatusId === enrollment.id ? null : enrollment.id)}
                        >
                          <span className={`${styles.statusBadge} ${getStatusClass(enrollment.status)}`}>
                            {enrollment.status}
                          </span>
                        </button>
                        {activeInlineStatusId === enrollment.id && (
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
                    <td>
                      {enrollment.targetType?.toLowerCase() === 'listener' && enrollment.contentType?.toLowerCase() === 'project' ? (
                        <button type="button" className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleCopyLink(enrollment.id); }} style={{ padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6' }}>
                          <span style={{ textDecoration: 'underline', fontSize: '0.82rem' }}>{`${typeof window !== 'undefined' ? window.location.origin : ''}/...`}</span>
                          <Copy size={13} aria-label="Copy Link" />
                        </button>
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
                  {visibleColumns.includes('VideoRecording') && (
                    <td><span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Soon</span></td>
                  )}
                  {visibleColumns.includes('Resume') && (
                    <td><span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Soon</span></td>
                  )}
                  {visibleColumns.includes('StartDate') && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                        <Calendar size={14} style={{ color: '#94a3b8' }} />
                        <span style={{ fontSize: '0.85rem' }}>
                          {enrollment.startDate ? enrollment.startDate.split('T')[0] : 'Immediate'}
                        </span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('TimeSpent') && (
                    <td><span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{enrollment.timeSpent ? `${Math.floor(enrollment.timeSpent/60)}m ${enrollment.timeSpent%60}s` : '0m 0s'}</span></td>
                  )}
                  {visibleColumns.includes('Score') && (
                    <td><span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Soon</span></td>
                  )}
                  {visibleColumns.includes('DateCreated') && (
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  )}
                  <td>
                    <div className={styles.gearContainer} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className={styles.gearBtn}
                        onClick={() => setActiveGearId(activeGearId === enrollment.id ? null : enrollment.id)}
                        aria-label="Actions"
                      >
                        <Settings size={16} />
                      </button>
                      {activeGearId === enrollment.id && (
                        <div className={styles.dropdownPopover} style={{ top: '50%', right: '100%', transform: 'translateY(-50%)', marginRight: '0.5rem', width: '190px', zIndex: 120 }}>
                          <button type="button" className={styles.gearItem} onClick={() => { handleOpenManual(enrollment); setActiveGearId(null); }}>
                            <ClipboardCheck size={14} /> Enter Results
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { showToast('Analytics coming soon!', 'info'); setActiveGearId(null); }}>
                            <BarChart2 size={14} /> Analytics (Soon)
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleCopyLink(enrollment.id); setActiveGearId(null); }}>
                            <Share2 size={14} /> Share
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { showToast('Train coming soon!', 'info'); setActiveGearId(null); }}>
                            <GraduationCap size={14} /> Train (Soon)
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleOpenEdit(enrollment); setActiveGearId(null); }}>
                            <Edit3 size={14} /> Edit
                          </button>
                          <button type="button" className={styles.gearItem} onClick={() => { handleUpdateWebLink(); setActiveGearId(null); }}>
                            <RefreshCw size={14} /> Update Link
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
      
      {/* Load More Button */}
      {enrollments.length > 0 && enrollments.length < totalCount && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <button 
            className={styles.btnSecondary} 
            onClick={() => setPage(page + 1)} 
            disabled={isPending}
          >
            {isPending ? 'Loading...' : `Load More (${enrollments.length} of ${totalCount})`}
          </button>
        </div>
      )}
    </div>
  )
}
