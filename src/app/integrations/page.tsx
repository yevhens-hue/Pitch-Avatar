'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { AppWindow, CheckCircle2 } from 'lucide-react'

const INTEGRATIONS = [
  { name: 'HubSpot', desc: 'Синхронизация контактов и сделок', connected: true, color: '#ff7a59' },
  { name: 'Salesforce', desc: 'Интеграция CRM данных', connected: false, color: '#00a1e0' },
  { name: 'Slack', desc: 'Уведомления о новых просмотрах', connected: true, color: '#4a154b' },
  { name: 'Zoom', desc: 'Запись онлайн-встреч и демо', connected: false, color: '#2d8cff' },
  { name: 'Pipedrive', desc: 'Управление воронкой продаж', connected: false, color: '#00a35c' },
  { name: 'Zapier', desc: 'Автоматизация бизнес-процессов', connected: true, color: '#ff4a00' },
]

export default function Integrations() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Интеграции</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Подключите Pitch Avatar к вашим любимым инструментам для автоматизации процессов.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {INTEGRATIONS.map(int => (
          <div key={int.name} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${int.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: int.color }}>
                <AppWindow size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{int.name}</h3>
                {int.connected ? (
                  <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}><CheckCircle2 size={12} /> Подключено</span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>Не подключено</span>
                )}
              </div>
            </div>
            <p style={{ color: '#475569', fontSize: '0.9rem', flex: 1 }}>{int.desc}</p>
            <button style={{ 
              marginTop: '1.5rem', 
              padding: '0.5rem', 
              width: '100%', 
              borderRadius: '8px', 
              border: int.connected ? '1px solid #e2e8f0' : 'none', 
              background: int.connected ? '#fff' : '#6366f1', 
              color: int.connected ? '#475569' : '#fff',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              {int.connected ? 'Настроить' : 'Подключить'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
