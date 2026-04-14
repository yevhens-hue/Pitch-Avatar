'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_PROJECTS } from '@/services/mock-data'
import { cn } from '@/lib/utils'
import Toast from '@/components/ui/Toast'

export default function Projects() {
  const [toast, setToast] = React.useState('')

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>My Projects</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Creating new projects will be available in the next update!')}>+ Create Project</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PROJECTS.map((p) => (
              <tr key={p.id}>
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
    </div>
  )
}
