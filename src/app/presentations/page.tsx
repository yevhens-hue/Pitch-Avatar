'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { FileUp, PlusCircle } from 'lucide-react'

const MOCK_PRESENTATIONS = [
  { id: 1, name: 'Q3 Product Roadmap', date: 'Oct 12, 2023', slides: 15 },
  { id: 2, name: 'Sales Deck 2024', date: 'Nov 05, 2023', slides: 24 },
  { id: 3, name: 'Investor Pitch', date: 'Jan 10, 2024', slides: 18 },
]

export default function PresentationsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мои Презентации</h1>
        <div className={styles.headerActions} style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.createBtn} style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileUp size={16} /> Загрузить PDF/PPTX
          </button>
          <button className={styles.createBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={16} /> Создать новую
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {MOCK_PRESENTATIONS.map(p => (
          <div key={p.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            <div style={{ height: '140px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Preview
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', color: '#0f172a' }}>{p.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem' }}>
                <span>{p.slides} слайдов</span>
                <span>{p.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
