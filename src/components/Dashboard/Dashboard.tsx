import React, { useMemo } from 'react'
import Link from 'next/link'
import styles from './Dashboard.module.css'

interface ActionCardProps {
  title: string
  subtitle: string
  linkText: string
  bgColor: string
  href?: string
  onClick?: () => void
}

const ActionCard = ({ title, subtitle, linkText, bgColor, href, onClick, icon }: ActionCardProps & { icon?: string }) => {
  const content = (
    <div className={styles.card} style={{ backgroundColor: bgColor }} onClick={onClick}>
      <div className={styles.cardIcon}>{icon || '📄'}</div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardSubtitle}>{subtitle}</p>
        <span className={styles.cardLink}>{linkText} →</span>
      </div>
    </div>
  )

  if (onClick) return <div className={styles.clickable}>{content}</div>
  return <Link href={href || '#'}>{content}</Link>
}

interface DashboardAction {
  title: string
  subtitle: string
  linkText: string
  bgColor: string
  href?: string
  modalTab?: string
  icon: string
}

const DASHBOARD_ACTIONS: DashboardAction[] = [
  {
    title: 'AI-ассистент',
    subtitle: 'Настроить многоязычного AI-ассистента',
    linkText: 'Сгенерируйте Чат-аватара',
    bgColor: '#f0f7ff',
    href: '/chat-avatar/create',
    icon: '🤖',
  },
  {
    title: 'Слайды',
    subtitle: 'Добавить лицо и голос слайдам',
    linkText: 'Сделайте слайды интерактивными',
    bgColor: '#f2faff',
    modalTab: 'file',
    icon: '📄',
  },
  {
    title: 'Видео',
    subtitle: 'Переведите и озвучьте своё видео',
    linkText: 'Загрузите ваше видео',
    bgColor: '#f0fff4',
    modalTab: 'video',
    icon: '🎬',
  },
  {
    title: 'С нуля',
    subtitle: 'Создать с нуля',
    linkText: 'Начните с чистого слайда',
    bgColor: '#fffaf0',
    modalTab: 'scratch',
    icon: '➕',
  },
]

export default function Dashboard({ onOpenPresentationModal }: { onOpenPresentationModal?: (tab?: string) => void }) {
  const actions = useMemo(
    () =>
      DASHBOARD_ACTIONS.map((a) => ({
        ...a,
        onClick: a.modalTab ? () => onOpenPresentationModal?.(a.modalTab) : undefined,
      })),
    [onOpenPresentationModal],
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.topAlert}>
          У Вас <span className={styles.days}>7</span> оставшихся пробных дней.
          <a href="#">Выберите тарифный план</a> или <a href="#">Запишитесь на демо</a> и мы поможем Вам с выбором
        </div>
        <h1 className={styles.welcome}>Добро пожаловать в Pitch Avatar</h1>
        <p className={styles.description}>Выберите, что вам нужно</p>
      </header>

      <div className={styles.grid}>
        {actions.map((action) => (
          <ActionCard key={action.title} {...action} />
        ))}
      </div>

      <div className={styles.videoSection}>
        <h2 className={styles.videoTitle}>Как это работает?</h2>
        <p className={styles.videoSubtitle}>Посмотрите это короткое руководство перед началом первой презентации</p>
        <div className={styles.videoPlaceholder}>
           <div className={styles.playButton}>▶</div>
        </div>
      </div>
    </div>
  )
}
