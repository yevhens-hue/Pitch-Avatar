'use client'

import React, { useState, useRef, useCallback } from 'react'
import { X, FileText, Video, Square, LayoutTemplate, Sparkles, Upload, ChevronDown, ChevronUp, Link, AlignLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './CreateProjectModal.module.css'

/* ── Types ── */
export type ModalTabId = 'file' | 'video' | 'scratch' | 'template' | 'ai'

export interface CreateProjectModalProps {
  isOpen: boolean
  initialTab?: ModalTabId
  onClose: () => void
}

const TABS: { id: ModalTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'file',     label: 'Upload file',         icon: <FileText size={13} /> },
  { id: 'video',    label: 'Upload video',         icon: <Video size={13} /> },
  { id: 'scratch',  label: 'Start from scratch',   icon: <Square size={13} /> },
  { id: 'template', label: 'Start from template',  icon: <LayoutTemplate size={13} /> },
  { id: 'ai',       label: 'Create with AI',       icon: <Sparkles size={13} /> },
]

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian', 'Arabic', 'Japanese', 'Chinese']
const TEMPLATES = [
  'B2B Sales Pitch', 'Company Onboarding', 'Product Demo',
  'Investor Update', 'Academic Lecture', 'Startup Pitch Deck',
  'Conference Keynote', 'Training Manual', 'Marketing Overview',
]

const BLANK_SLIDES = [
  { id: 'blank', label: 'Blank slide' },
  { id: 'title', label: 'Title + Content' },
  { id: 'avatar', label: 'Avatar + Text' },
  { id: 'split',  label: 'Split Screen' },
]

/* ── Google Drive Icon ── */
const GDriveIcon = () => (
  <span className={styles.gdriveIcon}>G</span>
)

