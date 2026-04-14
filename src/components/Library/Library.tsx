'use client'

import React, { useState } from 'react'
import styles from './Library.module.css'
import LinkSettings from './LinkSettings'
import { MOCK_PRESENTATIONS } from '@/services/mock-data'
import CreatePresentationModal from '../Modals/CreatePresentationModal'

export default function Library() {
  const [search, setSearch] = useState('')
  const [selectedPresentation, setSelectedPresentation] = useState<typeof MOCK_PRESENTATIONS[number] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = MOCK_PRESENTATIONS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Presentations</h1>
        <div className={styles.headerActions}>
          <input
            type="text"
            placeholder="Search by name..."
            className={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>Create Presentation</button>
        </div>
      </div>

      <CreatePresentationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Updated</th>
              <th>Slides</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className={styles.nameCell}>
                  <div className={styles.slideIcon}>📄</div>
                  {p.name}
                </td>
                <td>{p.updated}</td>
                <td>{p.slides}</td>
                <td>{p.views}</td>
                <td>
                  <button
                    className={styles.gearBtn}
                    title="Link Settings"
                    onClick={() => setSelectedPresentation(p)}
                  >
                    ⚙️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LinkSettings
        isOpen={!!selectedPresentation}
        onClose={() => setSelectedPresentation(null)}
        presentationName={selectedPresentation?.name || ''}
      />
    </div>
  )
}
