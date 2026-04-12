import React, { useMemo } from 'react'
import Link from 'next/link'
import styles from './Dashboard.module.css'
import { Play, Video, GraduationCap, MessageSquare, Plus, MoreHorizontal } from 'lucide-react'

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
      title: 'Quick Presentation',
      subtitle: 'Create a presentation quickly with AI',
      buttonText: 'Create presentation',
      icon: <Play size={24} />,
      colorClass: 'cardBlue',
      tab: 'quick'
    },
    {
      title: 'Video Presentation',
      subtitle: 'Create a video presentation',
      buttonText: 'Create video',
      icon: <Video size={24} />,
      colorClass: 'cardPurple',
      tab: 'video'
    },
    {
      title: 'Training Course',
      subtitle: 'Build an interactive training course',
      buttonText: 'Create presentation',
      icon: <GraduationCap size={24} />,
      colorClass: 'cardOrange',
      tab: 'course'
    },
    {
      title: 'AI Chat Avatar',
      subtitle: 'Create an AI-powered chat avatar',
      buttonText: 'Create ai-chat',
      icon: <MessageSquare size={24} />,
      colorClass: 'cardGreen',
      tab: 'chat'
    },
    {
      title: 'Create from scratch: add AI avatars, texts or images',
      subtitle: 'Start with blank slide',
      icon: <Plus size={24} />,
      colorClass: 'cardGray',
      tab: 'scratch'
    }
  ]

  return (
    <div className={styles.container}>
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
                  No projects yet. Click a Wizard above to create one!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
