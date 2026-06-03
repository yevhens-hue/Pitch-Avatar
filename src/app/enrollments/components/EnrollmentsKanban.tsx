import React from 'react'
import { Link as LinkIcon, Edit3, Trash2, Calendar, MoreVertical } from 'lucide-react'
import { Enrollment } from '@/types/listeners'

interface EnrollmentsKanbanProps {
  styles: any
  enrollments: Enrollment[]
  isLoading: boolean
  isPending: boolean
  handleCopyLink: (id: string) => void
  handleOpenEdit: (enrollment: Enrollment) => void
  handleDelete: (id: string) => void
}

export default function EnrollmentsKanban({
  styles, enrollments, isLoading, isPending, handleCopyLink, handleOpenEdit, handleDelete
}: EnrollmentsKanbanProps) {
  const KANBAN_COLUMNS = ['Not started', 'In Progress', 'Completed', 'Failed']

  return (
    <div className={styles.kanbanBoard}>
      {KANBAN_COLUMNS.map(col => {
        const colItems = enrollments.filter(e => e.status === col)
        return (
          <div key={col} className={styles.kanbanColumn}>
            <div className={styles.kanbanColHeader}>
              <span className={styles.kanbanColTitle}>{col}</span>
              <span className={styles.kanbanColCount}>{colItems.length}</span>
            </div>
            <div className={styles.kanbanColBody}>
              {isLoading || isPending ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <div key={`skeleton-${col}-${i}`} className={styles.kanbanCard} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ width: '80%', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '50%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '100%', height: '1px', backgroundColor: '#f1f5f9', margin: '0.2rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '30%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                        <div style={{ width: '20%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                colItems.length === 0 ? (
                  <div className={styles.kanbanEmpty}>No enrollments</div>
                ) : (
                  colItems.map((enrollment) => (
                    <div key={enrollment.id} className={styles.kanbanCard} style={{ cursor: 'pointer' }} onClick={() => handleOpenEdit(enrollment)}>
                      <div className={styles.kanbanCardProject}>{enrollment.projectTitle || 'Project'}</div>
                      {enrollment.listenerId && (
                        <div className={styles.kanbanCardListener}>
                          {enrollment.listenerName || enrollment.listenerEmail || 'Listener'}
                        </div>
                      )}
                      {enrollment.targetType === 'Group' && (
                        <div className={styles.kanbanCardListener}>
                          Group: {enrollment.listenerName}
                        </div>
                      )}
                      
                      <div className={styles.kanbanCardFooter}>
                        <div className={styles.kanbanCardDate}>
                          <Calendar size={11} />
                          {enrollment.startDate ? enrollment.startDate.split('T')[0] : 'No date'}
                        </div>
                        <div className={styles.kanbanCardActions} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleCopyLink(enrollment.id)} title="Copy link" aria-label="Copy link"><LinkIcon size={13} /></button>
                          <button onClick={() => handleOpenEdit(enrollment)} title="Edit" aria-label="Edit"><Edit3 size={13} /></button>
                          <button className={styles.kanbanCardBtnDanger} onClick={() => handleDelete(enrollment.id)} title="Delete" aria-label="Delete"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
