'use client'

import React, { useState } from 'react'
import { MOCK_PRESENTATION_TEMPLATES, PresentationTemplate } from '@/data/presentation-templates'
import TemplatesTable from '@/components/PresentationTemplates/TemplatesTable'
import TemplateModal from '@/components/PresentationTemplates/TemplateModal'
import { Sparkles, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function PresentationTemplatesPage() {
  const [templates, setTemplates] = useState<PresentationTemplate[]>(MOCK_PRESENTATION_TEMPLATES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PresentationTemplate | null>(null)

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

  const handleAddClick = () => {
    setEditingTemplate(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (template: PresentationTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this template? This cannot be undone.')) {
      setTemplates(prev => prev.filter(t => t.id !== id))
    }
  }

  const handleCopy = (template: PresentationTemplate) => {
    const copy: PresentationTemplate = {
      ...template,
      id: Math.random().toString(36).slice(2, 11),
      name: `${template.name} (Copy)`,
      badge: undefined,
      createdAt: new Date().toLocaleString('en-GB'),
    }
    setTemplates(prev => [copy, ...prev])
  }

  const handleSave = (data: Partial<PresentationTemplate>) => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t =>
        t.id === data.id ? { ...t, ...data } as PresentationTemplate : t
      ))
    } else {
      setTemplates(prev => [data as PresentationTemplate, ...prev])
    }
    setIsModalOpen(false)
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
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onAdd={handleAddClick}
          onUseTemplate={handleUseTemplate}
        />
      </div>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={editingTemplate}
        onSave={handleSave}
      />

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
