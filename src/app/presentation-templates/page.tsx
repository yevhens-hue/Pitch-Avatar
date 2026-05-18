'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
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
    if (confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      setTemplates(templates.filter(t => t.id !== id))
    }
  }

  const handleCopy = (template: PresentationTemplate) => {
    const newTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      name: `${template.name} (Копия)`,
      createdAt: new Date().toLocaleString('ru-RU')
    }
    setTemplates([newTemplate, ...templates])
  }

  const handleSave = (templateData: Partial<PresentationTemplate>) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === templateData.id ? { ...t, ...templateData } as PresentationTemplate : t))
    } else {
      setTemplates([templateData as PresentationTemplate, ...templates])
    }
    setIsModalOpen(false)
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Шаблоны презентаций</h1>
        <button className={styles.addBtn} onClick={handleAddClick}>
          <Plus size={18} />
          ДОБАВИТЬ ШАБЛОН
        </button>
      </div>

      <div className={styles.content}>
        <TemplatesTable 
          templates={templates}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onCopy={handleCopy}
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
