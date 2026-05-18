'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, Download, CloudUpload, MoreVert, Grid } from 'lucide-react'
import EditorSidebar from './EditorSidebar'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'
import { MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates'
import styles from './TemplateEditor.module.css'

interface TemplateEditorProps {
  templateId: string
}

export type SelectedElement = {
  id: string
  type: 'text' | 'image' | 'button' | 'bubble'
  x: number
  y: number
  w: number
  h: number
  content?: string
} | null

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter()
  const template = MOCK_PRESENTATION_TEMPLATES.find(t => t.id === templateId) || { name: 'Unknown Template' }
  
  const [activeSlideId, setActiveSlideId] = useState(1)
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null)

  return (
    <div className={styles.editorContainer}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push('/presentation-templates')}>
            <ChevronLeft size={20} />
          </button>
          <span className={styles.templateTitle}>{template.name}</span>
        </div>

        <div className={styles.headerCenter}>
          <button className={styles.iconBtn} title="Preview"><Eye size={18} /></button>
          <button className={styles.iconBtn} title="Export"><Download size={18} /></button>
          <button className={styles.deleteBtn}>Удалить шаблон</button>
          <button className={styles.saveBtn}>
            <CloudUpload size={16} /> Сохранить
          </button>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.avatar}>IM</div>
          <button className={styles.iconBtn}><Grid size={18} /></button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className={styles.workspace}>
        <EditorSidebar 
          activeSlideId={activeSlideId} 
          onSelectSlide={setActiveSlideId} 
        />
        
        <Canvas 
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
        />

        <PropertiesPanel 
          selectedElement={selectedElement}
          onUpdateElement={(updates) => setSelectedElement(prev => prev ? { ...prev, ...updates } : null)}
        />
      </div>
    </div>
  )
}
