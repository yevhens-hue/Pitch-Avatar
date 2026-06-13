'use client'

import React from 'react'
import styles from './Dashboard.module.css'
import {
  Plus, Play, Video, MessageSquare, Target, ArrowRight,
  Layers, Search, Bookmark, Trash2, ExternalLink, X,
} from 'lucide-react'
import type { SlideContent } from '@/data/template-content'
import { useAuth } from '@/context/AuthContext'
import { PRODUCT_TYPES } from '@/data/presentation-templates'
import { MOCK_TEMPLATE_CONTENTS } from '@/data/template-content'
import { useUserTemplates, timeAgo } from '@/hooks/useUserTemplates'
import { useTemplateStore } from '@/lib/templateStore'
import Script from 'next/script'
import Link from 'next/link'

interface WizardCardProps {
  title: string
  subtitle?: string
  icon: React.ReactNode
  onClick?: () => void
  colorClass: string
  linkText: string
  tab?: string
}

const WizardCard = ({ title, subtitle, icon, onClick, colorClass, tab, linkText }: WizardCardProps) => (
  <div
    className={`${styles.wizardCard} ${styles[colorClass] || ''}`}
    onClick={onClick}
    data-tour={tab === 'quick' ? 'creation-method' : undefined}
  >
    <div className={styles.wizardTop}>
      <div className={styles.wizardIconWrapper}>{icon}</div>
      <div className={styles.wizardInfo}>
        <h3 className={styles.wizardTitle}>{title}</h3>
        {subtitle && <p className={styles.wizardSubtitle}>{subtitle}</p>}
      </div>
    </div>
    <div className={styles.wizardFooterLink}>
      <span>{linkText}</span>
      <ArrowRight size={16} />
    </div>
  </div>
)

// ── Deterministic cover colors per template ───────────────────────────────────
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
  Research: '🔍',
  Recruiter: '🤝',
  Partnerships: '🤝',
  'Investor Relations': '📊',
}

