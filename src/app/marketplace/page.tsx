'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { Briefcase, Download } from 'lucide-react'

const TOOLS = [
  { name: 'Lead Generation Template', type: 'Template', price: 'Free' },
  { name: 'Sales Pitch Avatar Persona', type: 'AI Role', price: 'Premium' },
  { name: 'Product Demo Flow', type: 'Workflow', price: 'Free' },
  { name: 'Analytics Dashboard Export', type: 'Integration', price: 'Premium' },
]

export default function Marketplace() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Дополнительные инструменты</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        {TOOLS.map((tool, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', background: tool.price === 'Free' ? '#ecfdf5' : '#fef3c7', color: tool.price === 'Free' ? '#059669' : '#d97706' }}>
                {tool.price}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{tool.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', flex: 1 }}>{tool.type}</p>
            
            <button style={{ 
              marginTop: '1.5rem', 
              padding: '0.5rem', 
              width: '100%', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0', 
              background: '#fff', 
              color: '#0f172a',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <Download size={16} /> Установить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
