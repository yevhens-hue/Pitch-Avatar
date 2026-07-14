'use client'

import React, { useMemo, useState } from 'react'

import { LayoutList, TimerReset, MessageSquareText, Sparkles } from 'lucide-react'

import { updateCoachSettings } from '@/app/actions/coachActions'
import Button from '@/components/ui/Button'
import { useCoachStore } from '@/lib/useCoachStore'
import { CoachSettings, QuestionType } from '@/types/coach'

import editorStyles from '../ProjectEditor.module.css'
import shellStyles from './KnowledgeBasePanel.module.css'
import styles from './CoachSettingsPanel.module.css'

function debounce<Args extends unknown[]>(func: (...args: Args) => void | Promise<void>, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Args): Promise<void> => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }

    return new Promise(resolve => {
      timeout = setTimeout(async () => {
        await func(...args)
        resolve()
      }, waitFor)
    })
  }
}

const DEFAULT_SETTINGS: Partial<CoachSettings> = {
  testFormat: 'text_voice',
  questionTiming: 'on_slides',
  questionOrder: 'sequential',
  feedbackFlags: {
    immediateFeedback: true,
    showCorrectAnswers: true,
    alwaysShowScore: false,
  },
  showRemainingQuestions: true,
  passingScore: 70,
}

const TEST_FORMAT_OPTIONS = [
  {
    value: 'text_voice',
    label: 'Text / voice',
    description: 'Evaluate spoken or typed responses against the expected answer.',
  },
  {
    value: 'text_slide',
    label: 'Text + slide',
    description: 'Check the answer and whether the learner chose the correct slide.',
  },
  {
    value: 'slide_only',
    label: 'Correct slide only',
    description: 'Focus the session on navigation through the presentation structure.',
  },
] as const

const QUESTION_TIMING_OPTIONS = [
  {
    value: 'before',
    label: 'Before slides',
    description: 'Ask questions first, then reveal the supporting content.',
  },
  {
    value: 'on_slides',
    label: 'On slides',
    description: 'Keep questions anchored to the relevant slide while presenting.',
  },
  {
    value: 'after',
    label: 'After slides',
    description: 'Let the learner finish the presentation before the Q&A round.',
  },
] as const

const QUESTION_ORDER_OPTIONS = [
  {
    value: 'sequential',
    label: 'Sequential',
    description: 'Use the curated order from the question set.',
  },
  {
    value: 'random_n',
    label: 'Randomized',
    description: 'Shuffle the pool for more varied coaching sessions.',
  },
] as const

const FEEDBACK_OPTIONS = [
  {
    key: 'immediateFeedback',
    label: 'Evaluate correctness immediately',
    description: 'Show whether the answer is correct, almost correct, or off target right away.',
  },
  {
    key: 'showCorrectAnswers',
    label: 'Show the expected answer after each question',
    description: 'Reveal the ideal answer so the learner can compare and adjust quickly.',
  },
  {
    key: 'alwaysShowScore',
    label: 'Keep the current score visible during the session',
    description: 'Display the live score continuously instead of only at the end.',
  },
  {
    key: 'showRemainingQuestions',
    label: 'Show how many questions are left',
    description: 'Help the learner pace the session with a remaining-questions counter.',
  },
] as const

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  product: 'Product knowledge',
  price: 'Pricing',
  competitors: 'Competitors',
  roi: 'ROI',
  objection: 'Objections',
  use_case: 'Use cases',
  technical: 'Technical',
  discovery: 'Discovery',
}

interface CoachSettingsPanelProps {
  projectId?: string
  hasPresentation?: boolean
  onOpenQuestionSet?: () => void
}

interface CoverageItem {
  type: QuestionType
  label: string
  total: number
  assigned: number
}

function formatQuestionCount(count: number): string {
  return `${count} ${count === 1 ? 'question' : 'questions'}`
}

function formatDuration(value?: number): string {
  return value && value > 0 ? `${value} min` : 'No limit'
}

