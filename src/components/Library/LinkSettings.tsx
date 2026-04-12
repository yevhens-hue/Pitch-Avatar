'use client'

import React, { useState } from 'react'
import styles from './LinkSettings.module.css'

interface LinkSettingsProps {
  isOpen: boolean
  onClose: () => void
  presentationName: string
}

const TABS = [
  { id: 'basic', label: 'Основные' },
  { id: 'personalization', label: 'Персонализация' },
  { id: 'lead form', label: 'Лид-форма' },
  { id: 'advanced', label: 'Расширенные' },
]

const LEAD_FIELDS = ['Имя', 'Фамилия', 'Email', 'Компания', 'Страна']

export default function LinkSettings({ isOpen, onClose, presentationName }: LinkSettingsProps) {
  const [activeSegment, setActiveSegment] = useState('basic')

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
          <h2 className={styles.title}>Настройки ссылки</h2>
          <p className={styles.subTitle}>{presentationName}</p>
        </div>

        <nav className={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeSegment === tab.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveSegment(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          {activeSegment === 'basic' && (
            <div className={styles.settingsGroup}>
              <div className={styles.formField}>
                <label>Название ссылки</label>
                <input type="text" placeholder="Введите название ссылки" />
              </div>
              <div className={styles.formField}>
                <label>Email ведущего</label>
                <input type="email" placeholder="example@email.com" />
              </div>
              <div className={styles.formField}>
                <label>Ссылка на календарь</label>
                <input type="text" placeholder="https://calendly.com/..." />
              </div>
              <div className={styles.toggleRow}>
                <span>Получать уведомления при открытии ссылки</span>
                <button className={styles.toggleOn} aria-label="Включить уведомления при открытии ссылки" aria-pressed="true"></button>
              </div>
            </div>
          )}

          {activeSegment === 'lead form' && (
            <div className={styles.settingsGroup}>
              <div className={styles.leadHeader}>
                <h4 className={styles.sectionHeader}>Лид-форма по запросу</h4>
                <button className={styles.toggleOn} aria-label="Включить лид-форму" aria-pressed="true"></button>
              </div>
              <p className={styles.description}>
                Включите переключатели для сбора данных слушателей.
              </p>
              <div className={styles.leadFields}>
                {LEAD_FIELDS.map((f) => (
                  <div key={f} className={styles.leadItem}>
                    <span>{f}</span>
                    <button className={styles.toggleOff} aria-label={`Включить поле ${f}`} aria-pressed="false"></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.linkShare}>
            <input type="text" readOnly value="https://pitch-avatar.com/v/abcd123" />
            <button className={styles.copyBtn}>Копировать</button>
          </div>
          <div className={styles.socialButtons}>
            <span>Поделиться: Facebook | LinkedIn | Gmail</span>
          </div>
        </div>
      </div>
    </div>
  )
}
