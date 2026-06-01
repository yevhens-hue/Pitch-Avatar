'use client'

import React, { useState } from 'react'
import { PresentationTemplate } from '@/data/presentation-templates'
import { useTemplateStore } from '@/lib/templateStore'
import TemplatesTable from '@/components/PresentationTemplates/TemplatesTable'
import { Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function PresentationTemplatesPage() {
  const { templates } = useTemplateStore()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplateToUse, setSelectedTemplateToUse] = useState<PresentationTemplate | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const router = useRouter()

  const handleUseTemplate = (tpl: PresentationTemplate) => {
    setSelectedTemplateToUse(tpl)
    setNewProjectName(`${tpl.name} - Project`)
    setShowCreateModal(true)
  }

  const handleCreateProject = () => {
    setShowCreateModal(false)
    if (selectedTemplateToUse) {
      router.push(`/presentation-templates/${selectedTemplateToUse.id}?project=${encodeURIComponent(newProjectName)}`)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Templates</h1>
          <p className={styles.subtitle}>{templates.length} ready-to-use presentation templates</p>
        </div>
      </div>

      <div className={styles.content}>
        <TemplatesTable
          templates={templates}
          onUseTemplate={handleUseTemplate}
        />
      </div>

      {/* ── Create New Presentation Dialog ── */}
      {showCreateModal && selectedTemplateToUse && (
        <div className={styles.createDialogOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.createDialog} onClick={e => e.stopPropagation()}>
            <div className={styles.createDialogHeader}>
              <span>Create new presentation</span>
              <button className={styles.iconBtn} onClick={() => setShowCreateModal(false)}><X size={16} /></button>
            </div>
            
            <input
              autoFocus
              className={styles.createDialogInput}
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
            />
            
            <div className={styles.createDialogIconWrapper}>
              <Sparkles size={32} className={styles.sparkleIcon} />
            </div>
            
            <p className={styles.createDialogText}>
              You are about to create a new interactive presentation based on the <strong>{selectedTemplateToUse.name}</strong> template.
            </p>
            <p className={styles.createDialogSubtext}>
              The template contents will be loaded into your editor.
            </p>
            
            <div className={styles.createDialogActions}>
              <button className={styles.createDialogBtn} onClick={handleCreateProject}>
                Start Editing
              </button>
              <button className={styles.createDialogCancel} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
