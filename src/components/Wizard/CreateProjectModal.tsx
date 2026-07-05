'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, FileText, Video, Square, LayoutTemplate, Sparkles, Upload, ChevronDown, ChevronUp, Link, AlignLeft, Info, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates'
import { useTemplateStore } from '@/lib/templateStore'
import { createProject } from '@/app/actions/projects'
import { updateProjectSlides } from '@/app/actions/projectSlides'
import CoachSetup from './CoachSetup'
import styles from './CreateProjectModal.module.css'

/* ── Types ── */
export type ModalTabId = 'file' | 'video' | 'scratch' | 'template' | 'ai'

export interface CreateProjectModalProps {
  isOpen: boolean
  initialTab?: ModalTabId
  initialTemplateId?: string
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
export default function CreateProjectModal({ isOpen, initialTab = 'file', initialTemplateId, onClose }: CreateProjectModalProps) {
  const router = useRouter()
  const { templates: TEMPLATES } = useTemplateStore()
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
  const [isCoachMode, setIsCoachMode] = useState(false)
  const [traineeRole, setTraineeRole] = useState('buyer')
  const [createSlideTexts, setCreateSlideTexts] = useState(true)
  const [createScripts, setCreateScripts] = useState(true)
  const [maxWords, setMaxWords] = useState('40')
  const [paragraphs, setParagraphs] = useState('3')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [progress, setProgress] = useState(5)

  // Is this a direct template creation from the dashboard?
  const isDirectTemplateMode = initialTab === 'template' && !!initialTemplateId;

  // Sync tab when initialTab changes (when modal reopens)
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      if (initialTemplateId) {
        setSelectedTemplate(initialTemplateId)
        setAiTemplate(initialTemplateId)
        const tplName = TEMPLATES.find(t => t.id === initialTemplateId)?.name || 'Template'
        setName(`${tplName} - Project`)
      } else {
        setName('')
      }
    }
  }, [isOpen, initialTab, initialTemplateId])

  /* ── Validation ── */
  const isCreateEnabled = (() => {
    if (isCoachMode && !traineeRole) return false;
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

  const handleCreate = async () => {
    setIsGenerating(true);

    try {
      const projectTitle = name || (activeTab === 'template' ? 'New Template Project' : 'Untitled Project');
      
      // 1. Create project in DB
      const proj = await createProject({
        title: projectTitle,
        type: activeTab === 'video' ? 'video' : 'presentation',
        status: 'draft',
        isCoachMode,
        traineeRole
      });

      if (!proj) throw new Error("Failed to create project");
      setCreatedProjectId(proj.id);

      // 2. If it's a file upload, send to Python Converter Service
      if (activeTab === 'file' && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", proj.id);

        const converterUrl = process.env.NEXT_PUBLIC_CONVERTER_URL || 'http://localhost:8000';
        
        try {
          // Always call our own Next.js proxy route — it reads CONVERTER_URL server-side
          const res = await fetch(`/api/convert`, {
            method: 'POST',
            body: formData
          });

          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.error || `Converter returned ${res.status}`);
          }

          const slidesData = await res.json();
          if (slidesData && slidesData.length > 0) {
            await updateProjectSlides(proj.id, slidesData);
          } else {
            throw new Error("No slides returned from converter");
          }
        } catch (err) {
          console.error("Backend conversion failed:", err);
          // Fallback to error slide
          await updateProjectSlides(proj.id, [
             { id: 1, text: 'Error. Backend conversion failed. Make sure Python service is running locally on port 8000, or NEXT_PUBLIC_CONVERTER_URL is set.', title: 'Extraction Error' }
          ]);
        }

      } else if (activeTab === 'scratch') {
        await updateProjectSlides(proj.id, [{ id: 1, text: '', title: 'Blank Slide' }]);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }

    let p = 5;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 20) + 10;
      if (p >= 100) {
        p = 100;
        setProgress(p);
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setIsSuccess(true);
        }, 500);
      } else {
        setProgress(p);
      }
    }, 600);
  }

  const handleActualCreate = () => {
    onClose()
    if (createdProjectId) {
      router.push(`/editor?projectId=${createdProjectId}`)
    } else {
      router.push('/editor')
    }
  }

  const handleClose = () => {
    setName('')
    setFile(null)
    setVideoFile(null)
    setYoutubeUrl('')
    setSelectedTemplate('')
    setAiTemplate('')
    setShowAdvanced(false)
    setIsCoachMode(false)
    setIsGenerating(false)
    setIsSuccess(false)
    setCreatedProjectId(null)
    setProgress(5)
    onClose()
  }

  if (!isOpen) return null

  if (isSuccess) {
    return (
      <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
        <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '720px' }}>
          <div className={styles.header} style={{ borderBottom: 'none', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className={styles.headerTitle} style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Ваша презентация загружена
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={styles.closeBtn} onClick={() => alert('Sharing functionality coming soon')} aria-label="Share">
                <Share2 size={18} />
              </button>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className={styles.body} style={{ padding: '0 1.5rem 2.5rem', overflowY: 'visible' }}>
            <div className={styles.successGrid}>
              
              <div className={styles.successCard}>
                <div className={styles.successCardImage}>
                   <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', padding: '1rem' }}>
                     Презентация сгенерирована
                   </div>
                </div>
                <div className={styles.successCardText}>
                  Теперь вы можете её отредактировать
                </div>
                <button className={styles.successBtnPrimary} onClick={handleActualCreate}>
                  Редактировать
                </button>
              </div>

              <div className={styles.successCard}>
                <div className={styles.successCardQr}>
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://pitchavatar.com" alt="QR Code" />
                </div>
                <div className={styles.successCardText} style={{ padding: '0 1rem' }}>
                  Посмотрите, как презентация будет выглядеть для ваших слушателей
                </div>
                <button className={styles.successBtnOutline} onClick={() => router.push('/play/demo')}>
                  Проверить
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
        <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxWidth: '680px' }}>
          <div className={styles.header} style={{ position: 'relative', justifyContent: 'center', borderBottom: 'none', paddingBottom: '0.5rem' }}>
            <h2 className={styles.headerTitle} style={{ textAlign: 'center', fontSize: '1.25rem' }}>
              Подождите! Мы загружаем вашу презентацию
            </h2>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close" style={{ position: 'absolute', right: '1.5rem' }}>
              <X size={18} />
            </button>
          </div>
          
          <div className={styles.body} style={{ padding: '1rem 1.5rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'visible' }}>
            <div className={styles.loadingVideoPlaceholder}></div>
            
            <div className={styles.progressContainer}>
               <div className={styles.progressInfo}>
                 <span className={styles.progressTime}>
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <circle cx="12" cy="12" r="10" />
                     <polyline points="12 6 12 12 16 14" />
                   </svg>
                   3 минут до создания
                 </span>
                 <span style={{ fontSize: '1.05rem' }}>{progress}%</span>
               </div>
               <div className={styles.progressBar}>
                 <div className={styles.progressFill} style={{ width: `${progress}%` }} />
               </div>
            </div>
            
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex' }}>
              <button className={styles.continueBackgroundBtn} onClick={handleActualCreate}>
                Продолжить в фоновом режиме <Info size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          {!isDirectTemplateMode && (
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
          )}

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
              isDirectTemplateMode ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                  <p>You are about to create a new interactive presentation based on the <strong>{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong> template.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>The template contents will be loaded into your editor.</p>
                </div>
              ) : (
                <div className={styles.templateGrid}>
                  {TEMPLATES.map(t => (
                    <div
                      key={t.id}
                      className={`${styles.templateThumb} ${selectedTemplate === t.id ? styles.templateThumbSelected : ''}`}
                      onClick={() => setSelectedTemplate(t.id)}
                    >
                      <div className={styles.templateThumbImg}>{t.name[0]}</div>
                      <div className={styles.templateThumbName}>{t.name}</div>
                    </div>
                  ))}
                </div>
              )
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
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
              {isDirectTemplateMode ? 'Start Editing' : 'Create'}
            </button>
            <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
            <div className={styles.spacer} />
            {!isDirectTemplateMode && (
              <button className={styles.advancedToggle} onClick={() => setShowAdvanced(v => !v)}>
                Advanced settings {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
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
              <div className={styles.advancedFormRow}>
                <div style={{ gridColumn: 'span 2' }}>
                  <CoachSetup
                    isCoachMode={isCoachMode}
                    setIsCoachMode={setIsCoachMode}
                    traineeRole={traineeRole}
                    setTraineeRole={setTraineeRole}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
