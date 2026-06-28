'use client'

import React, { useEffect, useState } from 'react'
import styles from '@/components/Library/Library.module.css'
import { getProjects } from '@/app/actions/projects'
import ProjectsTable from '@/components/Library/ProjectsTable'
import { Project } from '@/types'
import CreateProjectModal from '@/components/Wizard/CreateProjectModal'

export default function VideoLibrary() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true)
      try {
        const fetchedProjects = await getProjects({ type: 'video' })
        setProjects(fetchedProjects)
      } catch (err) {
        console.error('Failed to load videos:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Video</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>+ Create Video</button>
        </div>
      </div>
      <div style={{ padding: '0 32px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading videos...
          </div>
        ) : (
          <ProjectsTable projects={projects} />
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          initialTab="video"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
