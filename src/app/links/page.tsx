'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_LINKS } from '@/services/mock-data'

export default function Links() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Links</h1>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Link / Presentation</th>
              <th>Clicks</th>
              <th>Leads Collected</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LINKS.map((l) => (
              <tr key={l.id}>
                <td className={styles.nameCell}>
                  <div>
                    <div className={pageStyles.linkUrl}>{l.url}</div>
                    <div className={pageStyles.linkPresentation}>Presentation: {l.presentation}</div>
                  </div>
                </td>
                <td>{l.clicks}</td>
                <td>{l.leads}</td>
                <td>{l.created}</td>
                <td>
                  <button className={styles.gearBtn} id={`stonly-link-copy-${l.id}`} aria-label="Copy link" title="Copy">📋</button>
                  <button className={styles.gearBtn} id={`stonly-link-settings-${l.id}`} aria-label="Link settings" title="Settings">⚙️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
