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
        <h1 className={styles.title}>База знаний (Knowledge Base)</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Функция добавления сайтов появится в следующем релизе!')}>+ Текст / Сайт</button>
          <button className={styles.createBtn} onClick={() => setToast('Загрузка файлов будет доступна скоро!')}>+ Загрузить файл</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        База знаний позволяет вашим ИИ-ассистентам отвечать на вопросы, опираясь на ваши собственные документы и сайты.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название документа</th>
              <th>Тип</th>
              <th>Размер</th>
              <th>Загружено</th>
              <th>Действия</th>
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
                  <button className={styles.gearBtn} aria-label="Удалить документ" title="Удалить">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