const CoachSettingsPanel: React.FC<CoachSettingsPanelProps> = ({
  projectId,
  hasPresentation = false,
  onOpenQuestionSet,
}) => {
  const { settings, setSettings, scenarios } = useCoachStore()

  const [localSettings, setLocalSettings] = useState<Partial<CoachSettings> | null>(null)
  const currentSettings = localSettings ?? settings ?? DEFAULT_SETTINGS

  const saveSettings = useMemo(
    () =>
      debounce(async (newSettings: Partial<CoachSettings>) => {
        if (!projectId) return
        try {
          await updateCoachSettings(projectId, newSettings as CoachSettings)
          setSettings(newSettings as CoachSettings)
        } catch (error) {
          console.error('Failed to save coach settings', error)
        }
      }, 800),
    [projectId, setSettings],
  )

  const handleChange = (updater: (current: Partial<CoachSettings>) => Partial<CoachSettings>) => {
    setLocalSettings(previous => {
      const next = updater(previous ?? currentSettings)
      void saveSettings(next)
      return next
    })
  }

  const totalQuestions = scenarios.length
  const assignedQuestions = scenarios.filter(scenario => scenario.expectedSlideId && scenario.expectedSlideId !== 'any').length
  const unassignedQuestions = totalQuestions - assignedQuestions

  const coverageItems = useMemo<CoverageItem[]>(() => {
    const grouped = scenarios.reduce<Record<QuestionType, CoverageItem>>((accumulator, scenario) => {
      const type = scenario.questionType ?? 'product'
      const existing = accumulator[type] ?? {
        type,
        label: QUESTION_TYPE_LABELS[type],
        total: 0,
        assigned: 0,
      }

      existing.total += 1
      if (scenario.expectedSlideId && scenario.expectedSlideId !== 'any') {
        existing.assigned += 1
      }

      accumulator[type] = existing
      return accumulator
    }, {} as Record<QuestionType, CoverageItem>)

    return Object.values(grouped).sort((left, right) => right.total - left.total)
  }, [scenarios])

  const summaryItems = [
    {
      label: 'Format',
      value: TEST_FORMAT_OPTIONS.find(option => option.value === currentSettings.testFormat)?.label ?? 'Text / voice',
      tone: 'neutral' as const,
      icon: MessageSquareText,
    },
    {
      label: 'Question pool',
      value: formatQuestionCount(totalQuestions),
      tone: totalQuestions > 0 ? ('accent' as const) : ('neutral' as const),
      icon: LayoutList,
    },
    {
      label: 'Session limit',
      value: formatDuration(currentSettings.sessionDurationLimit),
      tone: 'neutral' as const,
      icon: TimerReset,
    },
  ]

  return (
    <div className={shellStyles.panel}>
      <div className={shellStyles.panelBody}>
        <div className={styles.content}>
          <section className={styles.heroSection}>
            <div className={styles.heroCopy}>
              <div className={editorStyles.panelEyebrow}>Coach Settings</div>
              <h2 className={styles.pageTitle}>Shape how each coaching session feels</h2>
              <p className={styles.pageDescription}>
                Configure answer format, session flow, and learner feedback so Coach Mode matches the way your team trains.
              </p>
            </div>

            <div className={styles.summaryGrid}>
              {summaryItems.map(item => {
                const Icon = item.icon
                return (
                  <div key={item.label} className={styles.summaryCard}>
                    <div className={styles.summaryLabelRow}>
                      <span className={styles.summaryLabel}>{item.label}</span>
                      <span className={item.tone === 'accent' ? editorStyles.projectBadge : editorStyles.projectBadgeMuted}>
                        <Icon size={12} />
                        {item.tone === 'accent' ? 'Active' : 'Set'}
                      </span>
                    </div>
                    <div className={styles.summaryValue}>{item.value}</div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Training setup</h3>
                <p className={styles.sectionDescription}>
                  Decide what learners must answer correctly and when those questions should appear.
                </p>
              </div>
            </div>

            <div className={styles.controlStack}>
              <div className={styles.controlGroup}>
                <div className={styles.controlLabelWrap}>
                  <div className={styles.controlLabel}>Test format</div>
                  <p className={styles.controlHint}>Choose the evidence Coach Mode should use when evaluating an answer.</p>
                </div>
                <div className={styles.optionGrid}>
                  {TEST_FORMAT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.optionCard} ${currentSettings.testFormat === option.value ? styles.optionCardActive : ''}`}
                      onClick={() => handleChange(current => ({ ...current, testFormat: option.value }))}
                      aria-pressed={currentSettings.testFormat === option.value}
                    >
                      <span className={styles.optionTitle}>{option.label}</span>
                      <span className={styles.optionDescription}>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inlineGrid}>
                {hasPresentation && (
                  <div className={styles.controlGroup}>
                    <div className={styles.controlLabelWrap}>
                      <div className={styles.controlLabel}>Question timing</div>
                      <p className={styles.controlHint}>Keep questions before, during, or after the slide flow.</p>
                    </div>
                    <div className={styles.optionGridCompact}>
                      {QUESTION_TIMING_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          className={`${styles.optionCard} ${styles.optionCardCompact} ${currentSettings.questionTiming === option.value ? styles.optionCardActive : ''}`}
                          onClick={() => handleChange(current => ({ ...current, questionTiming: option.value }))}
                          aria-pressed={currentSettings.questionTiming === option.value}
                        >
                          <span className={styles.optionTitle}>{option.label}</span>
                          <span className={styles.optionDescription}>{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.controlGroup}>
                  <div className={styles.controlLabelWrap}>
                    <div className={styles.controlLabel}>Question order</div>
                    <p className={styles.controlHint}>Run the session in a predictable sequence or shuffle the pool.</p>
                  </div>
                  <div className={styles.optionGridCompact}>
                    {QUESTION_ORDER_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.optionCard} ${styles.optionCardCompact} ${currentSettings.questionOrder === option.value ? styles.optionCardActive : ''}`}
                        onClick={() => handleChange(current => ({ ...current, questionOrder: option.value }))}
                        aria-pressed={currentSettings.questionOrder === option.value}
                      >
                        <span className={styles.optionTitle}>{option.label}</span>
                        <span className={styles.optionDescription}>{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <div className={styles.controlLabelWrap}>
                  <div className={styles.controlLabel}>Session time limit</div>
                  <p className={styles.controlHint}>Leave empty to keep the session open-ended for practice and role-play.</p>
                </div>
                <div className={styles.durationRow}>
                  <label className={styles.durationField}>
                    <span className={styles.durationLabel}>Minutes</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      placeholder="No limit"
                      value={currentSettings.sessionDurationLimit ?? ''}
                      onChange={event => {
                        const nextValue = event.target.value ? parseInt(event.target.value, 10) : undefined
                        handleChange(current => ({ ...current, sessionDurationLimit: nextValue }))
                      }}
                      className={styles.durationInput}
                      aria-label="Session time limit in minutes"
                    />
                  </label>
                  <div className={styles.durationMeta}>
                    <span className={styles.durationMetaLabel}>Current rule</span>
                    <span className={styles.durationMetaValue}>{formatDuration(currentSettings.sessionDurationLimit)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Question coverage</h3>
                <p className={styles.sectionDescription}>
                  Review how the current Coach Q&amp;A Set is distributed before learners enter a session.
                </p>
              </div>
              {onOpenQuestionSet && (
                <Button variant="secondary" size="sm" onClick={onOpenQuestionSet}>
                  Manage Q&amp;A Set
                </Button>
              )}
            </div>

            <div className={styles.coverageSummary}>
              <div className={styles.coverageStat}>
                <span className={styles.coverageStatLabel}>Total in set</span>
                <strong className={styles.coverageStatValue}>{formatQuestionCount(totalQuestions)}</strong>
              </div>
              <div className={styles.coverageStat}>
                <span className={styles.coverageStatLabel}>Linked to slides</span>
                <strong className={styles.coverageStatValue}>{formatQuestionCount(assignedQuestions)}</strong>
              </div>
              <div className={styles.coverageStat}>
                <span className={styles.coverageStatLabel}>Floating pool</span>
                <strong className={styles.coverageStatValue}>{formatQuestionCount(Math.max(unassignedQuestions, 0))}</strong>
              </div>
            </div>

            {coverageItems.length > 0 ? (
              <div className={styles.coverageList}>
                {coverageItems.map(item => (
                  <div key={item.type} className={styles.coverageRow}>
                    <div className={styles.coverageRowCopy}>
                      <div className={styles.coverageRowTitle}>{item.label}</div>
                      <div className={styles.coverageRowMeta}>
                        {item.assigned > 0 ? `${item.assigned} linked to slides` : 'Available in the floating pool'}
                      </div>
                    </div>
                    <div className={styles.coverageRowStats}>
                      <span className={editorStyles.projectBadge}>{item.total}</span>
                      {item.assigned !== item.total && (
                        <span className={editorStyles.projectBadgeMuted}>{item.total - item.assigned} unassigned</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Sparkles size={16} />
                <div>
                  <strong className={styles.emptyStateTitle}>No questions in the set yet</strong>
                  <p className={styles.emptyStateText}>
                    Add questions in the Coach Q&amp;A Set first, then return here to tune how they run in training.
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Learner feedback</h3>
                <p className={styles.sectionDescription}>
                  Decide how much guidance the learner sees while they move through the session.
                </p>
              </div>
            </div>

            <div className={styles.toggleList}>
              {FEEDBACK_OPTIONS.map(option => {
                const isChecked =
                  option.key === 'showRemainingQuestions'
                    ? (currentSettings.showRemainingQuestions ?? true)
                    : (currentSettings.feedbackFlags?.[option.key] ?? DEFAULT_SETTINGS.feedbackFlags?.[option.key] ?? false)

                return (
                  <label key={option.key} className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={isChecked}
                      onChange={event => {
                        if (option.key === 'showRemainingQuestions') {
                          handleChange(current => ({ ...current, showRemainingQuestions: event.target.checked }))
                          return
                        }

                        handleChange(current => ({
                          ...current,
                          feedbackFlags: {
                            immediateFeedback: current.feedbackFlags?.immediateFeedback ?? DEFAULT_SETTINGS.feedbackFlags?.immediateFeedback ?? true,
                            showCorrectAnswers: current.feedbackFlags?.showCorrectAnswers ?? DEFAULT_SETTINGS.feedbackFlags?.showCorrectAnswers ?? true,
                            alwaysShowScore: current.feedbackFlags?.alwaysShowScore ?? DEFAULT_SETTINGS.feedbackFlags?.alwaysShowScore ?? false,
                            [option.key]: event.target.checked,
                          },
                        }))
                      }}
                    />
                    <span className={styles.toggleCopy}>
                      <span className={styles.toggleTitle}>{option.label}</span>
                      <span className={styles.toggleDescription}>{option.description}</span>
                    </span>
                    <span className={`${styles.toggleVisual} ${isChecked ? styles.toggleVisualActive : ''}`} aria-hidden="true">
                      <span className={styles.toggleThumb} />
                    </span>
                  </label>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CoachSettingsPanel