/* ── Main Component ── */
export default function CreateProjectModal({ isOpen, initialTab = 'file', onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<ModalTabId>(initialTab)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isVideoDragging, setIsVideoDragging] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState('blank')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [aiTemplate, setAiTemplate] = useState('')
  const [aiLanguage, setAiLanguage] = useState('English')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [createSlideTexts, setCreateSlideTexts] = useState(true)
  const [createScripts, setCreateScripts] = useState(true)
  const [maxWords, setMaxWords] = useState('40')
  const [paragraphs, setParagraphs] = useState('3')

  // Sync tab when initialTab changes (when modal reopens)
  React.useEffect(() => {
    if (isOpen) setActiveTab(initialTab)
  }, [isOpen, initialTab])

  /* ── Validation ── */
  const isCreateEnabled = (() => {
    switch (activeTab) {
      case 'file':     return !!file
      case 'video':    return !!videoFile || youtubeUrl.trim().length > 0
      case 'scratch':  return true
      case 'template': return !!selectedTemplate
      case 'ai':       return !!aiTemplate
      default:         return false
    }
  })()

  /* ── Handlers ── */
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsVideoDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setVideoFile(f)
  }, [])

  const handleCreate = () => {
    // Route to appropriate wizard page with context
    const params = new URLSearchParams({ name: name || 'Untitled', tab: activeTab })
    switch (activeTab) {
      case 'file':     router.push(`/create/quick?${params}`); break
      case 'video':    router.push(`/create/video?${params}`); break
      case 'scratch':  router.push(`/create/scratch?${params}`); break
      case 'template': router.push(`/create/quick?${params}`); break
      case 'ai':       router.push(`/create/scratch?${params}`); break
    }
    onClose()
  }

  const handleClose = () => {
    setName('')
    setFile(null)
    setVideoFile(null)
    setYoutubeUrl('')
    setSelectedTemplate('')
    setAiTemplate('')
    setShowAdvanced(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Create new presentation">

        {/* ── Header ── */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Create new presentation</h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>
          {/* Name input */}
          <input
            className={styles.nameInput}
            placeholder="Presentation name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />

          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className={styles.tabContent}>

            {/* ── Upload File ── */}
            {activeTab === 'file' && (
              <>
                {file ? (
                  <div className={styles.fileChosen}>
                    <FileText size={16} />
                    <span className={styles.fileChosenName}>{file.name}</span>
                    <button className={styles.fileChosenRemove} onClick={() => setFile(null)}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`${styles.splitDrop} ${isDragging ? styles.splitDropActive : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={styles.splitLeft}>
                      <span className={styles.splitDropText}>Drag files here</span>
                      <span className={styles.splitDropLink}>or click to select</span>
                    </div>
                    <div className={styles.splitDivider} />
                    <div className={styles.splitRight}>
                      <span className={styles.splitRightTitle}>Choose from</span>
                      <button className={styles.gdriveBtn} onClick={e => e.stopPropagation()}>
                        <GDriveIcon /> Google Drive
                      </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx" hidden
                      onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
                  </div>
                )}
                <p className={styles.dropHint}>Upload .pdf, .ppt or .pptx file up to 100 MB, max 100 slides</p>
              </>
            )}

            {/* ── Upload Video ── */}
            {activeTab === 'video' && (
              <>
                <input
                  className={styles.urlInput}
                  placeholder="YouTube URL"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                />
                <div className={styles.orDivider}>or</div>
                {videoFile ? (
                  <div className={styles.fileChosen}>
                    <Video size={16} />
                    <span className={styles.fileChosenName}>{videoFile.name}</span>
                    <button className={styles.fileChosenRemove} onClick={() => setVideoFile(null)}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`${styles.splitDrop} ${isVideoDragging ? styles.splitDropActive : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsVideoDragging(true) }}
                    onDragLeave={() => setIsVideoDragging(false)}
                    onDrop={handleVideoDrop}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    <div className={styles.splitLeft}>
                      <span className={styles.splitDropText}>Drag files here</span>
                      <span className={styles.splitDropLink}>or click to select</span>
                    </div>
                    <div className={styles.splitDivider} />
                    <div className={styles.splitRight}>
                      <span className={styles.splitRightTitle}>Choose from</span>
                      <button className={styles.gdriveBtn} onClick={e => e.stopPropagation()}>
                        <GDriveIcon /> Google Drive
                      </button>
                    </div>
                    <input ref={videoInputRef} type="file" accept=".mp4,.mov" hidden
                      onChange={e => e.target.files?.[0] && setVideoFile(e.target.files[0])} />
                  </div>
                )}
                <p className={styles.dropHint}>Upload .mp4 file up to 500 MB, max 60 minutes</p>
              </>
            )}

            {/* ── Start from scratch ── */}
            {activeTab === 'scratch' && (
              <div className={styles.scratchGrid}>
                {BLANK_SLIDES.map(s => (
                  <div
                    key={s.id}
                    className={`${styles.slideThumb} ${selectedSlide === s.id ? styles.slideThumbSelected : ''}`}
                    onClick={() => setSelectedSlide(s.id)}
                  >
                    <div className={styles.slideThumbImg}>
                      <div className={styles.slideThumbLines}>
                        <div className={styles.slideThumbLine} />
                        <div className={styles.slideThumbLine} />
                        <div className={styles.slideThumbLine} />
                        <div className={styles.slideThumbLine} />
                      </div>
                    </div>
                    <span className={styles.slideThumbLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Start from template ── */}
            {activeTab === 'template' && (
              <div className={styles.templateGrid}>
                {TEMPLATES.map(t => (
                  <div
                    key={t}
                    className={`${styles.templateThumb} ${selectedTemplate === t ? styles.templateThumbSelected : ''}`}
                    onClick={() => setSelectedTemplate(t)}
                  >
                    <div className={styles.templateThumbImg}>{t[0]}</div>
                    <div className={styles.templateThumbName}>{t}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Create with AI ── */}
            {activeTab === 'ai' && (
              <>
                <div className={styles.aiSection}>
                  <div className={styles.aiSectionTitle}>Content source</div>
                  <div className={styles.aiSectionDesc}>Add content sources for creating a presentation</div>
                  <div className={styles.aiSourceBtns}>
                    <button className={styles.aiSourceBtn}><AlignLeft size={14} /> Add text</button>
                    <button className={styles.aiSourceBtn}><Link size={14} /> Add URL</button>
                    <button className={styles.aiSourceBtn}><Upload size={14} /> Add file</button>
                  </div>
                </div>

                <div className={styles.aiSectionTitle}>Presentation creation settings</div>
                <div style={{ height: '0.875rem' }} />

                <div className={styles.aiFormGroup}>
                  <span className={styles.aiLabel}>Choose template *</span>
                  <select
                    className={styles.aiSelect}
                    value={aiTemplate}
                    onChange={e => setAiTemplate(e.target.value)}
                  >
                    <option value="">Choose template *</option>
                    {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className={styles.aiFormGroup}>
                  <span className={styles.aiLabel}>Presentation language *</span>
                  <select
                    className={styles.aiSelect}
                    value={aiLanguage}
                    onChange={e => setAiLanguage(e.target.value)}
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </>
            )}

          </div>
          <div style={{ height: '1.25rem' }} />
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <div className={styles.footerRow}>
            <button
              className={styles.createBtn}
              onClick={handleCreate}
              disabled={!isCreateEnabled}
            >
              Create
            </button>
            <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
            <div className={styles.spacer} />
            <button className={styles.advancedToggle} onClick={() => setShowAdvanced(v => !v)}>
              Advanced settings {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Advanced panel */}
          {showAdvanced && (
            <div className={styles.advancedPanel}>
              <div className={styles.advancedRow}>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={createSlideTexts} onChange={e => setCreateSlideTexts(e.target.checked)} />
                  <div>
                    <div className={styles.checkLabel}>Create slide texts</div>
                    <div className={styles.checkDesc}>Text is created for each slide of the presentation</div>
                  </div>
                </label>
                <label className={styles.checkRow}>
                  <input type="checkbox" checked={createScripts} onChange={e => setCreateScripts(e.target.checked)} />
                  <div>
                    <div className={styles.checkLabel}>Create slide text scripts</div>
                    <div className={styles.checkDesc}>For each slide, two text scripts are created: short and long</div>
                  </div>
                </label>
              </div>
              <div className={styles.advancedFormRow}>
                <div className={styles.advancedFieldWrap}>
                  <span className={styles.advancedLabel}>Max words per slide *</span>
                  <input className={styles.advancedInput} type="number" value={maxWords}
                    onChange={e => setMaxWords(e.target.value)} min={10} max={300} />
                </div>
                <div className={styles.advancedFieldWrap}>
                  <span className={styles.advancedLabel}>Slide text paragraphs *</span>
                  <input className={styles.advancedInput} type="number" value={paragraphs}
                    onChange={e => setParagraphs(e.target.value)} min={1} max={10} />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
