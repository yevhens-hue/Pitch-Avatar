'use client'

import React, { useState } from 'react'
import {
  MoreVertical, Edit, Trash2, Copy, Search, X,
  Layers, LayoutGrid, List, Plus, ExternalLink,
  Bot, FileText, Volume2, VolumeX, Play, Pause, Lock, Mic
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PresentationTemplate, PRODUCT_TYPES, PROJECT_TYPES_LIST } from '@/data/presentation-templates'
import { MOCK_TEMPLATE_CONTENTS, SlideContent } from '@/data/template-content'
import { getProjectById } from '@/app/actions/projects'
import styles from './TemplatesTable.module.css'

type ExtendedSlideContent = SlideContent & { image_url?: string }

// ── Helpers to extract readable text from a slide ─────────────────────────────
function getSlideHeadline(slide: SlideContent): string {
  const titleEl = slide.elements.find(el => el.type === 'bubble' && el.content?.startsWith('Title:'))
  if (titleEl) return titleEl.content!.replace(/^Title:\s*/i, '').split('\n')[0]
  const headerEl = slide.elements.find(el => el.type === 'bubble' && el.content?.startsWith('Header:'))
  if (headerEl) return headerEl.content!.replace(/^Header:\s*/i, '').split('\n')[0]
  return slide.title
}

function getSlideBody(slide: SlideContent): string {
  const subEl = slide.elements.find(el => el.id === 'sub')
  if (subEl?.content) return subEl.content.split('\n').find(l => l.trim()) ?? ''
  const bodyEl = slide.elements.find(el => el.id === 'body' || el.id === 'list')
  if (bodyEl?.content) return bodyEl.content.split('\n').find(l => l.trim()) ?? ''
  return ''
}

// ── Hero slide mockup rendered inside the modal gradient area ─────────────────
function SlideHeroMock({ slide, slideNum, total }: { slide: SlideContent; slideNum: number; total: number }) {
  const headline = getSlideHeadline(slide)
  const body = getSlideBody(slide)
  const truncBody = body.length > 72 ? body.slice(0, 72) + '...' : body
  return (
    <div className={styles.slideHeroMock}>
      <div className={styles.slideHeroTag}>Slide {slideNum} / {total}</div>
      <div className={styles.slideHeroTitle}>{headline}</div>
      {truncBody && <div className={styles.slideHeroBody}>{truncBody}</div>}
      <div className={styles.slideHeroLines}>
        <div className={styles.slideHeroLine} />
        <div className={styles.slideHeroLine} style={{ width: '55%' }} />
      </div>
    </div>
  )
}

// ── Mini slide strip inside preview modal ─────────────────────────────────────
function MiniSlideStrip({
  slides, gradient, activeIdx, onSlideClick,
}: {
  slides: ExtendedSlideContent[]
  gradient: string
  activeIdx: number
  onSlideClick: (idx: number) => void
}) {
  if (!slides || slides.length === 0) return null

  return (
    <div className={styles.miniSlideStrip}>
      {slides.map((slide, i) => {
        const firstLine = getSlideHeadline(slide)
        return (
          <div
            key={slide.id}
            className={`${styles.miniSlide} ${i === activeIdx ? styles.miniSlideActive : ''}`}
            onClick={() => onSlideClick(i)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSlideClick(i)}
            aria-label={`Preview slide ${i + 1}: ${slide.title}`}
          >
            {slide.image_url && <img src={slide.image_url} alt={slide.title} className={styles.miniSlideImg} />}
          </div>
        )
      })}
    </div>
  )
}

// ── Shared constants (same as Dashboard) ──────────────────────────────────────
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

const CATEGORY_EMOJI: Record<string, string> = {
  HR: '👥',
  'Internal Communications': '📣',
  Marketing: '🚀',
  Sales: '💼',
  Support: '🎧',
  Compliance: '⚖️',
  'IT Security': '🔐',
}

