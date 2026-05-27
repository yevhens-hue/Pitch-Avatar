'use client'

import React, { useState } from 'react'
import {
  MoreVertical, Edit, Trash2, Copy, Search, X,
  Layers, LayoutGrid, List, Plus, ExternalLink,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PresentationTemplate, PRODUCT_TYPES, PROJECT_TYPES_LIST } from '@/data/presentation-templates'
import { MOCK_TEMPLATE_CONTENTS } from '@/data/template-content'
import styles from './TemplatesTable.module.css'

// ── Mini slide strip inside preview modal ─────────────────────────────────────
function MiniSlideStrip({ templateId, gradient }: { templateId: string; gradient: string }) {
  const content = MOCK_TEMPLATE_CONTENTS[templateId]
  if (!content) return null

  return (
    <div className={styles.miniSlideStrip}>
      {content.slides.map((slide, i) => {
        const firstBubble = slide.elements.find(el => el.type === 'bubble')
        const firstLine = firstBubble?.content?.split('\n')[0]?.replace(/^(Title:|Header:)\s*/i, '') ?? ''
        return (
          <div key={slide.id} className={styles.miniSlide} style={{ background: gradient }}>
            <div className={styles.miniSlideNum}>{i + 1}</div>
            {firstLine && <div className={styles.miniSlideText}>{firstLine}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ── Shared constants (same as Dashboard) ──────────────────────────────────────
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
  Popular: '#6366f1',
  New:     '#10b981',
  Hot:     '#ef4444',
}

interface TemplatesTableProps {
  templates: PresentationTemplate[]
  onEdit: (template: PresentationTemplate) => void
  onDelete: (id: string) => void
  onCopy: (template: PresentationTemplate) => void
  onAdd?: () => void
  onUseTemplate?: (template: PresentationTemplate) => void
}

export default function TemplatesTable({
  templates, onEdit, onDelete, onCopy, onAdd, onUseTemplate
}: TemplatesTableProps) {
  const router = useRouter()
  const [search, setSearch]           = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeProjectType, setActiveProjectType] = useState('All')
  const [viewMode, setViewMode]       = useState<'grid' | 'list'>('grid')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [previewId, setPreviewId]     = useState<string | null>(null)

  // Filter
  const filtered = templates.filter(t => {
    const matchCat  = activeCategory === 'All' || t.productTypes.includes(activeCategory)
    const matchProj = activeProjectType === 'All' || t.projectType === activeProjectType
    const q         = search.toLowerCase().trim()
    const matchQ    = !q || t.name.toLowerCase().includes(q) || t.tags?.some(tag => tag.toLowerCase().includes(q))
    return matchCat && matchProj && matchQ
  })

  const gradient = (t: PresentationTemplate) =>
    COVER_GRADIENTS[(Number(t.id) - 1) % COVER_GRADIENTS.length]

  const previewTpl = previewId ? templates.find(t => t.id === previewId) ?? null : null

  const openEditor = (id: string) => router.push(`/presentation-templates/${id}`)

  return (
    <div className={styles.root}>

      {/* ── Preview modal ── */}
      {previewTpl && (
        <div className={styles.previewModalOverlay} onClick={() => setPreviewId(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setPreviewId(null)}>✕</button>

            {/* Gradient hero */}
            <div
              className={styles.modalHero}
              style={{ background: gradient(previewTpl) }}
            >
              <div className={styles.modalHeroEmoji}>
                {CATEGORY_EMOJI[previewTpl.productTypes[0]] ?? '📋'}
              </div>
              <div className={styles.modalBadge}>{previewTpl.productTypes[0]}</div>
              <div className={styles.modalSlides}><Layers size={13} /> {previewTpl.slideCount} slides</div>
            </div>

            {/* Mini slide previews */}
            <MiniSlideStrip
              templateId={previewTpl.id}
              gradient={gradient(previewTpl)}
            />

            <div className={styles.modalBody}>
              <div className={styles.modalTags}>
                {previewTpl.tags?.map(tag => (
                  <span key={tag} className={styles.modalTag}>{tag}</span>
                ))}
                {previewTpl.badge && (
                  <span className={`${styles.modalTag} ${styles[`badge${previewTpl.badge}`] || ''}`}>
                    {previewTpl.badge}
                  </span>
                )}
              </div>
              <h2>{previewTpl.name}</h2>
              <p>{previewTpl.description}</p>
              <div className={styles.modalActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => { setPreviewId(null); if (onUseTemplate) onUseTemplate(previewTpl); else openEditor(previewTpl.id) }}
                >
                  Use this template →
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
                  <button className={styles.listActionBtn} onClick={() => openEditor(tpl.id)} title="Open editor">
                    <ExternalLink size={15} />
                  </button>
                  <button
                    className={styles.listActionBtn}
                    onClick={() => setActiveMenuId(activeMenuId === tpl.id ? null : tpl.id)}
                  >
                    <MoreVertical size={15} />
                  </button>
                  {activeMenuId === tpl.id && (
                    <div className={styles.dropdownMenu}>
                      <button onClick={() => { onEdit(tpl); setActiveMenuId(null) }}>
                        <Edit size={14} /> Edit Metadata
                      </button>
                      <button onClick={() => { onCopy(tpl); setActiveMenuId(null) }}>
                        <Copy size={14} /> Duplicate
                      </button>
                      <button className={styles.danger} onClick={() => { onDelete(tpl.id); setActiveMenuId(null) }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
