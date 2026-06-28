'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/components/Library/Library.module.css'
import { getProjects } from '@/app/actions/projects'
import ProjectsTable from '@/components/Library/ProjectsTable'
import { Project } from '@/types'

export default function ChatAvatarPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true)
      try {
        const fetchedProjects = await getProjects()
        const filtered = fetchedProjects.filter(p => p.type === 'chat-avatar' || p.type === 'assistant')
        setProjects(filtered)
      } catch (err) {
        console.error('Failed to load chat-avatars:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Chat-avatars</h1>
        <div className={styles.headerActions}>
          <button className={styles.createBtn} onClick={() => router.push('/chat-avatar/create')}>+ Create Chat-avatar</button>
        </div>
      </div>
      <div style={{ padding: '0 32px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading AI Chat-avatars...
          </div>
        ) : (
          <ProjectsTable projects={projects} />
        )}
      </div>
    </div>
  )
}
