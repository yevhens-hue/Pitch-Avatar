'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, ChevronRight } from 'lucide-react'
import {
  getBranchByMainGoal,
  trackGuideEvent,
  WELCOME_BRANCHES,
  type Branch,
  type MainGoal,
} from '@/constants/welcomeBranches'
import { useUIStore } from '@/lib/store'
import styles from './WelcomeGuide.module.css'

const STORAGE_KEY = 'pa_welcome_guide_done'
const isDev = process.env.NODE_ENV === 'development'

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return match ? match[1] : null
}

interface WelcomeGuideProps {
  /** main_goal from the user's registration data. null → fallback branch. */
  mainGoal?: MainGoal | string | null
}

export default function WelcomeGuide({ mainGoal }: WelcomeGuideProps) {
  const router = useRouter()
  const { openGuide } = useUIStore()

  const [mounted, setMounted] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [phase, setPhase] = useState<'welcome' | 'steps'>('welcome')
  const [currentStep, setCurrentStep] = useState(0)
  const [branch, setBranch] = useState<Branch>(() => getBranchByMainGoal(mainGoal))
  // Dev-only: simulate different main_goal values
  const [devGoal, setDevGoal] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(STORAGE_KEY)
      if (done === 'true') setIsDone(true)
    }
  }, [])

  const dismiss = useCallback((openChecklist = false) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setIsDone(true)
    if (openChecklist) openGuide()
  }, [openGuide])

  if (!mounted || isDone) return null

  /* ── Phase: Welcome ── */
  const handleLetGo = () => {
    const resolvedGoal = devGoal || mainGoal || null
    const resolvedBranch = getBranchByMainGoal(resolvedGoal)
    setBranch(resolvedBranch)
    setCurrentStep(0)
    setPhase('steps')
    trackGuideEvent('stonly_guide_branch_shown', {
      main_goal: resolvedGoal,
      branch_name: resolvedBranch.id,
    })
  }

  /* ── Phase: Steps ── */
  const handleNext = () => {
    trackGuideEvent('stonly_guide_step_completed', {
      main_goal: devGoal || mainGoal || null,
      branch_name: branch.id,
      step_number: currentStep + 1,
    })
    setCurrentStep(prev => prev + 1)
  }

  const handleCta = () => {
    trackGuideEvent('stonly_guide_cta_clicked', {
      main_goal: devGoal || mainGoal || null,
      branch_name: branch.id,
      cta_label: branch.ctaLabel,
    })
    trackGuideEvent('stonly_guide_completed', {
      main_goal: devGoal || mainGoal || null,
      branch_name: branch.id,
    })
    dismiss(true)
    router.push(branch.activationRoute)
  }

  const step = branch.steps[currentStep]
  const isLastStep = currentStep === branch.steps.length - 1
  const ytId = step ? getYouTubeId(step.video) : null
  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1`
    : null

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={() => dismiss(false)} />

      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Welcome guide">
        <button
          className={styles.closeBtn}
          onClick={() => dismiss(false)}
          aria-label="Close guide"
        >
          <X size={16} />
        </button>

        {/* ══ WELCOME PHASE ══ */}
        {phase === 'welcome' && (
          <div className={styles.welcomePhase}>
            <div className={styles.welcomeHero}>👋</div>

            <h2 className={styles.welcomeTitle}>Welcome to Pitch Avatar 👋</h2>
            <p className={styles.welcomeBody}>
              We know what you&apos;re here to do.
              <br />
              Let&apos;s set you up your way, in under 5 minutes.
            </p>

            {/* Dev-only: pick any branch to preview */}
            {isDev && (
              <div className={styles.devOverride}>
                <label>🛠 Dev: simulate main_goal</label>
                <select
                  value={devGoal}
                  onChange={e => setDevGoal(e.target.value)}
                >
                  <option value="">— auto (from user profile) —</option>
                  {WELCOME_BRANCHES.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.id}
                    </option>
                  ))}
                  <option value="i_am_just_playing_around">
                    i_am_just_playing_around (fallback)
                  </option>
                </select>
              </div>
            )}

            <button className={styles.ctaBtn} onClick={handleLetGo}>
              Let&apos;s go <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ══ STEPS PHASE ══ */}
        {phase === 'steps' && step && (
          <div className={styles.stepsPhase}>
            <div className={styles.stepIndicator}>
              <span className={styles.stepCount}>
                Step {currentStep + 1} of {branch.steps.length}
              </span>
              {currentStep === 0 && (
                <h3 className={styles.branchHeadline}>{branch.headline}</h3>
              )}
            </div>

            {/* Video */}
            {embedUrl ? (
              <div className={styles.videoWrapper}>
                <iframe
                  key={`${branch.id}-${currentStep}`}
                  src={embedUrl}
                  className={styles.video}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={step.title}
                />
              </div>
            ) : (
              <div className={styles.videoPlaceholder}>
                <div className={styles.videoPlaceholderInner}>
                  <span>▶</span>
                  <span>Video for step {currentStep + 1}</span>
                </div>
              </div>
            )}

            {/* Text */}
            <div className={styles.stepContent}>
              <h4 className={styles.stepTitle}>{step.title}</h4>
              <p className={styles.stepBody}>{step.body}</p>
            </div>

            {/* Progress dots */}
            <div className={styles.progressDots}>
              {branch.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`${styles.dot} ${
                    idx === currentStep
                      ? styles.dotActive
                      : idx < currentStep
                      ? styles.dotDone
                      : ''
                  }`}
                />
              ))}
            </div>

            {/* CTA / Next */}
            <div className={styles.stepActions}>
              {isLastStep ? (
                <button className={styles.ctaBtn} onClick={handleCta}>
                  {branch.ctaLabel}
                </button>
              ) : (
                <button className={styles.nextBtn} onClick={handleNext}>
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
