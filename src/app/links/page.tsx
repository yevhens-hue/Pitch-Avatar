'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_LINKS } from '@/services/mock-data'

export default function Links() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мои Ссылки</h1>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ссылка / Презентация</th>
              <th>Клики</th>
              <th>Собранные лиды</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LINKS.map((l) => (
              <tr key={l.id}>
                <td className={styles.nameCell}>
                  <div>
                    <div className={pageStyles.linkUrl}>{l.url}</div>
                    <div className={pageStyles.linkPresentation}>Презентация: {l.presentation}</div>
                  </div>
                </td>
                <td>{l.clicks}</td>
                <td>{l.leads}</td>
                <td>{l.created}</td>
                <td>
                  <button className={styles.gearBtn} aria-label="Копировать ссылку" title="Копировать">📋</button>
                  <button className={styles.gearBtn} aria-label="Настройки ссылки" title="Настройки">⚙️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
