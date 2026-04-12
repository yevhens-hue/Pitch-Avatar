'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_VOICES } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'

export default function Voices() {
  const [toast, setToast] = React.useState('')

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>Мои Голоса</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Функция клонирования голоса будет доступна скоро!')}>Клонировать новый голос</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        Создавайте цифрового клона своего голоса для максимальной аутентичности презентаций или используйте готовую библиотеку ИИ-голосов.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название голоса</th>
              <th>Тип</th>
              <th>Языки</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_VOICES.map((v) => (
              <tr key={v.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon} style={{ backgroundColor: '#e0f2fe' }}>🎙️</div>
                  {v.name}
                </td>
                <td>{v.type}</td>
                <td>{v.language}</td>
                <td className={v.date === 'System' ? pageStyles.descriptionSystem : undefined}>{v.date}</td>
                <td>
                  {v.type === 'Клонированный голос' && <button className={styles.gearBtn} aria-label="Прослушать голос" title="Слушать">▶️</button>}
                  {v.type === 'Клонированный голос' && <button className={styles.gearBtn} aria-label="Удалить голос" title="Удалить">🗑️</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
