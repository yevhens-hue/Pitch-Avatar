'use client'

import React from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import styles from './WizardLayout.module.css'

interface WizardLayoutProps {
  title: string
  steps: string[]
  activeStep: number
  onStepClick?: (step: number) => void
  onNext: () => void
  onExit: () => void
  nextLabel?: string
  isNextDisabled?: boolean
  children: React.ReactNode
}

export default function WizardLayout({
  title,
  steps,
  activeStep,
  onStepClick,
  onNext,
  onExit,
  nextLabel,
  isNextDisabled,
  children,
}: WizardLayoutProps) {
  const isLast = activeStep === steps.length

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button className={styles.back} onClick={onExit}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className={styles.title}>{title}</h2>
        <nav className={styles.steps}>
          {steps.map((label, idx) => {
            const num = idx + 1
            const isActive = num === activeStep
            const isDone = num < activeStep
            return (
              <div
                key={num}
                className={`${styles.step} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}
                onClick={() => isDone && onStepClick?.(num)}
              >
                <div className={styles.stepNum}>
                  {isDone ? <Check size={12} /> : num}
                </div>
                <span className={styles.stepLabel}>{label}</span>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <button className={styles.exitBtn} onClick={onExit}>
            Exit
          </button>
          <button
            className={styles.nextBtn}
            onClick={onNext}
            disabled={!!isNextDisabled}
          >
            {isLast ? (nextLabel || 'Finish') : 'Next →'}
          </button>
        </div>
      </main>
    </div>
  )
}
