'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, Download, CloudUpload, MoreVert, Grid } from 'lucide-react'
import EditorSidebar from './EditorSidebar'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'
import { MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates'
import { MOCK_TEMPLATE_CONTENTS, SlideContent } from '@/data/template-content'
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

export default function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter()
  const template = MOCK_PRESENTATION_TEMPLATES.find(t => t.id === templateId) || { name: 'Unknown Template' }
  
  const [activeSlideId, setActiveSlideId] = useState(1)
  const [slides, setSlides] = useState<SlideContent[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)

  // Load from local storage or fallback to mock content
  useEffect(() => {
    const saved = localStorage.getItem(`pitch-avatar-editor-${templateId}`)
    if (saved) {
      try {
        setSlides(JSON.parse(saved))
      } catch (e) {
        setSlides(MOCK_TEMPLATE_CONTENTS[templateId]?.slides || [])
      }
    } else {
      setSlides(MOCK_TEMPLATE_CONTENTS[templateId]?.slides || [])
    }
  }, [templateId])

  // Auto-save
  useEffect(() => {
    if (slides.length > 0) {
      localStorage.setItem(`pitch-avatar-editor-${templateId}`, JSON.stringify(slides))
    }
  }, [slides, templateId])

  const handleUpdateElement = (id: string, updates: Partial<SelectedElement>) => {
    setSlides(prevSlides => prevSlides.map(slide => {
      if (slide.id !== activeSlideId) return slide;
      return {
        ...slide,
        elements: slide.elements.map(el => el.id === id ? { ...el, ...updates } : el)
      }
    }))
  }

  const currentSlide = slides.find(s => s.id === activeSlideId)
  const activeElements = currentSlide?.elements || []
  const selectedElement = activeElements.find(el => el.id === selectedElementId) || null

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
          onSelectSlide={(id) => {
            setActiveSlideId(id)
            setSelectedElementId(null) // clear selection when switching slide
          }}
          slidesCount={slides.length}
        />
        
        <Canvas 
          elements={activeElements}
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
