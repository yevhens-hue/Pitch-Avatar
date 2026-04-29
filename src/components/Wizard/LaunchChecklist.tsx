'use client'

import React, { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Settings2 } from 'lucide-react'
import styles from './LaunchChecklist.module.css'

interface LaunchChecklistProps {
  /** Ordered checklist items */
  items: string[]
  /** Number of items that are fully completed (0-based count) */
  doneCount: number
  /** Reward label shown in the header */
  rewardLabel?: string
}

export default function LaunchChecklist({
  items,
  doneCount,
  rewardLabel = '+5 AI min reward',
}: LaunchChecklistProps) {
  const [isOpen, setIsOpen] = useState(true)

  const total = items.length
  const progress = Math.min(doneCount, total)
  // The "current" item is the first undone item
  const currentIndex = progress < total ? progress : total - 1

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <button
        className={styles.header}
        onClick={() => setIsOpen(v => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse checklist' : 'Expand checklist'}
      >
        {/* Progress badge */}
        <div className={styles.progressBadge} aria-label={`${progress} of ${total} steps done`}>
          <svg viewBox="0 0 36 36" className={styles.progressRing} aria-hidden="true">
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke="#6366f1"
              strokeWidth="3"
              strokeDasharray={`${(progress / total) * 94.25} 94.25`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className={styles.progressText}>{progress}/{total}</span>
        </div>

        <div className={styles.titleGroup}>
          <span className={styles.title}>Launch Checklist</span>
          <span className={styles.reward}>🎁 {rewardLabel}</span>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.headerIcon} aria-hidden="true">
            <Settings2 size={14} />
          </span>
          <span className={styles.headerIcon} aria-hidden="true">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </button>

      {/* ── Items ── */}
      {isOpen && (
        <ul className={styles.list} role="list">
          {items.map((item, idx) => {
            const isDone = idx < progress
            const isCurrent = idx === currentIndex && !isDone
            return (
              <li
                key={item}
                className={`${styles.item} ${isDone ? styles.itemDone : ''} ${isCurrent ? styles.itemCurrent : ''}`}
              >
                <div className={`${styles.bullet} ${isDone ? styles.bulletDone : ''} ${isCurrent ? styles.bulletCurrent : ''}`} aria-hidden="true">
                  {isDone ? <Check size={11} /> : <span>{idx + 1}</span>}
                </div>
                <span className={styles.itemLabel}>{item}</span>
                {isCurrent && <span className={styles.currentArrow} aria-hidden="true">›</span>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
