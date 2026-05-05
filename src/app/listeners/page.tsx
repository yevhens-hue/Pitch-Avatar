'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { Users, Filter } from 'lucide-react'

export default function Listeners() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Пользователи компании</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>+ Пригласить пользователя</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input type="text" placeholder="Поиск по email или имени..." style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', flex: 1 }} />
        <button style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
          <Filter size={16} /> Фильтр
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Роль</th>
              <th>Последняя активность</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.nameCell}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>JD</div>
                John Doe
              </td>
              <td>Администратор</td>
              <td>Сегодня, 10:45</td>
              <td><span style={{ color: '#10b981', fontSize: '0.85rem' }}>Активен</span></td>
              <td><button className={styles.gearBtn}>⚙️</button></td>
            </tr>
            <tr>
              <td className={styles.nameCell}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>AS</div>
                Anna Smith
              </td>
              <td>Зритель</td>
              <td>Вчера, 14:20</td>
              <td><span style={{ color: '#10b981', fontSize: '0.85rem' }}>Активен</span></td>
              <td><button className={styles.gearBtn}>⚙️</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
