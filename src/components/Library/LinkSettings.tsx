'use client'

import React, { useState } from 'react'
import styles from './LinkSettings.module.css'

interface LinkSettingsProps {
  isOpen: boolean
  onClose: () => void
  presentationName: string
}

const TABS = [
  { id: 'basic', label: 'Basic' },
  { id: 'personalization', label: 'Personalization' },
  { id: 'lead form', label: 'Lead Form' },
  { id: 'advanced', label: 'Advanced' },
]

const LEAD_FIELDS = ['First Name', 'Last Name', 'Email', 'Company', 'Country']

export default function LinkSettings({ isOpen, onClose, presentationName }: LinkSettingsProps) {
  const [activeSegment, setActiveSegment] = useState('basic')

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
          <h2 className={styles.title}>Link Settings</h2>
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
                <label>Link Name</label>
                <input type="text" placeholder="Enter link name" />
              </div>
              <div className={styles.formField}>
                <label>Host Email</label>
                <input type="email" placeholder="example@email.com" />
              </div>
              <div className={styles.formField}>
                <label>Calendar Link</label>
                <input type="text" placeholder="https://calendly.com/..." />
              </div>
              <div className={styles.toggleRow}>
                <span>Receive notifications when link is opened</span>
                <button className={styles.toggleOn} aria-label="Enable notifications when link is opened" aria-pressed="true"></button>
              </div>
            </div>
          )}

          {activeSegment === 'lead form' && (
            <div className={styles.settingsGroup}>
              <div className={styles.leadHeader}>
                <h4 className={styles.sectionHeader}>On-demand Lead Form</h4>
                <button className={styles.toggleOn} aria-label="Enable lead form" aria-pressed="true"></button>
              </div>
              <p className={styles.description}>
                Enable toggles to collect listener data.
              </p>
              <div className={styles.leadFields}>
                {LEAD_FIELDS.map((f) => (
                  <div key={f} className={styles.leadItem}>
                    <span>{f}</span>
                    <button className={styles.toggleOff} aria-label={`Enable field ${f}`} aria-pressed="false"></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.linkShare}>
            <input type="text" readOnly value="https://pitch-avatar.com/v/abcd123" />
            <button className={styles.copyBtn}>Copy</button>
          </div>
          <div className={styles.socialButtons}>
            <span>Share: Facebook | LinkedIn | Gmail</span>
          </div>
        </div>
      </div>
    </div>
  )
}
