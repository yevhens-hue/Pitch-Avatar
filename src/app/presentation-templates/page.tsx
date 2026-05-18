'use client'

import React, { useState } from 'react'
import { MOCK_PRESENTATION_TEMPLATES, PresentationTemplate } from '@/data/presentation-templates'
import TemplatesTable from '@/components/PresentationTemplates/TemplatesTable'
import TemplateModal from '@/components/PresentationTemplates/TemplateModal'
import styles from './page.module.css'

export default function PresentationTemplatesPage() {
  const [templates, setTemplates] = useState<PresentationTemplate[]>(MOCK_PRESENTATION_TEMPLATES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PresentationTemplate | null>(null)

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
        />
      </div>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  )
}
