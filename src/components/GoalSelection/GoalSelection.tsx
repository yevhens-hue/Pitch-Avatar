'use client'

import React, { useState } from 'react'
import styles from './GoalSelection.module.css'
import { GOALS } from '@/constants'

interface GoalSelectionProps {
  onNext: (selectedGoal: string | null) => void
}

export default function GoalSelection({ onNext }: GoalSelectionProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  return (
    <div className={styles.container}>
      <header className={styles.progressHeader}>
        <span className={styles.progressText}>3 / 3</span>
        <div className={styles.progressBars}>
          <div className={`${styles.progressBar} ${styles.progressFilled}`}></div>
          <div className={`${styles.progressBar} ${styles.progressFilled}`}></div>
          <div className={`${styles.progressBar} ${styles.progressActive}`}></div>
        </div>
      </header>

      <h1 className={styles.title}>What is the main goal you would like to achieve with Pitch Avatar?</h1>

      <div className={styles.grid}>
        {GOALS.map((goal) => (
          <div
            key={goal}
            className={`${styles.card} ${selectedGoal === goal ? styles.cardSelected : ''}`}
            onClick={() => setSelectedGoal(goal)}
          >
            {goal}
          </div>
        ))}
      </div>

      <button className={styles.nextButton} onClick={() => onNext(selectedGoal)}>
        Next
      </button>
    </div>
  )
}
