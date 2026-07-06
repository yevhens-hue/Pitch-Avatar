'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import React, { Suspense, useEffect, useState, useRef } from 'react'
import styles from '@/components/Library/Library.module.css'
import { getProjects, getFolders } from '@/app/actions/projects'
import ProjectsTable from '@/components/Library/ProjectsTable'
import { Project } from '@/types'
import CreateProjectModal, { ModalTabId } from '@/components/Wizard/CreateProjectModal'
import { LayoutTemplate, Bot, Video, Square } from 'lucide-react'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const folderId = searchParams.get('filter[folder]') || searchParams.get('folderId') || undefined

  const [projects, setProjects] = useState<Project[]>([])
  const [folderName, setFolderName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [modalTab, setModalTab] = useState<ModalTabId>('file')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Auto-open modal if Sara redirected here with ?openModal=true
  useEffect(() => {
    const shouldOpen = searchParams.get('openModal') === 'true'
    const tab = searchParams.get('tab') as ModalTabId | null
    if (shouldOpen) {
      setModalTab(tab && ['file', 'video', 'scratch'].includes(tab) ? tab : 'file')
      setIsModalOpen(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <div className={styles.createDropdownWrapper} ref={dropdownRef}>
            <button className={styles.createBtn} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              Create Project
            </button>
            {isDropdownOpen && (
              <div className={styles.createDropdownMenu}>
                <button className={styles.dropdownItem} onClick={() => { setIsModalOpen(true); setModalTab('file'); setIsDropdownOpen(false); }}>
                  <LayoutTemplate size={16} /> Presentation
                </button>
                <button className={styles.dropdownItem} onClick={() => { router.push('/chat-avatar/create'); setIsDropdownOpen(false); }}>
                  <Bot size={16} /> AI Chat Avatar
                </button>
                <button className={styles.dropdownItem} onClick={() => { setIsModalOpen(true); setModalTab('video'); setIsDropdownOpen(false); }}>
                  <Video size={16} /> Video Project
                </button>
                <button className={styles.dropdownItem} onClick={() => { setIsModalOpen(true); setModalTab('scratch'); setIsDropdownOpen(false); }}>
                  <Square size={16} /> Start from Scratch
                </button>
              </div>
            )}
          </div>
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
          initialTab={modalTab}
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
