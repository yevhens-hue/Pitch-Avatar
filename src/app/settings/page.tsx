'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { User, Bell, Shield, CreditCard } from 'lucide-react'

export default function Settings() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Настройки</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>Сохранить изменения</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: '#eef2ff', color: '#6366f1', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Профиль
          </button>
          <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', color: '#64748b', borderRadius: '8px', border: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <CreditCard size={18} /> Биллинг
          </button>
          <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', color: '#64748b', borderRadius: '8px', border: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Bell size={18} /> Уведомления
          </button>
          <button style={{ padding: '0.75rem 1rem', textAlign: 'left', background: 'transparent', color: '#64748b', borderRadius: '8px', border: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Shield size={18} /> Безопасность
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#0f172a' }}>Информация о профиле</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Имя пользователя</label>
              <input type="text" defaultValue="John Doe" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Email</label>
              <input type="email" defaultValue="john@example.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Название компании</label>
              <input type="text" defaultValue="Acme Corp" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
