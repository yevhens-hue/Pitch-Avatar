'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_PROJECTS } from '@/services/mock-data'
import ProjectsTable from '@/components/Library/ProjectsTable'

export default function VideoLibrary() {
  const filteredProjects = MOCK_PROJECTS.filter(p => p.type === 'video')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Video</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>+ Create Video</button>
        </div>
      </div>
      <div style={{ padding: '0 32px' }}>
        <ProjectsTable projects={filteredProjects} />
      </div>
    </div>
  )
}
