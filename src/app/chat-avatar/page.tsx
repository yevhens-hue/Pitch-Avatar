'use client'

import React from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_PROJECTS } from '@/services/mock-data'
import ProjectsTable from '@/components/Library/ProjectsTable'

export default function ChatAvatarPage() {
  const filteredProjects = MOCK_PROJECTS.filter(p => p.type === 'chat-avatar' || p.type === 'assistant')

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Chat-avatars</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>+ Create Chat-avatar</button>
        </div>
      </div>
      <div style={{ padding: '0 32px' }}>
        <ProjectsTable projects={filteredProjects} />
      </div>
    </div>
  )
}
