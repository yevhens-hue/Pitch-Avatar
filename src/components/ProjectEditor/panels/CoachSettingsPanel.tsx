'use client'

import React, { useState } from 'react'
import styles from './KnowledgeBasePanel.module.css' // Reusing styles for simplicity

interface CoachSettingsPanelProps {
  projectId?: string
}

const CoachSettingsPanel: React.FC<CoachSettingsPanelProps> = () => {
  const [showScore, setShowScore] = useState(true)
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false)
  const [passThreshold, setPassThreshold] = useState('80')

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTop}>
          <div>
            <h2 className={styles.panelTitle}>Coach Settings</h2>
            <p className={styles.panelSubtitle}>Configure global training parameters for this project.</p>
          </div>
        </div>
      </div>

      <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Test Type */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Тип Test</h3>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Формат перевірки правильності відповіді учня</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e3a8a', fontSize: '13px', fontWeight: 500 }}>Text / voice</button>
            <button style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px' }}>Text + правильний слайд</button>
            <button style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px' }}>Лише правильний слайд</button>
          </div>
        </div>

        {/* Q&A Selection */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Вибір Q&A з Set</h3>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>Всі свіжі питання (з Test Set) задавати у цьому тренінгу — незалежно від слайдів</div>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> Категорія Pricing</label>
              <span>10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> Категорія Objection</label>
              <span>10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" /> Категорія Technical</label>
              <span>10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" /> Категорія Discovery</label>
              <span>20</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Активно: <span style={{ color: '#111827' }}>7 Q</span> у цьому тренінгу</div>
          </div>
        </div>

        {/* Timing & Order */}
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Коли задавати</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', borderRadius: '4px 0 0 4px' }}>До</button>
              <button style={{ padding: '6px 12px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e3a8a', fontSize: '13px', fontWeight: 500, margin: '0 -1px' }}>На слайдах</button>
              <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', margin: '0 -1px' }}>Після</button>
              <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', borderRadius: '0 4px 4px 0' }}>Без слайдів</button>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Порядок</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '6px 12px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e3a8a', fontSize: '13px', fontWeight: 500, borderRadius: '4px 0 0 4px' }}>Послідовно</button>
              <button style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '13px', borderRadius: '0 4px 4px 0', margin: '0 -1px' }}>Рандомно N</button>
            </div>
          </div>
        </div>

        {/* Display Flags */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Три незалежні прапорці показу</h3>
          <div style={{ fontSize: '11px', color: '#b45309', marginBottom: '12px' }}>2x2x2 = 8 варіантів. Що бачить учень.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" defaultChecked style={{ marginTop: '2px' }} />
              <div>
                <strong>Оцінити правильність одразу</strong> — правильно / майже / ні
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" defaultChecked style={{ marginTop: '2px' }} />
              <div>
                <strong>Показати правильну відповідь</strong> після кожної
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" style={{ marginTop: '2px' }} />
              <div>
                <strong>Показувати поточний бал постійно</strong> — інакше в кінці
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Row: Passing & Reporting */}
        <div style={{ display: 'flex', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>PASSING</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <span>Min:</span>
              <input type="text" defaultValue="70%" style={{ width: '60px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', textAlign: 'center' }} />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>ЗВІТНІСТЬ</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" defaultChecked /> Тренер</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><input type="checkbox" /> Слухач</label>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CoachSettingsPanel
