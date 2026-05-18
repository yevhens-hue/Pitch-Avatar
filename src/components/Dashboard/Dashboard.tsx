import React from 'react'
import styles from './Dashboard.module.css'
import { Plus, Play, Video, MessageSquare, Target, ArrowRight, Layers } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import InteractiveDemo from './InteractiveDemo'
import { MOCK_PRESENTATION_TEMPLATES, PRODUCT_TYPES } from '@/data/presentation-templates'

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

// ── Deterministic cover colors per template (no external images needed) ────────
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

// ── Emoji icon per category ───────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<string, string> = {
  HR: '👥',
  'Internal Communications': '📣',
  Marketing: '🚀',
  Sales: '💼',
  Support: '🎧',
  Compliance: '⚖️',
  'IT Security': '🔐',
}

export default function Dashboard({
  onOpenPresentationModal,
}: {
  onOpenPresentationModal?: (tab?: string, templateId?: string) => void
}) {
  const { user } = useAuth()
  const userName = user?.email?.split('@')[0] || 'Guest'
  const [activeCategory, setActiveCategory] = React.useState('All')
  const [previewId, setPreviewId] = React.useState<string | null>(null)

  const wizards = [
    { title: 'Quick Presentation', subtitle: 'Add AI avatar or voice to your slides', linkText: 'Make slides interactive', icon: <Video size={20} color="#fff" />, colorClass: 'cardBlue', tab: 'quick' },
    { title: 'Video Presentation', subtitle: 'Dub your video in any languages with AI', linkText: 'Add voice, avatar or subtitles', icon: <Play size={20} color="#fff" />, colorClass: 'cardPurple', tab: 'video' },
    { title: 'AI Chat Avatar', subtitle: 'Set up conversational multilingual AI assistant', linkText: 'Generate Chat-avatar', icon: <MessageSquare size={20} color="#fff" />, colorClass: 'cardIndigo', tab: 'chat' },
    { title: 'Create from scratch', subtitle: 'Add AI avatars, texts or images', linkText: 'Start with blank slide', icon: <Plus size={20} color="#000" />, colorClass: 'cardPeach', tab: 'scratch' },
  ]

  const filteredTemplates = activeCategory === 'All'
    ? MOCK_PRESENTATION_TEMPLATES
    : MOCK_PRESENTATION_TEMPLATES.filter(t => t.productTypes.includes(activeCategory))

  const previewTpl = previewId ? MOCK_PRESENTATION_TEMPLATES.find(t => t.id === previewId) : null

  const handleUse = (id: string) => onOpenPresentationModal?.('template', id)

  return (
    <div className={styles.container}>

      {/* ── Preview modal ── */}
      {previewTpl && (
        <div className={styles.previewModalOverlay} onClick={() => setPreviewId(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setPreviewId(null)}>✕</button>
            <div
              className={styles.modalHero}
              style={{ background: COVER_GRADIENTS[Number(previewTpl.id) - 1] ?? COVER_GRADIENTS[0] }}
            >
              <div className={styles.modalHeroEmoji}>
                {CATEGORY_EMOJI[previewTpl.productTypes[0]] ?? '📋'}
              </div>
              <div className={styles.modalBadge}>{previewTpl.productTypes[0]}</div>
              <div className={styles.modalSlides}>
                <Layers size={13} /> {previewTpl.slideCount} slides
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalTags}>
                {previewTpl.tags.map(tag => (
                  <span key={tag} className={styles.modalTag}>{tag}</span>
                ))}
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

      {/* ── Interactive demo ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>See it in action</h2>
        <InteractiveDemo />
      </section>

      {/* ── Templates ── */}
      <section className={styles.section}>
        <div className={styles.templatesSectionHeader}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Templates</h2>
          <span className={styles.templatesCount}>{MOCK_PRESENTATION_TEMPLATES.length} ready-to-use</span>
        </div>

        {/* Category filter pills */}
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

        <div className={styles.templatesGrid}>
          {filteredTemplates.map((tpl, idx) => {
            const gradient = COVER_GRADIENTS[Number(tpl.id) - 1] ?? COVER_GRADIENTS[idx % COVER_GRADIENTS.length]
            const emoji = CATEGORY_EMOJI[tpl.productTypes[0]] ?? '📋'
            return (
              <div key={tpl.id} className={styles.templateCard}>
                {/* Cover */}
                <div className={styles.templateImage} style={{ background: gradient }}>
                  <div className={styles.templateEmojiCover}>{emoji}</div>
                  <div className={styles.templateOverlay}>
                    <div className={styles.overlayBtns}>
                      <button className={styles.templateBtn} onClick={() => handleUse(tpl.id)}>
                        Use template
                      </button>
                      <button className={styles.previewBtn} onClick={() => setPreviewId(tpl.id)}>
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className={styles.templateInfo}>
                  <div className={styles.templateMetaRow}>
                    <span className={styles.templateCategory}>{tpl.productTypes[0]}</span>
                    <span className={styles.templateSlideCount}>
                      <Layers size={11} /> {tpl.slideCount} slides
                    </span>
                  </div>
                  <h4 className={styles.templateTplTitle}>{tpl.name}</h4>
                  <p className={styles.templateDesc}>{tpl.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className={styles.noResults}>No templates in this category yet.</div>
        )}
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
                <th>PREVIEW</th>
                <th>PROJECT NAME</th>
                <th>TYPE</th>
                <th>AI AVATAR</th>
                <th>AUTHOR</th>
                <th>CREATED DATE</th>
                <th>LANGUAGE</th>
                <th></th>
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
