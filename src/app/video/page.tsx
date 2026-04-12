'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_VIDEOS } from '@/services/mock-data'

export default function VideoLibrary() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мои Видео</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>+ Загрузить видео</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название видео</th>
              <th>Длительность</th>
              <th>Переведено на</th>
              <th>Действия</th>
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
                  <button className={styles.gearBtn} aria-label="Настройки видео" title="Настройки">⚙️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