interface TemplatesTableProps {
  templates: PresentationTemplate[]
  onEdit?: (template: PresentationTemplate) => void
  onDelete?: (template: PresentationTemplate) => void
  onCopy?: (template: PresentationTemplate) => void
  onUseTemplate?: (template: PresentationTemplate) => void
}

// Helper functions to resolve clean display labels regardless of store data ordering
const checkIsAvatarTemplate = (t: PresentationTemplate): boolean => {
  if (!t) return false
  if (t.avatarName || t.voiceName) return true
  if (t.projectType && (t.projectType.toLowerCase().includes('avatar') || t.projectType.toLowerCase().includes('bot'))) return true
  if (t.productTypes?.some(p => p.toLowerCase().includes('avatar'))) return true
  return false
}

const getProjectTypeLabel = (t: PresentationTemplate): string => {
  const isAvatar = checkIsAvatarTemplate(t)
  if (isAvatar) {
    if (t.projectType && (t.projectType.toLowerCase().includes('avatar') || t.projectType.toLowerCase().includes('presentation +'))) {
      return t.projectType
    }
    return 'Presentation + AI Avatar'
  }
  return 'Presentation'
}

const getCategoryLabel = (t: PresentationTemplate): string => {
  if (!t || !t.productTypes || t.productTypes.length === 0) return ''
  const validCat = t.productTypes.find(p => 
    !p.toLowerCase().includes('presentation') && 
    !p.toLowerCase().includes('avatar')
  )
  if (validCat) return validCat
  const first = t.productTypes[0]
  if (first && !first.toLowerCase().includes('presentation') && !first.toLowerCase().includes('avatar')) {
    return first
  }
  return ''
}

