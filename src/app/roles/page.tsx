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
        <h1 className={styles.title}>Роли ИИ-Аватара</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Редактор ролей будет доступен в ближайшем обновлении!')}>+ Создать Роль</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        Назначайте ИИ-ассистентам роли, чтобы они понимали контекст, манеру общения и цели, которые нужно достичь в разговоре с пользователем.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название роли</th>
              <th>Описание</th>
              <th>Дата создания</th>
              <th>Действия</th>
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
                  <button className={styles.gearBtn} aria-label="Настройки роли" title="Настройки">⚙️</button>
                  <button className={styles.gearBtn} aria-label="Удалить роль" title="Удалить">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
