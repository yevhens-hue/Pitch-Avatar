'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Eye, Download, CloudUpload, Grid, Bookmark, X, Copy, Book, User, Sparkles, FileDown, Star, Monitor, Settings, Search, ChevronDown, Dumbbell } from 'lucide-react'
import EditorSidebar from './EditorSidebar'
import Canvas from './Canvas'
import PropertiesPanel from './PropertiesPanel'
import TemplatesTable from '../TemplatesTable'
import { MOCK_PRESENTATION_TEMPLATES, PresentationTemplate } from '@/data/presentation-templates'
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
  zIndex?: number
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
  const [showAiTooltip, setShowAiTooltip]   = useState(false)
  const [activeTab, setActiveTab]           = useState('Slides')
  
  // Project Creation State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplateToUse, setSelectedTemplateToUse] = useState<PresentationTemplate | null>(null)
  const [newProjectName, setNewProjectName] = useState('')

  const { saveTemplate, duplicateTemplate } = useUserTemplates()

  // Load from local storage or fallback to mock content
  useEffect(() => {
    const saved = localStorage.getItem(`pitch-avatar-editor-${templateId}`)
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSlides(JSON.parse(saved))
      } catch {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSlides(MOCK_TEMPLATE_CONTENTS[templateId]?.slides || [])
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    'linear-gradient(135deg,#0076ff 0%,#0061d6 100%)',
    'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)',
    'linear-gradient(135deg,#a855f7 0%,#0061d6 100%)',
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

  const handleUseTemplate = (tpl: PresentationTemplate) => {
    setSelectedTemplateToUse(tpl)
    setNewProjectName(`${tpl.name} - Project`)
    setShowCreateModal(true)
  }

  const handleCreateProject = () => {
    // In a real app, this creates a new project ID and redirects.
    // For this prototype, we just switch to the Slides tab, simulating the new project.
    setShowCreateModal(false)
    setActiveTab('Slides')
    alert(`Created new project: ${newProjectName}`)
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

        <div className={styles.headerNav}>
          <button className={`${styles.navItem} ${activeTab === 'Slides' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Slides')}>
            <Monitor size={20} />
            <span>Slides</span>
          </button>
          <button className={`${styles.navItem} ${activeTab === 'Settings' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className={`${styles.navItem} ${activeTab === 'Avatar' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Avatar')}>
            <User size={20} />
            <span>Avatar</span>
          </button>
          <button className={`${styles.navItem} ${activeTab === 'Knowledge Base' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Knowledge Base')}>
            <Book size={20} />
            <span>Knowledge Base</span>
          </button>
          <button className={`${styles.navItem} ${activeTab === 'Instructions' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Instructions')}>
            <User size={20} />
            <span>Instructions</span>
          </button>
          <div 
            className={styles.navItemWrapper}
            onMouseEnter={() => setShowAiTooltip(true)}
            onMouseLeave={() => setShowAiTooltip(false)}
          >
            <button className={`${styles.navItem} ${activeTab === 'Create with AI' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Create with AI')}>
              <Sparkles size={20} />
              <span>Create with AI</span>
            </button>
            {showAiTooltip && (
              <div className={styles.aiTooltip}>
                AI-powered presentation generation wizard. Multi-step process: select presentation type, configure parameters (language, slide count, Manus profile), define structure, choose design theme, upload additional content, then generate slides automatically using AI.
              </div>
            )}
          </div>
          <button className={`${styles.navItem} ${activeTab === 'Import' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Import')}>
            <FileDown size={20} />
            <span>Import</span>
          </button>
          <button className={`${styles.navItem} ${activeTab === 'Templates' ? styles.navItemActive : ''}`} onClick={() => setActiveTab('Templates')}>
            <Star size={20} />
            <span>Templates</span>
          </button>
        </div>

        <div className={styles.headerCenter}>
          {/* <button 
            className={styles.iconBtn} 
            title="Train Mode"
            onClick={() => router.push(`/coach/${templateId}`)}
          >
            <Dumbbell size={18} />
          </button> */}
          <button className={styles.iconBtn} title="Preview" onClick={() => window.open(`/preview/${templateId}`, '_blank')}><Eye size={18} /></button>
          <button className={styles.iconBtn} title="Export"><Download size={18} /></button>
          {/* Duplicate button removed */}
          <button className={styles.saveMyTplBtn} onClick={() => setShowSaveDialog(true)}>
            <Bookmark size={15} /> Save as My Template
          </button>
          <button className={styles.saveBtn}>
            <CloudUpload size={16} /> Save
          </button>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.avatar}>IM</div>
          <button className={styles.iconBtn}><Grid size={18} /></button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className={styles.workspace}>
        {activeTab === 'Templates' ? (
          <div className={styles.templatesTabContent}>
            <div className={styles.templatesHeader}>
              <h2 className={styles.templatesTitle}>Templates</h2>
               <p className={styles.templatesDesc}>Pick a template to replace the current slides with the template&apos;s slides.</p>
              
              <div className={styles.templatesFilters}>
                <div className={styles.searchWrap}>
                  <Search size={16} className={styles.searchIcon} />
                  <input type="text" placeholder="Search templates..." className={styles.searchInput} />
                </div>
                <div className={styles.dropdownWrap}>
                  <select className={styles.selectInput}>
                    <option>All types</option>
                  </select>
                  <ChevronDown size={14} className={styles.chevronIcon} />
                </div>
                <div className={styles.dropdownWrap}>
                  <select className={styles.selectInput}>
                    <option>Default order</option>
                  </select>
                  <ChevronDown size={14} className={styles.chevronIcon} />
                </div>
              </div>
            </div>
            
            <div className={styles.templatesGallery}>
              <TemplatesTable
                templates={MOCK_PRESENTATION_TEMPLATES}
                onEdit={() => {}}
                onDelete={() => {}}
                onCopy={() => {}}
                onUseTemplate={handleUseTemplate}
              />
            </div>
          </div>
        ) : activeTab === 'Slides' ? (
          <>
            <EditorSidebar 
              activeSlideId={activeSlideId} 
              onSelectSlide={(id) => {
                setActiveSlideId(id)
                setSelectedElementId(null)
              }}
              slidesCount={slides.length}
              slideTitles={slides.map(s => (s as { title?: string }).title ?? `Slide ${s.id}`)}
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
          </>
        ) : (
          <div className={styles.placeholderTab}>
            <div className={styles.placeholderIcon}>🚧</div>
            <h3>{activeTab} Content</h3>
            <p>This section is under development.</p>
          </div>
        )}
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
              <div className={styles.saveSuccess}>✅ Template saved! Find it in &quot;My Templates&quot; on the dashboard.</div>
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
