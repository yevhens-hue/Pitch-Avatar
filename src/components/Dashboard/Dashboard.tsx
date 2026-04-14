import React from 'react'
import styles from './Dashboard.module.css'
import { Plus, Play, Video, GraduationCap, MessageSquare, Target } from 'lucide-react'

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
          Dear Admin, we missed you! <br/>
          <span className={styles.ruText}>Уважаемый Admin, мы соскучились по вам.</span>
        </h1>
        <p className={styles.greetingSubtitle}>
          Ready to reach your goals today? <br/>
          <span className={styles.ruSubText}>Готовы достичь своих целей сегодня?</span>
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Project Wizards <span className={styles.ruSectionTitle}>/ Мастера проектов</span>
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
        <div className={styles.overviewHeader}>
          <h2 className={styles.sectionTitle}>
            Overview <span className={styles.ruSectionTitle}>/ Обзор</span>
          </h2>
          <span className={styles.overviewDate}>Last 7 days / за последние 7 дней</span>
        </div>
        <div className={styles.statsGrid}>
          {[
            { value: 0, label: ['Created presentations', 'Создано презентаций'] },
            { value: 0, label: ['Generated links', 'Создано ссылок'] },
            { value: 0, label: ['Number of sessions', 'Количество сессий'] },
            { value: '0m', label: ['Session duration', 'Продолжительность сессий'] },
            { value: 0, label: ['Goals achieved', 'Цели достигнуты'] },
          ].map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>
                {stat.label[0]} <br/>
                <span className={styles.ruLabelSmall}>{stat.label[1]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Recent Projects <span className={styles.ruSectionTitle}>/ Недавние проекты</span>
        </h2>
        <div className={styles.tableContainer}>
          <table className={styles.projectsTable}>
            <thead>
              <tr>
                <th>PREVIEW / ПРЕВЬЮ</th>
                <th>PROJECT NAME / НАЗВАНИЕ</th>
                <th>TYPE / ТИП</th>
                <th>AI AVATAR / AI АВАТАР</th>
                <th>AUTHOR / АВТОР</th>
                <th>CREATED DATE / ДАТА</th>
                <th>LANGUAGE / ЯЗЫК</th>
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

