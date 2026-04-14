'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_KNOWLEDGE } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'

export default function KnowledgeBase() {
  const [toast, setToast] = React.useState('')

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>Knowledge Base</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Website indexing will be available in the next release!')}>+ Text / Website</button>
          <button className={styles.createBtn} onClick={() => setToast('File upload will be available soon!')}>+ Upload File</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        The Knowledge Base allows your AI assistants to answer questions based on your own documents and websites.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_KNOWLEDGE.map((item) => (
              <tr key={item.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon} style={{ backgroundColor: '#e0e7ff' }}>📚</div>
                  {item.name}
                </td>
                <td>{item.type}</td>
                <td>{item.size}</td>
                <td>{item.date}</td>
                <td>
                  <button className={styles.gearBtn} aria-label="Delete document" title="Delete">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