const BADGE_STYLE: Record<string, string> = {
  Popular: styles.badgePopular,
  New:     styles.badgeNew,
  Hot:     styles.badgeHot,
}

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
  templateId, gradient, activeIdx, onSlideClick,
}: {
  templateId: string
  gradient: string
  activeIdx: number
  onSlideClick: (idx: number) => void
}) {
  const content = MOCK_TEMPLATE_CONTENTS[templateId]
  if (!content) return null

  return (
    <div className={styles.miniSlideStrip}>
      {content.slides.map((slide, i) => {
        const firstLine = getSlideHeadline(slide)
        return (
          <div
            key={slide.id}
            className={`${styles.miniSlide} ${i === activeIdx ? styles.miniSlideActive : ''}`}
            style={{ background: gradient }}
            onClick={() => onSlideClick(i)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSlideClick(i)}
            aria-label={`Preview slide ${i + 1}: ${slide.title}`}
          >
            <div className={styles.miniSlideNum}>{i + 1}</div>
            {firstLine && <div className={styles.miniSlideText}>{firstLine}</div>}
          </div>
        )
      })}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard({
  onOpenPresentationModal,
}: {
  onOpenPresentationModal?: (tab?: string, templateId?: string) => void
}) {
  const { user } = useAuth()
  const userName = user?.email?.split('@')[0] || 'Guest'

  const [activeCategory, setActiveCategory] = React.useState('All')
  const [search, setSearch]                 = React.useState('')
  const [previewId, setPreviewId]           = React.useState<string | null>(null)
  const [activeSlideIdx, setActiveSlideIdx] = React.useState(0)

  React.useEffect(() => { setActiveSlideIdx(0) }, [previewId])

  const { templates: myTemplates, deleteTemplate, openInEditor } = useUserTemplates()
  const { templates: ptTemplates } = useTemplateStore()

  const wizards = [
    { title: 'Quick Presentation', subtitle: 'Add AI avatar or voice to your slides',       linkText: 'Make slides interactive',     icon: <Video       size={20} color="#fff" />, colorClass: 'cardBlue',   tab: 'quick'   },
    { title: 'Video Presentation', subtitle: 'Dub your video in any languages with AI',     linkText: 'Add voice, avatar or subtitles', icon: <Play      size={20} color="#fff" />, colorClass: 'cardPurple', tab: 'video'   },
    { title: 'AI Chat Avatar',     subtitle: 'Set up conversational multilingual AI assistant', linkText: 'Generate Chat-avatar',     icon: <MessageSquare size={20} color="#fff" />, colorClass: 'cardIndigo', tab: 'chat'  },
    { title: 'Create from scratch',subtitle: 'Add AI avatars, texts or images',             linkText: 'Start with blank slide',      icon: <Plus        size={20} color="#000" />, colorClass: 'cardPeach',  tab: 'scratch' },
  ]

  // Combined search + category filter
  const filteredTemplates = ptTemplates
    .filter(t => t.isOnHomepage !== false && t.accessType !== 'inactive') // Only show active homepage templates here
    .filter(t => {
      const matchCat  = activeCategory === 'All' || t.productTypes.includes(activeCategory)
      const q         = search.toLowerCase().trim()
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
      return matchCat && matchSearch
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const previewTpl = previewId ? ptTemplates.find(t => t.id === previewId) ?? null : null
  const previewContent = previewId ? MOCK_TEMPLATE_CONTENTS[previewId] ?? null : null
  const activeSlide = previewContent?.slides[activeSlideIdx] ?? null

  const handleUse = (id: string) => onOpenPresentationModal?.('template', id)

  return (
    <div className={styles.container}>

      {/* ── Preview modal ── */}
      {previewTpl && (
        <div className={styles.previewModalOverlay} onClick={() => setPreviewId(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setPreviewId(null)}>✕</button>

            {/* Gradient hero — matching TemplatesTable */}
            <div
              className={styles.modalHero}
              style={{ background: COVER_GRADIENTS[Number(previewTpl.id) - 1] ?? COVER_GRADIENTS[0] }}
            >
              <div className={styles.modalHeroEmoji}>
                {CATEGORY_EMOJI[previewTpl.productTypes[0]] ?? '📋'}
              </div>
              <div className={styles.modalBadge}>{previewTpl.productTypes[0]}</div>
              <div className={styles.modalSlides}>
                <Layers size={13} /> Slide {activeSlideIdx + 1} / {previewTpl.slideCount}
              </div>
              {activeSlide && (
                <SlideHeroMock
                  slide={activeSlide}
                  slideNum={activeSlideIdx + 1}
                  total={previewTpl.slideCount}
                />
              )}
            </div>

            {/* Interactive slide strip */}
            <MiniSlideStrip
              templateId={previewTpl.id}
              gradient={COVER_GRADIENTS[Number(previewTpl.id) - 1] ?? COVER_GRADIENTS[0]}
              activeIdx={activeSlideIdx}
              onSlideClick={setActiveSlideIdx}
            />

            <div className={styles.modalBody}>
              <div className={styles.modalTags}>
                {previewTpl.tags.map(tag => (
                  <span key={tag} className={styles.modalTag}>{tag}</span>
                ))}
                {previewTpl.badge && (
                  <span className={`${styles.modalTag} ${BADGE_STYLE[previewTpl.badge] ?? ''}`}>
                    {previewTpl.badge}
                  </span>
                )}
              </div>
              <h2>{previewTpl.name}</h2>
              <p>{previewTpl.description}</p>
              <div className={styles.modalActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => { setPreviewId(null); handleUse(previewTpl.id) }}
                >
                  Use this template →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Greeting ── */}
      <div className={styles.greetingHeader}>
        <h1 className={styles.greetingTitle}>Dear {userName}, we missed you!</h1>
        <p className={styles.greetingSubtitle}>Ready to reach your goals today?</p>
      </div>

      {/* ── Project Wizards ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Project Wizards</h2>
        <div className={styles.wizardsScroll}>
          {wizards.map((w, idx) => (
            <WizardCard key={`wizard-${idx}`} {...w} onClick={() => onOpenPresentationModal?.(w.tab)} />
          ))}
        </div>
      </section>

      {/* ── System Templates ── */}
      <section className={styles.section}>
        <div className={styles.templatesSectionHeader}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Templates</h2>
          <span className={styles.templatesCount}>
            {ptTemplates.filter(t => t.isOnHomepage).length} recommended
          </span>
          <Link href="/presentation-templates" style={{ marginLeft: 'auto', color: '#0076ff', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            View all templates →
          </Link>
        </div>

        {/* Search + category filters */}
        <div className={styles.templateControls}>
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
              <button className={styles.searchClear} onClick={() => setSearch('')}><X size={13} /></button>
            )}
          </div>
          <div className={styles.categoryPills}>
            {PRODUCT_TYPES.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryPill} ${activeCategory === cat ? styles.categoryPillActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat !== 'All' && <span>{CATEGORY_EMOJI[cat] ?? '📋'}</span>}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className={styles.noResults}>No templates match your search.</div>
        ) : (
          <div className={styles.templatesGrid}>
            {filteredTemplates.map((tpl, idx) => {
              const gradient = COVER_GRADIENTS[Number(tpl.id) - 1] ?? COVER_GRADIENTS[idx % COVER_GRADIENTS.length]
              const emoji    = CATEGORY_EMOJI[tpl.productTypes[0]] ?? '📋'
              return (
                <div key={tpl.id} className={styles.templateCard}>
                  {/* Cover */}
                  <div className={styles.templateImage} style={{ background: gradient }}>
                    <div className={styles.templateEmojiCover}>{emoji}</div>
                    {/* Popular / New / Hot badge */}
                    {tpl.badge && (
                      <div className={`${styles.cardBadge} ${BADGE_STYLE[tpl.badge] ?? ''}`}>
                        {tpl.badge === 'Hot' ? '🔥' : tpl.badge === 'New' ? '✨' : '⭐'} {tpl.badge}
                      </div>
                    )}
                    <div className={styles.templateOverlay}>
                      <div className={styles.overlayBtns}>
                        <button className={styles.templateBtn} onClick={() => handleUse(tpl.id)}>
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
                        <Layers size={11} /> {tpl.slideCount} slides
                      </span>
                    </div>
                    <h4 className={styles.templateTplTitle}>{tpl.name}</h4>
                    <p className={styles.templateDesc}>{tpl.description}</p>
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
      </section>

      {/* ── My Templates ── */}
      {myTemplates.length > 0 && (
        <section className={styles.section}>
          <div className={styles.templatesSectionHeader}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              <Bookmark size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              My Templates
            </h2>
            <span className={styles.templatesCount}>{myTemplates.length} saved</span>
          </div>
          <div className={styles.templatesGrid}>
            {myTemplates.map(tpl => (
              <div key={tpl.id} className={`${styles.templateCard} ${styles.myTemplateCard}`}>
                <div className={styles.templateImage} style={{ background: tpl.gradient }}>
                  <div className={styles.templateEmojiCover}>📁</div>
                  <div className={styles.templateOverlay}>
                    <div className={styles.overlayBtns}>
                      <button className={styles.templateBtn} onClick={() => openInEditor(tpl)}>
                        <ExternalLink size={14} /> Open Editor
                      </button>
                      <button
                        className={styles.previewBtn}
                        style={{ color: '#fca5a5', borderColor: 'rgba(252,165,165,0.4)' }}
                        onClick={() => deleteTemplate(tpl.id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.templateInfo}>
                  <div className={styles.templateMetaRow}>
                    <span className={styles.templateCategory} style={{ background: '#f0fdf4', color: '#16a34a' }}>My Template</span>
                    <span className={styles.templateSlideCount}>
                      <Layers size={11} /> {tpl.slides.length} slides
                    </span>
                  </div>
                  <h4 className={styles.templateTplTitle}>{tpl.name}</h4>
                  <p className={styles.templateDesc}>
                    Based on {tpl.sourceName} · Edited {timeAgo(tpl.savedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}



      {/* ── Interactive demo ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>See it in action</h2>
        <div className={styles.demoCard}>
          <div className={styles.demoHeader}>
            <div className={styles.demoBadge}><Play size={12} /><span>Interactive Demo</span></div>
            <p className={styles.demoDesc}>
              Walk through Pitch Avatar step by step — no sign-up needed. 50 interactive steps showing the full workflow.
            </p>
          </div>
          <div className={styles.demoIframeWrapper}>
            <iframe
              id="mk6l48qt6k"
              src="https://app.guideflow.com/embed/mk6l48qt6k"
              className={styles.demoIframe}
              style={{ overflow: 'hidden', border: 'none' }}
              scrolling="no"
              allow="clipboard-read; clipboard-write"
              allowFullScreen
              allowTransparency
              title="Pitch Avatar Product Demo"
            />
            <Script src="https://app.guideflow.com/assets/opt.js" data-iframe-id="mk6l48qt6k" strategy="afterInteractive" />
          </div>
        </div>
      </section>

      {/* ── Overview ── */}
      <section className={styles.section}>
        <div className={styles.overviewHeader}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <span className={styles.overviewDate}>Last 7 days</span>
        </div>
        <div className={styles.statsGrid}>
          {['Created presentations', 'Generated links', 'Number of sessions', 'Session duration', 'Goals achieved'].map((label, i) => (
            <div key={`stat-${i}`} className={styles.statCard}>
              <div className={styles.statValue}>0</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Projects ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Projects</h2>
        <div className={styles.tableContainer}>
          <table className={styles.projectsTable}>
            <thead>
              <tr>
                <th>PREVIEW</th><th>PROJECT NAME</th><th>TYPE</th>
                <th>AI AVATAR</th><th>AUTHOR</th><th>CREATED DATE</th><th>LANGUAGE</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  <div className={styles.emptyContent} data-tour="share-link">
                    <div className={styles.emptyIcon}><Target size={40} /></div>
                    <h3>Start your first AI project</h3>
                    <p>It takes less than 2 minutes to create an interactive presentation.</p>
                    <button className={styles.primaryBtn} onClick={() => onOpenPresentationModal?.('quick')}>
                      <Plus size={18} /> Create Project
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