export default function TemplatesTable({
  templates, onUseTemplate
}: TemplatesTableProps) {
  const router = useRouter()
  const [search, setSearch]           = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeProjectType, setActiveProjectType] = useState('All')
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid')
  const [previewId, setPreviewId]     = useState<string | null>(null)
  const [previewTab, setPreviewTab]   = useState<'presentation' | 'avatar'>('presentation')
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)
  const [sortBy, setSortBy]           = useState('recommended')
  const [realProjectSlides, setRealProjectSlides] = useState<ExtendedSlideContent[]>([])

  React.useEffect(() => { 
    setActiveSlideIdx(0) 
    setPreviewTab('presentation')
    setIsPlayingVoice(false)
    setRealProjectSlides([])
    if (previewId) {
      const tpl = templates.find(t => t.id === previewId)
      if (tpl?.selectedProjectId && tpl.selectedProjectId.includes('-')) {
        getProjectById(tpl.selectedProjectId).then(proj => {
          if (proj && proj.slides && proj.slides.length > 0) {
            const mapped = proj.slides.map((s: any, idx: number) => ({
              id: `proj_s_${idx}`,
              title: s.title || `Slide ${idx + 1}`,
              layout: 'title',
              image_url: s.image_url,
              elements: [
                { id: 'bubble_title', type: 'bubble', content: `Title: ${s.title || ''}` },
                { id: 'sub', type: 'text', content: s.content || '' },
              ]
            }))
            // Type assertion necessary as SlideContent layout enum is strict
            setRealProjectSlides(mapped as any)
          }
        }).catch(console.error)
      }
    }
  }, [previewId, templates])

  const toggleVoiceSample = (tpl: PresentationTemplate) => {
    if (isPlayingVoice) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsPlayingVoice(false)
    } else {
      setIsPlayingVoice(true)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        const text = `Hello! I am ${tpl.avatarName || 'Sara'}, your AI presenter. I will guide your audience through this presentation with clear narration.`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setIsPlayingVoice(false)
        utterance.onerror = () => setIsPlayingVoice(false)
        window.speechSynthesis.speak(utterance)
      } else {
        setTimeout(() => setIsPlayingVoice(false), 3500)
      }
    }
  }

  // Filter
  const filtered = templates.filter(t => {
    if (t.accessType === 'inactive') return false
    const matchCat  = activeCategory === 'All' || t.productTypes.includes(activeCategory)
    const isAvatarTpl = checkIsAvatarTemplate(t)
    const matchProj = activeProjectType === 'All' 
      || t.projectType === activeProjectType
      || (activeProjectType.includes('Avatar') && isAvatarTpl)
      || (activeProjectType === 'Presentation' && !isAvatarTpl)

    const q         = search.toLowerCase().trim()
    const matchQ    = !q || t.name.toLowerCase().includes(q) || t.tags?.some(tag => tag.toLowerCase().includes(q))
    return matchCat && matchProj && matchQ
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      case 'oldest':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      case 'az':
        return a.name.localeCompare(b.name)
      case 'za':
        return b.name.localeCompare(a.name)
      case 'mostSlides':
        return (b.slideCount || 0) - (a.slideCount || 0)
      case 'leastSlides':
        return (a.slideCount || 0) - (b.slideCount || 0)
      case 'recommended':
      default:
        return (a.order || 0) - (b.order || 0)
    }
  })

  const gradient = (t: PresentationTemplate) =>
    COVER_GRADIENTS[(Number(t.id) - 1) % COVER_GRADIENTS.length]

  const previewTpl = previewId ? templates.find(t => t.id === previewId) ?? null : null
  const mockContent = previewId ? MOCK_TEMPLATE_CONTENTS[previewId] ?? null : null
  const previewContent = realProjectSlides.length > 0 
    ? { id: 'real', slides: realProjectSlides }
    : mockContent
  const activeSlide = previewContent?.slides[activeSlideIdx] ?? null
  const isAvatarTemplate = previewTpl ? checkIsAvatarTemplate(previewTpl) : false

  const openEditor = (id: string) => router.push(`/presentation-templates/${id}`)

  return (
    <div className={styles.root}>

      {/* ── Preview modal ── */}
      {previewTpl && (
        <div className={styles.previewModalOverlay} onClick={() => { setPreviewId(null); if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel(); }}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '12px 20px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Preview Template: {previewTpl.name}
              </div>
              <button 
                className={styles.closeModalBtn}
                onClick={() => { setPreviewId(null); if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel(); }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Main slide preview */}
            <div className={styles.modalHeroWrap}>
              {activeSlide ? (
                activeSlide.image_url ? (
                  <div className={styles.slideHeroRealImageNew}>
                    <img src={activeSlide.image_url} alt={activeSlide.title} />
                  </div>
                ) : (
                  <div className={styles.modalHeroEmpty} />
                )
              ) : (
                <div className={styles.modalHeroEmpty} />
              )}
            </div>

            {/* Mini slide previews */}
            <div className={styles.modalMiniSlidesWrap}>
              <MiniSlideStrip
                slides={previewContent?.slides || []}
                gradient="#f1f5f9"
                activeIdx={activeSlideIdx}
                onSlideClick={setActiveSlideIdx}
              />
            </div>

            <div className={styles.modalBodyNew}>
              <div className={styles.modalTagsRow}>
                <div className={styles.modalTags}>
                  <span className={styles.modalTagProject}>{getProjectTypeLabel(previewTpl)}</span>
                  {getCategoryLabel(previewTpl) ? (
                    <span className={styles.modalTagCategory}>{getCategoryLabel(previewTpl)}</span>
                  ) : null}
                </div>
                <div className={styles.modalSlidesCount}>
                  <Layers size={14} /> {previewTpl.slideCount} slides
                </div>
              </div>

              {/* Avatar & Voice Info Card in Modal */}
              {isAvatarTemplate && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  margin: '16px 0 16px 0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={previewTpl.avatarImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                      alt={previewTpl.avatarName || 'Avatar'}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0076ff' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        👤 {previewTpl.avatarName || 'Sara (AI Avatar)'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🎙️ Voice: <span style={{ fontWeight: 600, color: '#334155' }}>{previewTpl.voiceName || 'Seraphina Multilingual'}</span> ({previewTpl.voiceLanguage || 'English'})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleVoiceSample(previewTpl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: isPlayingVoice ? '#ef4444' : '#0076ff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: isPlayingVoice ? '0 2px 8px rgba(239,68,68,0.3)' : '0 2px 8px rgba(0,118,255,0.25)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    aria-label={isPlayingVoice ? "Stop voice sample" : "Play voice sample"}
                  >
                    {isPlayingVoice ? <><Pause size={15} /> Stop</> : <><Volume2 size={15} /> Play Sample</>}
                  </button>
                </div>
              )}

              {/* Secondary Tags Row */}
              {(() => {
                const cat = getCategoryLabel(previewTpl).toLowerCase()
                const filteredTags = previewTpl.tags?.filter(t => t.toLowerCase() !== cat && t.toUpperCase() !== 'NEW') || []
                const hasBadge = previewTpl.badge && previewTpl.badge !== 'New'
                if (filteredTags.length === 0 && !hasBadge) return null

                return (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', marginTop: isAvatarTemplate ? '0' : '16px' }}>
                    {filteredTags.map(tag => (
                      <span key={tag} className={styles.modalTagNew}>{tag.toUpperCase()}</span>
                    ))}
                    {hasBadge && (
                      <span className={`${styles.modalTagNew} ${styles[`badge${previewTpl.badge!}`] || ''}`}>
                        {previewTpl.badge!.toUpperCase()}
                      </span>
                    )}
                  </div>
                )
              })()}

              <div className={styles.modalActionsNew}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setPreviewId(null)}
                >
                  Cancel
                </button>
                <button
                  className={styles.primaryBtn}
                  onClick={() => { setPreviewId(null); if (onUseTemplate) onUseTemplate(previewTpl); else openEditor(previewTpl.id) }}
                >
                  Use template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or tag…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className={styles.pills}>
          {PRODUCT_TYPES.map(cat => (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat !== 'All' && <span>{CATEGORY_EMOJI[cat] ?? '📋'}</span>}
              {cat}
            </button>
          ))}
        </div>

        {/* Right side controls */}
        <div className={styles.toolbarRight}>
          <select 
            className={styles.projectTypeSelect}
            value={activeProjectType}
            onChange={(e) => setActiveProjectType(e.target.value)}
          >
            <option value="All">All Types</option>
            {PROJECT_TYPES_LIST.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select 
            className={styles.projectTypeSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">Name (A-Z)</option>
            <option value="za">Name (Z-A)</option>
            <option value="mostSlides">Most slides</option>
            <option value="leastSlides">Least slides</option>
          </select>

          <span className={styles.countBadge}>{filtered.length} templates</span>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List size={16} />
          </button>
          {/* Add Template button removed for regular users */}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p>No templates match your search.</p>
          <button className={styles.clearSearchBtn} onClick={() => { setSearch(''); setActiveCategory('All'); setActiveProjectType('All'); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((tpl, idx) => {
            const grad  = gradient(tpl)
            const categoryLabel = getCategoryLabel(tpl)
            const projectTypeLabel = getProjectTypeLabel(tpl)
            const isAvatar = checkIsAvatarTemplate(tpl)
            const emoji = CATEGORY_EMOJI[categoryLabel] ?? CATEGORY_EMOJI[tpl.productTypes[0]] ?? '📋'
            return (
              <div
                key={tpl.id}
                className={styles.templateCard}
                onClick={() => openEditor(tpl.id)}
              >
                {/* Cover */}
                <div className={styles.templateImage} style={{ background: grad }}>
                  <div className={styles.templateEmojiCover}>{emoji}</div>

                  {/* Top Left: Project Type Overlay Badge */}
                  <div className={`${styles.cardCoverBadgeLeft} ${isAvatar ? styles.badgeAvatarType : styles.badgeClassicType}`}>
                    {isAvatar ? (
                      <>
                        <Bot size={12} style={{ marginRight: 4 }} />
                        {projectTypeLabel}
                      </>
                    ) : (
                      <>
                        <FileText size={12} style={{ marginRight: 4 }} />
                        {projectTypeLabel}
                      </>
                    )}
                  </div>

                  {/* Top Right: Popular / Hot badge */}
                  {tpl.badge && tpl.badge !== 'New' && (
                    <div
                      className={`${styles.cardBadge} ${styles[`badge${tpl.badge}`] || ''}`}
                    >
                      {tpl.badge === 'Hot' ? '🔥' : '⭐'} {tpl.badge}
                    </div>
                  )}
                  {/* Hover actions */}
                  <div className={styles.templateOverlay} onClick={e => e.stopPropagation()}>
                    <div className={styles.overlayBtns}>
                      <button className={styles.templateBtn} onClick={() => onUseTemplate ? onUseTemplate(tpl) : openEditor(tpl.id)}>
                        Use template
                      </button>
                      <button className={styles.previewBtn} onClick={() => setPreviewId(tpl.id)}>
                        Preview slides
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className={styles.templateInfo}>
                  <div className={styles.templateMetaRow}>
                    <span className={styles.templateCategory}>{categoryLabel}</span>
                    <span className={styles.templateSlideCount}>
                      <Layers size={11} /> {tpl.slideCount ?? 5} slides
                    </span>
                  </div>
                  <h4 className={styles.templateTplTitle}>
                    {tpl.name}
                    {tpl.isOnHomepage && <span title={`On Homepage (Order: ${tpl.order})`} style={{marginLeft: '6px', fontSize: '14px'}}>🏠</span>}
                  </h4>
                  {tpl.description && (
                    <p className={styles.templateDesc}>{tpl.description}</p>
                  )}
                  {tpl.tags && tpl.tags.filter(tag => tag.toLowerCase() !== categoryLabel.toLowerCase()).length > 0 && (
                    <div className={styles.templateTags}>
                      {tpl.tags
                        .filter(tag => tag.toLowerCase() !== categoryLabel.toLowerCase())
                        .map(tag => (
                          <span key={tag} className={styles.templateTag}>{tag}</span>
                        ))}
                    </div>
                  )}
                </div>


              </div>
            )
          })}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div className={styles.listTable}>
          <div className={styles.listHeader}>
            <span style={{ flex: 2 }}>Template</span>
            <span>Category</span>
            <span>Project Type</span>
            <span>Type</span>
            <span>Slides</span>
            <span>Created</span>
            <span style={{ width: 80 }}></span>
          </div>
          {filtered.map(tpl => {
            const grad  = gradient(tpl)
            const categoryLabel = getCategoryLabel(tpl)
            const projectTypeLabel = getProjectTypeLabel(tpl)
            const emoji = CATEGORY_EMOJI[categoryLabel] ?? CATEGORY_EMOJI[tpl.productTypes[0]] ?? '📋'
            return (
              <div key={tpl.id} className={styles.listRow} onClick={() => openEditor(tpl.id)}>
                {/* Mini cover */}
                <div className={styles.listCover} style={{ background: grad }}>
                  <span style={{ fontSize: '1rem' }}>{emoji}</span>
                </div>
                <div style={{ flex: 2 }}>
                  <div className={styles.listName}>
                    {tpl.name}
                    {tpl.isOnHomepage && <span title={`On Homepage (Order: ${tpl.order})`} style={{marginLeft: '6px', fontSize: '14px'}}>🏠</span>}
                  </div>
                  {tpl.description && (
                    <div className={styles.listDesc}>{tpl.description}</div>
                  )}
                </div>
                <span className={styles.listCategory}>{categoryLabel}</span>
                <span className={styles.listProjectType}>{projectTypeLabel}</span>
                <span className={styles.listType}>{tpl.templateType === 'generate' ? 'AI Generate' : 'Copy & Edit'}</span>
                <span className={styles.listSlides}>{tpl.slideCount ?? 5}</span>
                <span className={styles.listDate}>{tpl.createdAt?.slice(0, 10) ?? '—'}</span>
                <div className={styles.listActions} onClick={e => e.stopPropagation()}>
                  <button className={styles.listActionBtn} onClick={() => onUseTemplate ? onUseTemplate(tpl) : openEditor(tpl.id)} title="Use template">
                    <ExternalLink size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
