'use client'

import React, { useState } from 'react'
import { ArrowLeft, Check, PlayCircle } from 'lucide-react'
import styles from './WizardLayout.module.css'
import TutorialVideo from './TutorialVideo'
import WizardChat from './WizardChat'

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
  /** One video URL per step (index = step - 1). If omitted, no tutorial button is shown. */
  stepVideos?: string[]
  /** Optional custom titles per step for the video card header */
  stepVideoTitles?: string[]
  /** Per-step proactive hint messages for the AI chat assistant (index = step - 1) */
  stepHints?: string[]
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
  stepVideos,
  stepVideoTitles,
  stepHints,
}: WizardLayoutProps) {
  const isLast = activeStep === steps.length
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)

  const currentVideoUrl = stepVideos?.[activeStep - 1]
  const currentStepName = steps[activeStep - 1] ?? ''
  const currentVideoTitle = stepVideoTitles?.[activeStep - 1] ?? `How to: ${currentStepName}`
  const stepLabel = `Step ${activeStep} of ${steps.length}`

  const hasTutorial = !!currentVideoUrl
  const currentHint = stepHints?.[activeStep - 1] ?? `You're on step ${activeStep}: ${currentStepName}. Let me know if you have any questions!`

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

        {/* Push tutorial button to bottom */}
        <div style={{ flex: 1 }} />

        {/* Watch Tutorial button */}
        {hasTutorial && (
          <div className={styles.tutorialSection}>
            <p className={styles.tutorialHint}>Need help with this step?</p>
            <button
              className={`${styles.tutorialBtn} ${isTutorialOpen ? styles.tutorialBtnActive : ''}`}
              onClick={() => setIsTutorialOpen(prev => !prev)}
              title={isTutorialOpen ? 'Close tutorial' : 'Watch a tutorial for this step'}
            >
              <PlayCircle size={16} />
              {isTutorialOpen ? 'Close Tutorial' : 'Watch Tutorial'}
            </button>
          </div>
        )}
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

      {/* Floating tutorial video */}
      {isTutorialOpen && currentVideoUrl && (
        <TutorialVideo
          videoUrl={currentVideoUrl}
          title={currentVideoTitle}
          stepLabel={stepLabel}
          onClose={() => setIsTutorialOpen(false)}
        />
      )}

      {/* AI Chat assistant */}
      <WizardChat
        stepName={currentStepName}
        stepNumber={activeStep}
        wizardTitle={title}
        hint={currentHint}
      />
    </div>
  )
}
