'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, Download, CloudUpload, Grid, Bookmark, X, Copy } from 'lucide-react'
import EditorSidebar from './EditorSidebar'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'
import { MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates'
import { MOCK_TEMPLATE_CONTENTS, SlideContent } from '@/data/template-content'
import { useUserTemplates } from '@/hooks/useUserTemplates'
import styles from './TemplateEditor.module.css'

interface TemplateEditorProps {
  templateId: string
}

import { useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const isOnboarding = searchParams?.get('onboarding') === 'true'
  const template = MOCK_PRESENTATION_TEMPLATES.find(t => t.id === templateId) || { name: 'Unknown Template' }
  
  const [activeSlideId, setActiveSlideId]   = useState(1)
  const [slides, setSlides]                 = useState<SlideContent[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(isOnboarding)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveSuccess, setSaveSuccess]       = useState(false)
  const [dupToast, setDupToast]             = useState<string | null>(null)

  const { saveTemplate, duplicateTemplate } = useUserTemplates()

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

  const COVER_GRADIENTS = [
    'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
    'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)',
    'linear-gradient(135deg,#a855f7 0%,#7c3aed 100%)',
    'linear-gradient(135deg,#f97316 0%,#ea580c 100%)',
    'linear-gradient(135deg,#10b981 0%,#059669 100%)',
    'linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)',
    'linear-gradient(135deg,#14b8a6 0%,#0d9488 100%)',
    'linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)',
    'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
    'linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)',
  ]

  const handleSaveAsTemplate = () => {
    if (!saveTemplateName.trim()) return
    const gradient = COVER_GRADIENTS[(Number(templateId) - 1) % COVER_GRADIENTS.length]
    saveTemplate(saveTemplateName.trim(), templateId, template.name, gradient, slides)
    setSaveSuccess(true)
    setTimeout(() => { setSaveSuccess(false); setShowSaveDialog(false); setSaveTemplateName('') }, 1800)
  }

  const handleDuplicate = () => {
    const gradient  = COVER_GRADIENTS[(Number(templateId) - 1) % COVER_GRADIENTS.length]
    const baseName  = saveTemplateName.trim() || template.name
    duplicateTemplate(templateId, template.name, gradient, slides, baseName)
    setDupToast(`Duplicate saved to "My Templates"`)
    setTimeout(() => setDupToast(null), 2500)
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
          <button className={styles.duplicateBtn} onClick={handleDuplicate} title="Duplicate to My Templates">
            <Copy size={15} /> Duplicate
          </button>
          <button className={styles.saveMyTplBtn} onClick={() => setShowSaveDialog(true)}>
            <Bookmark size={15} /> Save as My Template
          </button>
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
        
        <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
          <Canvas 
            elements={activeElements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
          />
          {showWelcomeOverlay && (
            <div className={styles.welcomeOverlay}>
              <div className={styles.welcomeTooltip}>
                <div className={styles.welcomeAvatar}>🤖</div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a' }}>Excellent choice!</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>
                    The template texts are ready. Edit them if you want, then click Generate to bring your presentation to life!
                  </p>
                  <button 
                    className={styles.welcomeCloseBtn}
                    onClick={() => setShowWelcomeOverlay(false)}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <PropertiesPanel 
          selectedElement={selectedElement}
          onUpdateElement={(updates) => {
            if (selectedElementId) {
              handleUpdateElement(selectedElementId, updates)
            }
          }}
        />
      </div>

      {/* ── Duplicate toast ── */}
      {dupToast && (
        <div className={styles.dupToast}>
          <Copy size={14} /> {dupToast}
        </div>
      )}

      {/* ── Save as My Template dialog ── */}
      {showSaveDialog && (
        <div className={styles.saveDialogOverlay} onClick={() => setShowSaveDialog(false)}>
          <div className={styles.saveDialog} onClick={e => e.stopPropagation()}>
            <div className={styles.saveDialogHeader}>
              <span>Save as My Template</span>
              <button className={styles.iconBtn} onClick={() => setShowSaveDialog(false)}><X size={16} /></button>
            </div>
            {saveSuccess ? (
              <div className={styles.saveSuccess}>✅ Template saved! Find it in "My Templates" on the dashboard.</div>
            ) : (
              <>
                <p className={styles.saveDialogHint}>Give your template a name so you can find it later.</p>
                <input
                  autoFocus
                  className={styles.saveDialogInput}
                  placeholder={`${template.name} — My version`}
                  value={saveTemplateName}
                  onChange={e => setSaveTemplateName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveAsTemplate()}
                />
                <div className={styles.saveDialogActions}>
                  <button className={styles.saveDialogBtn} onClick={handleSaveAsTemplate} disabled={!saveTemplateName.trim()}>
                    <Bookmark size={14} /> Save Template
                  </button>
                  <button className={styles.saveDialogCancel} onClick={() => setShowSaveDialog(false)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
