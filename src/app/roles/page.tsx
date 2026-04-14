'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_ROLES } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'

export default function Roles() {
  const [toast, setToast] = React.useState('')

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>AI Avatar Roles</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Role editor will be available in the next update!')}>+ Create Role</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        Assign roles to AI assistants so they understand the context, communication style, and goals to be achieved in the conversation with the user.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ROLES.map((r) => (
              <tr key={r.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon} style={{ backgroundColor: '#fef3c7' }}>🎓</div>
                  {r.name}
                </td>
                <td className={pageStyles.truncatedCell}>{r.description}</td>
                <td>{r.date}</td>
                <td>
                  <button className={styles.gearBtn} aria-label="Role settings" title="Settings">⚙️</button>
                  <button className={styles.gearBtn} aria-label="Delete role" title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
