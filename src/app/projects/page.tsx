'use client'

import { useSearchParams } from 'next/navigation'
import React, { useState, Suspense } from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_PROJECTS } from '@/services/mock-data'
import { cn } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import { Trash2, FolderInput, Shield } from 'lucide-react'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get('filter[folder]') || searchParams.get('folderId')
  const [toast, setToast] = useState('')
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Map mock folder ID to name
  const folderName = folderId === '162' || folderId === 'ava' ? 'ava' : null

  const toggleAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(projects.map(p => p.id))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    setProjects(prev => prev.filter(p => !selectedIds.includes(p.id)))
    setToast(`Deleted ${selectedIds.length} projects`)
    setSelectedIds([])
  }

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>{folderName ? folderName : 'My Projects'}</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Creating new projects will be available in the next update!')}>+ Create Project</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {selectedIds.length > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{selectedIds.length} selected</span>
            <div className={styles.bulkActions}>
              <button className={styles.bulkBtn} onClick={() => setToast('Move to Folder coming soon!')}>
                <FolderInput size={14} /> Move to folder
              </button>
              <button className={styles.bulkBtn} onClick={() => setToast('Change Access coming soon!')}>
                <Shield size={14} /> Change access
              </button>
              <button className={`${styles.bulkBtn} ${styles.bulkBtnDestructive}`} onClick={handleBulkDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <button className={styles.bulkClear} onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        )}
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox} 
                  checked={selectedIds.length === projects.length && projects.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Project Name</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td className={styles.checkboxCell}>
                  <input 
                    type="checkbox" 
                    className={styles.checkbox} 
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleOne(p.id)}
                  />
                </td>
                <td className={styles.nameCell}>
                  <div className={cn(styles.slideIcon)} style={{ backgroundColor: '#fff4cc' }}>📁</div>
                  {p.title}
                </td>
                <td>{p.status}</td>
                <td>{p.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function Projects() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </div>
  )
}
