'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_VIDEOS } from '@/services/mock-data'

export default function VideoLibrary() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Videos</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>+ Upload Video</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Video Name</th>
              <th>Duration</th>
              <th>Translated to</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_VIDEOS.map((v) => (
              <tr key={v.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon} style={{ backgroundColor: '#fce7f3' }}>🎬</div>
                  {v.name}
                </td>
                <td>{v.duration}</td>
                <td>{v.translatedTo}</td>
                <td>
                  <button className={styles.gearBtn} aria-label="Video settings" title="Settings">⚙️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
