'use client'

import React, { useState } from 'react'
import styles from '@/components/Library/Library.module.css'
import pageStyles from '@/components/ui/Pages.module.css'
import { MOCK_VOICES } from '@/services/mock-data'
import Toast from '@/components/ui/Toast'
import { Trash2, X } from 'lucide-react'

export default function Voices() {
  const [toast, setToast] = useState('')
  const [voices, setVoices] = useState(MOCK_VOICES)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const toggleAll = () => {
    if (selectedIds.length === voices.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(voices.map(v => v.id))
    }
  }

  const toggleOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    setVoices(prev => prev.filter(v => !selectedIds.includes(v.id)))
    setToast(`Deleted ${selectedIds.length} voices`)
    setSelectedIds([])
  }

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>My Voices</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Voice cloning feature is coming soon!')}>Clone New Voice</button>
        </div>
      </div>

      <p className={pageStyles.description}>
        Create a digital clone of your voice for maximum presentation authenticity or use our pre-made AI voice library.
      </p>

      <div className={styles.tableWrapper}>
        {selectedIds.length > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{selectedIds.length} selected</span>
            <div className={styles.bulkActions}>
              <button className={`${styles.bulkBtn} ${styles.bulkBtnDestructive}`} onClick={handleBulkDelete}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <button className={styles.bulkClear} onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        )}
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox} 
                  checked={selectedIds.length === voices.length && voices.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Voice Name</th>
              <th>Type</th>
              <th>Languages</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {voices.map((v) => (
              <tr key={v.id}>
                <td className={styles.checkboxCell}>
                  <input 
                    type="checkbox" 
                    className={styles.checkbox} 
                    checked={selectedIds.includes(v.id)}
                    onChange={() => toggleOne(v.id)}
                  />
                </td>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon} style={{ backgroundColor: '#e0f2fe' }}>🎙️</div>
                  {v.name}
                </td>
                <td>{v.type}</td>
                <td>{v.language}</td>
                <td className={v.date === 'System' ? pageStyles.descriptionSystem : undefined}>{v.date}</td>
                <td>
                  {v.type === 'Cloned Voice' && <button className={styles.gearBtn} aria-label="Listen to voice" title="Listen">▶️</button>}
                  {v.type === 'Cloned Voice' && <button className={styles.gearBtn} aria-label="Delete voice" title="Delete">🗑️</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
