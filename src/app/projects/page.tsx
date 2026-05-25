'use client'

import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import styles from '@/components/Library/Library.module.css'
import { MOCK_PROJECTS } from '@/services/mock-data'
import ProjectsTable from '@/components/Library/ProjectsTable'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get('filter[folder]') || searchParams.get('folderId')

  // Map mock folder ID to name
  const folderName = folderId === '162' || folderId === 'ava' ? 'ava' : null

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{folderName ? folderName : 'My Projects'}</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn}>+ Create Project</button>
        </div>
      </div>
      <div style={{ padding: '0 32px' }}>
        <ProjectsTable projects={MOCK_PROJECTS} />
      </div>
    </>
  )
}

export default function Projects() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent />
      </Suspense>
    </div>
  )
}
