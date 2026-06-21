'use client'

import React, { useState } from 'react'
import {
  MoreVertical, Edit, Trash2, Copy, Search, X,
  Layers, LayoutGrid, List, Plus, ExternalLink,
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

const BADGE_COLOR: Record<string, string> = {
  Popular: '#0076ff',
  New:     '#10b981',
  Hot:     '#ef4444',
}

interface TemplatesTableProps {
  templates: PresentationTemplate[]
  onEdit?: (template: PresentationTemplate) => void
  onDelete?: (template: PresentationTemplate) => void
  onCopy?: (template: PresentationTemplate) => void
  onUseTemplate?: (template: PresentationTemplate) => void
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
  const [activeSlideIdx, setActiveSlideIdx] = useState(0)
  const [sortBy, setSortBy]           = useState('recommended')
  const [realProjectSlides, setRealProjectSlides] = useState<ExtendedSlideContent[]>([])

  React.useEffect(() => { 
    setActiveSlideIdx(0) 
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

  // Filter
  const filtered = templates.filter(t => {
    if (t.accessType === 'inactive') return false
    const matchCat  = activeCategory === 'All' || t.productTypes.includes(activeCategory)
    const matchProj = activeProjectType === 'All' || t.projectType === activeProjectType
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

  const openEditor = (id: string) => router.push(`/presentation-templates/${id}`)

  return (
    <div className={styles.root}>

      {/* ── Preview modal ── */}
      {previewTpl && (
        <div className={styles.previewModalOverlay} onClick={() => setPreviewId(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            {/* We no longer need the X button as we have Cancel button */}
            
            {/* Main slide preview */}
            <div className={styles.modalHeroNew}>
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
                  {previewTpl.projectType && (
                    <span className={styles.modalTagProject}>{previewTpl.projectType}</span>
                  )}
                  {previewTpl.tags?.map(tag => (
                    <span key={tag} className={styles.modalTagNew}>{tag.toUpperCase()}</span>
                  ))}
                  {previewTpl.badge && (
                    <span className={`${styles.modalTagNew} ${styles[`badge${previewTpl.badge}`] || ''}`}>
                      {previewTpl.badge.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={styles.modalSlidesCount}>
                  <Layers size={14} /> {previewTpl.slideCount} slides
                </div>
              </div>

              <h2 className={styles.modalTitle}>{previewTpl.name}</h2>
              <p className={styles.modalDesc}>{previewTpl.description}</p>
              
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
            const emoji = CATEGORY_EMOJI[tpl.productTypes[0]] ?? '📋'
            return (
              <div
                key={tpl.id}
                className={styles.templateCard}
                onClick={() => openEditor(tpl.id)}
              >
                {/* Cover */}
                <div className={styles.templateImage} style={{ background: grad }}>
                  <div className={styles.templateEmojiCover}>{emoji}</div>
                  {tpl.badge && (
                    <div
                      className={`${styles.cardBadge} ${styles[`badge${tpl.badge}`] || ''}`}
                    >
                      {tpl.badge === 'Hot' ? '🔥' : tpl.badge === 'New' ? '✨' : '⭐'} {tpl.badge}
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
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={styles.templateCategory}>{tpl.productTypes[0]}</span>
                      <span className={styles.templateProjectType}>{tpl.projectType}</span>
                    </div>
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
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className={styles.templateTags}>
                      {tpl.tags.map(tag => (
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
            const emoji = CATEGORY_EMOJI[tpl.productTypes[0]] ?? '📋'
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
                <span className={styles.listCategory}>{tpl.productTypes[0]}</span>
                <span className={styles.listProjectType}>{tpl.projectType}</span>
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
