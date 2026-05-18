import React from 'react'
import styles from './Dashboard.module.css'
import { Plus, Play, Video, MessageSquare, Target, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import InteractiveDemo from './InteractiveDemo'
import { useRouter } from 'next/navigation'
import { MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates'


interface WizardCardProps {
  title: string
  subtitle?: string
  icon: React.ReactNode
  onClick?: () => void
  colorClass: string
  linkText: string
  tab?: string
}

const WizardCard = ({ title, subtitle, icon, onClick, colorClass, tab, linkText }: WizardCardProps) => {
  return (
    <div 
      className={`${styles.wizardCard} ${styles[colorClass] || ''}`} 
      onClick={onClick}
      data-tour={tab === 'quick' ? 'creation-method' : undefined}
    >
      <div className={styles.wizardTop}>
        <div className={styles.wizardIconWrapper}>
          {icon}
        </div>
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
  );
};

interface Template {
  id: string;
  title: string;
  category: string;
  image: string;
}

export default function Dashboard({ onOpenPresentationModal }: { onOpenPresentationModal?: (tab?: string, templateId?: string) => void }) {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'Guest';
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null);

  const router = useRouter();

  const templateImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=80'
  ];

  const templates: Template[] = MOCK_PRESENTATION_TEMPLATES.slice(0, 7).map((t, i) => ({
    id: t.id,
    title: t.name,
    category: t.productTypes[0] || 'Template',
    image: templateImages[i % templateImages.length]
  }));

  const wizards = [
    {
      title: 'Quick Presentation',
      subtitle: 'Add AI avatar or voice to your slides',
      linkText: 'Make slides interactive',
      icon: <Video size={20} color="#fff" />,
      colorClass: 'cardBlue',
      tab: 'quick'
    },
    {
      title: 'Video Presentation',
      subtitle: 'Dub your video in any languages with AI',
      linkText: 'Add voice, avatar or subtitles',
      icon: <Play size={20} color="#fff" />,
      colorClass: 'cardPurple',
      tab: 'video'
    },
    {
      title: 'AI Chat Avatar',
      subtitle: 'Set up conversational multilingual AI assistant',
      linkText: 'Generate Chat-avatar',
      icon: <MessageSquare size={20} color="#fff" />,
      colorClass: 'cardIndigo',
      tab: 'chat'
    },
    {
      title: 'Create from scratch',
      subtitle: 'Add AI avatars, texts or images',
      linkText: 'Start with blank slide',
      icon: <Plus size={20} color="#000" />,
      colorClass: 'cardPeach',
      tab: 'scratch'
    }
  ];

  return (
    <div className={styles.container}>
      {previewTemplate && (
        <div className={styles.previewModalOverlay} onClick={() => setPreviewTemplate(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setPreviewTemplate(null)}>✕</button>
            <div className={styles.modalHero} style={{ backgroundImage: `url(${previewTemplate.image})` }}>
              <div className={styles.modalBadge}>{previewTemplate.category}</div>
            </div>
            <div className={styles.modalBody}>
              <h2>{previewTemplate.title}</h2>
              <p>This premium template includes pre-configured AI avatar positions, professional transitions, and an optimized script structure.</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.primaryBtn}
                  onClick={() => {
                    const id = previewTemplate.id;
                    setPreviewTemplate(null);
                    router.push(`/presentation-templates/${id}`);
                  }}
                >
                  Apply Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.greetingHeader}>
        <h1 className={styles.greetingTitle}>Dear {userName}, we missed you!</h1>
        <p className={styles.greetingSubtitle}>Ready to reach your goals today?</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Project Wizards</h2>
        <div className={styles.wizardsScroll}>
          {wizards.map((w, idx) => (
            <WizardCard 
              key={`wizard-${idx}`} 
              {...w} 
              onClick={() => onOpenPresentationModal?.(w.tab)} 
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>See it in action</h2>
        <InteractiveDemo />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Templates</h2>
        <div className={styles.templatesGrid}>
          {templates.map((tpl, idx) => (
            <div key={`tpl-${idx}`} className={styles.templateCard}>
              <div className={styles.templateImage} style={{ backgroundImage: `url(${tpl.image})` }}>
                <div className={styles.templateOverlay}>
                  <div className={styles.overlayBtns}>
                    <button className={styles.templateBtn} onClick={() => onOpenPresentationModal?.('template', tpl.id)}>Use</button>
                    <button className={styles.previewBtn} onClick={() => setPreviewTemplate(tpl)}>Preview</button>
                  </div>
                </div>
              </div>
              <div className={styles.templateInfo}>
                <span className={styles.templateCategory}>{tpl.category}</span>
                <h4 className={styles.templateTplTitle}>{tpl.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

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
