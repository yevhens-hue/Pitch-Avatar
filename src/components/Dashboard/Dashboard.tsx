import React from 'react'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import { Play, Video, GraduationCap, MessageSquare, Plus, Sparkles, ArrowRight, FlaskConical } from 'lucide-react'

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
  const wizards = [
    {
      title: 'AI Chat Avatar',
      subtitle: 'Setup a multilingual AI assistant',
      buttonText: 'Generate Chat-avatar',
      icon: <MessageSquare size={24} />,
      colorClass: 'cardBlue',
      tab: 'chat'
    },
    {
      title: 'Interactive Slides',
      subtitle: 'Add face and voice to your slides',
      buttonText: 'Make slides interactive',
      icon: <Play size={24} />,
      colorClass: 'cardAzure',
      tab: 'quick'
    },
    {
      title: 'Video Translation',
      subtitle: 'Translate or voiceover your video',
      buttonText: 'Upload & Translate',
      icon: <Video size={24} />,
      colorClass: 'cardGreen',
      tab: 'video'
    }
  ]

  return (
    <div className={styles.container}>
      {/* Real-site style Greeting */}
      <div className={styles.greetingHeader}>
        <h1 className={styles.greetingTitle}>Привет, Yevhen, мы соскучились по тебе.</h1>
        <p className={styles.greetingSubtitle}>Готовы достичь своих целей сегодня?</p>
      </div>

      {/* 1. Project Wizards Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Project Wizards</h2>
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

      {/* 2. Overview Section */}
      <section className={styles.section}>
        <div className={styles.overviewHeader}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <span className={styles.overviewDate}>Last 7 days</span>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Created presentations</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Generated links</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Number of sessions</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>0m</div>
            <div className={styles.statLabel}>Session duration</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Goals achieved</div>
          </div>
        </div>
      </section>

      {/* 3. Recent Projects Section */}
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
                  <div className={styles.emptyContent}>
                    <div className={styles.emptyIcon}>
                      <FlaskConical size={48} />
                    </div>
                    <h3>Start your first AI project</h3>
                    <p>It takes less than 2 minutes to create an interactive presentation with an AI avatar.</p>
                    <div className={styles.emptyActions}>
                      <button 
                        className={styles.primaryBtn}
                        onClick={() => onOpenPresentationModal?.('magic')}
                      >
                        <Plus size={18} /> Fast-track Import
                      </button>
                      <button 
                        className={styles.secondaryBtn}
                        onClick={() => onOpenPresentationModal?.('onboarding')}
                      >
                        Explore Onboarding Lab
                      </button>
                    </div>
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
