'use client'

import React from 'react'
import Link from 'next/link'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_CHAT_AVATARS } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'

export default function ChatAvatarList() {
  const [toast, setToast] = React.useState('')

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>Мои AI Чат-аватары</h1>
        <div className={styles.headerActions}>
          <Link href="/chat-avatar/create" className={styles.createBtn}>+ Создать ИИ-ассистента</Link>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя аватара</th>
              <th>Язык</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CHAT_AVATARS.map((p) => (
              <tr key={p.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon}>🤖</div>
                  {p.name}
                </td>
                <td>{p.language}</td>
                <td>
                  <span className={`${pageStyles.statusBadge} ${p.status === 'Active' ? pageStyles.statusActive : pageStyles.statusDraft}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className={styles.gearBtn} title="Настройки" onClick={() => setToast('Настройки аватара будут доступны после завершения его обучения!')}>⚙️</button>
                </td>
              </tr>
            ))}
            {MOCK_CHAT_AVATARS.length === 0 && (
              <tr>
                <td colSpan={4} className={pageStyles.emptyRow}>
                  Вы еще не создали ни одного ИИ-ассистента
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
