'use client'

import React, { useState } from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_VIDEOS } from '@/services/mock-data'
import { cn } from '@/lib/utils'
import Toast from '@/components/ui/Toast'
import { Trash2, FolderInput, Shield } from 'lucide-react'

export default function VideoLibrary() {
  const [toast, setToast] = useState('')
  const [items, setItems] = useState(MOCK_VIDEOS)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map(p => p.id))
    }
  }

  const toggleOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = () => {
    setItems(prev => prev.filter(p => !selectedIds.includes(p.id)))
    setToast(`Deleted ${selectedIds.length} videos`)
    setSelectedIds([])
  }

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      <div className={styles.header}>
        <h1 className={styles.title}>My Videos</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setToast('Uploading new videos will be available in the next update!')}>+ Upload Video</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {selectedIds.length > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{selectedIds.length} selected</span>
            <div className={styles.bulkActions}>
              <button className={styles.bulkBtn} onClick={() => setToast('Move to Folder coming soon!')}>
                <FolderInput size={14} /> Move to folder
              </button>
              <button className={styles.bulkBtn} onClick={() => setToast('Change Access coming soon!')}>
                <Shield size={14} /> Change access
              </button>
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
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th>Project Name</th>
              <th>Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td className={styles.checkboxCell}>
                  <input 
                    type="checkbox" 
                    className={styles.checkbox} 
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleOne(p.id)}
                  />
                </td>
                <td className={styles.nameCell}>
                  <div className={cn(styles.slideIcon)} style={{ backgroundColor: '#fce7f3' }}>🎬</div>
                  {p.name}
                </td>
                <td>{'ready'}</td>
                <td>{'2026-03-24'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
