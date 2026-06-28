'use client'

import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'
import styles from '@/components/Library/Library.module.css'
import { getProjects, getFolders } from '@/app/actions/projects'
import ProjectsTable from '@/components/Library/ProjectsTable'
import { Project } from '@/types'
import CreateProjectModal, { ModalTabId } from '@/components/Wizard/CreateProjectModal'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const folderId = searchParams.get('filter[folder]') || searchParams.get('folderId') || undefined

  const [projects, setProjects] = useState<Project[]>([])
  const [folderName, setFolderName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const fetchedProjects = await getProjects({ folderId })
        setProjects(fetchedProjects)

        if (folderId) {
          const folders = await getFolders()
          const currentFolder = folders.find((f: any) => f.id === folderId)
          setFolderName(currentFolder ? currentFolder.name : 'Folder')
        } else {
          setFolderName(null)
        }
      } catch (err) {
        console.error('Failed to load projects/folders:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [folderId])

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{folderName ? folderName : 'My Projects'}</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => setIsModalOpen(true)}>+ Create Project</button>
        </div>
      </div>
      <div style={{ padding: '0 32px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading projects...
          </div>
        ) : (
          <ProjectsTable projects={projects} />
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          isOpen={isModalOpen}
          initialTab="file"
          onClose={() => setIsModalOpen(false)}
        />
      )}
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
