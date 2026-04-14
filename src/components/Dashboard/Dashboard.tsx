import React from 'react'
import styles from './Dashboard.module.css'
import { Plus, Play, Video, GraduationCap, MessageSquare, Target, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface WizardCardProps {
  title: string
  subtitle: string
  buttonText?: string
  icon: React.ReactNode
  onClick?: () => void
  colorClass: string
}

const WizardCard = ({ title, subtitle, buttonText, icon, onClick, colorClass }: WizardCardProps) => (
  <div className={`${styles.wizardCard} ${styles[colorClass]}`} onClick={onClick}>
    <div className={styles.wizardIcon}>{icon}</div>
    <div className={styles.wizardContent}>
      <h3 className={styles.wizardTitle}>{title}</h3>
      <p className={styles.wizardSubtitle}>{subtitle}</p>
      {buttonText && <div className={styles.wizardBtn}>{buttonText}</div>}
    </div>
  </div>
)

export default function Dashboard({ onOpenPresentationModal }: { onOpenPresentationModal?: (tab?: string) => void }) {
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'Guest';

  const wizards = [
    {
      title: 'Quick Presentation',
      subtitle: 'Create a presentation quickly with AI',
      buttonText: 'Create presentation',
      icon: <Play size={22} />,
      colorClass: 'cardBlue',
      tab: 'quick'
    },

    {
      title: 'Video Presentation',
      subtitle: 'Create a video presentation',
      buttonText: 'Create video',
      icon: <Video size={22} />,
      colorClass: 'cardPurple',
      tab: 'video'
    },
    {
      title: 'Training Course',
      subtitle: 'Build an interactive training course',
      buttonText: 'Create presentation',
      icon: <GraduationCap size={22} />,
      colorClass: 'cardOrange',
      tab: 'course'
    },
    {
      title: 'AI Chat Avatar',
      subtitle: 'Create an AI-powered chat avatar',
      buttonText: 'Create ai-chat',
      icon: <MessageSquare size={22} />,
      colorClass: 'cardGreen',
      tab: 'chat'
    },
    {
      title: 'Create from scratch',
      subtitle: 'Start with blank slide',
      buttonText: 'Start with blank slide',
      icon: <Plus size={22} />,
      colorClass: 'cardGray',
      tab: 'scratch'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.greetingHeader}>
        <h1 className={styles.greetingTitle}>
          Dear {userName}, we missed you!
        </h1>
        <p className={styles.greetingSubtitle}>
          Ready to reach your goals today?
        </p>
      </div>

      <section className={styles.conversionSection}>
        <div className={styles.conversionCard}>
          <div className={styles.conversionText}>
            <div className={styles.conversionBadge}>
              <Sparkles size={14} />
              Recommended for you
            </div>
            <h2>Create your first AI Presentation</h2>
            <p>Don&apos;t let your slides stay static. In 2 minutes, we&apos;ll turn them into a living video with an AI avatar.</p>
            <button 
              className={styles.primaryBtn}
              onClick={() => onOpenPresentationModal?.('magic')}
            >
              Start Magic Import <ArrowRight size={18} />
            </button>
          </div>
          <div className={styles.conversionStat}>
            <div className={styles.statCircle}>
              <span className={styles.statNum}>2</span>
              <span className={styles.statUnit}>min</span>
            </div>
            <p>Average setup time</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Project Wizards
        </h2>
        <div className={styles.wizardsScroll}>
          {wizards.map((w) => (
            <WizardCard 
              key={w.title} 
              {...w} 
              onClick={() => onOpenPresentationModal?.(w.tab)} 
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Templates
        </h2>
        <div className={styles.templatesGrid}>
          {[
            { id: 1, title: 'B2B Sales Pitch', category: 'Sales', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80' },
            { id: 2, title: 'Company Onboarding', category: 'HR', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80' },
            { id: 3, title: 'Product Demo', category: 'Marketing', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80' },
            { id: 4, title: 'Investor Update', category: 'Finances', image: 'https://images.unsplash.com/photo-1553484771-047a44eee27b?auto=format&fit=crop&w=400&q=80' },
          ].map(tpl => (
            <div key={tpl.id} className={styles.templateCard}>
              <div className={styles.templateImage} style={{ backgroundImage: `url(${tpl.image})` }}>
                <div className={styles.templateOverlay}>
                  <button className={styles.templateBtn}>Use Template</button>
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
          <h2 className={styles.sectionTitle}>
            Overview
          </h2>
          <span className={styles.overviewDate}>Last 7 days</span>
        </div>
        <div className={styles.statsGrid}>
          {[
            { value: 0, label: 'Created presentations' },
            { value: 0, label: 'Generated links' },
            { value: 0, label: 'Number of sessions' },
            { value: '0m', label: 'Session duration' },
            { value: 0, label: 'Goals achieved' },
          ].map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Recent Projects
        </h2>
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
                  <div className={styles.emptyContent}>
                    <div className={styles.emptyIcon}>
                      <Target size={40} />
                    </div>
                    <h3>Start your first AI project</h3>
                    <p>It takes less than 2 minutes to create an interactive presentation with an AI avatar.</p>
                    <button 
                      className={styles.primaryBtn}
                      onClick={() => onOpenPresentationModal?.('quick')}
                    >
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


