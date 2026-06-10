'use client'

import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import styles from '../listeners.module.css'

// Mock Data matching the screenshot exactly
const MOCK_GROUPS = [
  { id: '1', name: 'test', description: 'test', members: 3, documents: 0, enrollments: 0, createdDate: 'Jun 02, 2026' },
  { id: '2', name: 'Engineering Team', description: 'All engineering candidates and employees', members: 4, documents: 0, enrollments: 1, createdDate: 'Feb 07, 2026' },
  { id: '3', name: 'Sales Onboarding', description: 'New sales team members going through onboarding', members: 3, documents: 0, enrollments: 3, createdDate: 'Feb 07, 2026' },
  { id: '4', name: 'Executive Candidates', description: 'C-level and VP candidates in pipeline', members: 0, documents: 0, enrollments: 2, createdDate: 'Feb 07, 2026' }
]

export default function GroupsPage() {
  const [search, setSearch] = useState('')

  const filteredGroups = MOCK_GROUPS.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Groups</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>
            <Icons.Upload size={16} />
            Import Listeners
          </button>
          <button className={styles.btnPrimary}>
            <Icons.Plus size={16} />
            Add Group
          </button>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Icons.Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.btnSecondary}>
          <Icons.Maximize2 size={16} /> Expand
        </button>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Description</th>
              <th>Members</th>
              <th>Documents</th>
              <th>Enrollments</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <tr key={group.id}>
                  <td className={styles.userName}>{group.name}</td>
                  <td className={styles.userEmail}>{group.description}</td>
                  <td style={{ fontWeight: 600 }}>{group.members}</td>
                  <td>{group.documents}</td>
                  <td>{group.enrollments}</td>
                  <td>{group.createdDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                      <button className={styles.actionBtn}>
                        <Icons.Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <span className={styles.userEmail}>No groups found.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {filteredGroups.length > 0 ? 1 : 0}-{filteredGroups.length} of {filteredGroups.length}
        </div>
      </div>
    </div>
  )
}
