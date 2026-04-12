import React from 'react'
import styles from './PagePlaceholder.module.css'

interface PagePlaceholderProps {
  title: string
  description?: string
}

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.badge}>Скоро</div>
    </div>
  )
}
