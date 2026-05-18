'use client'

import React, { useState, useEffect } from 'react'
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
}

const DEFAULT_ELEMENTS: SelectedElement[] = [
  { id: 'img-1', type: 'image', x: 200, y: 100, w: 300, h: 200 },
  { id: 'txt-1', type: 'bubble', x: 550, y: 150, w: 250, h: 100, content: 'Title: test\nrandom text for testing' }
]

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter()
  const template = MOCK_PRESENTATION_TEMPLATES.find(t => t.id === templateId) || { name: 'Unknown Template' }
  
  const [activeSlideId, setActiveSlideId] = useState(1)
  const [elements, setElements] = useState<SelectedElement[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  // Load elements from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`pitch-avatar-editor-${templateId}`)
    if (saved) {
      try {
        setElements(JSON.parse(saved))
      } catch (e) {
        setElements(DEFAULT_ELEMENTS)
      }
    } else {
      setElements(DEFAULT_ELEMENTS)
    }
  }, [templateId])

  // Auto-save to local storage when elements change
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem(`pitch-avatar-editor-${templateId}`, JSON.stringify(elements))
    }
  }, [elements, templateId])

  const handleUpdateElement = (id: string, updates: Partial<SelectedElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const selectedElement = elements.find(el => el.id === selectedElementId) || null

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
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
        />

        <PropertiesPanel 
          selectedElement={selectedElement}
          onUpdateElement={(updates) => {
            if (selectedElementId) {
              handleUpdateElement(selectedElementId, updates)
            }
          }}
        />
      </div>
    </div>
  )
}
