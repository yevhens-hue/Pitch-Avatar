'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, LayoutTemplate, ExternalLink } from 'lucide-react'
import WizardLayout from './WizardLayout'
import styles from './WizardLayout.module.css'

const STEPS = ['Project Setup', 'Choose Avatar', 'Voice & Language', 'Open Editor']

const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'
const STEP_VIDEOS = [TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO]
const STEP_VIDEO_TITLES = [
  'How to set up a new project',
  'How to pick an AI avatar',
  'How to choose language and voice',
  'How to start editing your blank slides',
]

const STEP_HINTS = [
  '👋 Give your project a name and pick a starting layout. "Blank Slide" gives you a clean canvas; the other layouts are great starting points for common formats.',
  '🎭 You can skip the avatar now and add one directly inside the editor later. If you pick one here, it will be pre-placed on every slide.',
  '🎙️ Set the default language and AI voice for text-to-speech. You can override these per-slide inside the editor.',
  '🚀 Your project is configured! Click "Open Editor" to jump straight into the drag-and-drop slide editor where you can add avatars, text and images.',
]

const AVATARS = [
  { id: '1', emoji: '👨‍💼' },
  { id: '2', emoji: '👩‍💼' },
  { id: '3', emoji: '🤵' },
  { id: '4', emoji: '🧕' },
  { id: '5', emoji: '👨‍🔬' },
  { id: '6', emoji: '👩‍🔬' },
  { id: '7', emoji: '👴' },
  { id: '8', emoji: '👩' },
  { id: '9', emoji: '👨' },
  { id: '10', emoji: '🧑' },
  { id: '11', emoji: '👩‍🏫' },
  { id: '12', emoji: '👨‍🏫' },
]

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian']
const VOICES = ['Alex (Professional)', 'Emma (Friendly)', 'James (Authoritative)', 'Sofia (Warm)', 'David (Calm)']

const LAYOUTS = [
  { id: 'blank', label: 'Blank Slide', icon: '⬜', desc: 'Start with an empty canvas' },
  { id: 'title', label: 'Title + Content', icon: '📄', desc: 'Slide with headline and body text' },
  { id: 'avatar', label: 'Avatar + Text', icon: '🎙️', desc: 'Avatar panel next to text block' },
  { id: 'split', label: 'Split Screen', icon: '▫️▪️', desc: 'Left image, right content' },
]

export default function ScratchWizard() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [projectName, setProjectName] = useState('New Presentation')
  const [layoutId, setLayoutId] = useState('blank')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [language, setLanguage] = useState('English')
  const [voice, setVoice] = useState('Alex (Professional)')

  const handleNext = () => {
    if (step === 4) {
      // Launch the editor with project context via query params
      const params = new URLSearchParams({
        name: projectName,
        layout: layoutId,
        avatar: selectedAvatar ?? 'none',
        lang: language,
      })
      router.push(`/editor?${params.toString()}`)
      return
    }
    setStep(s => Math.min(s + 1, 4))
  }

  return (
    <WizardLayout
      title="Add AI Avatars, Texts or Images"
      steps={STEPS}
      activeStep={step}
      onStepClick={(s) => { if (s < step) setStep(s) }}
      onNext={handleNext}
      onExit={() => router.push('/')}
      nextLabel="Open Editor"
      stepVideos={STEP_VIDEOS}
      stepVideoTitles={STEP_VIDEO_TITLES}
      stepHints={STEP_HINTS}
    >
      {/* Step 1 — Project Setup */}
      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Set Up Your Project</h2>
          <p className={styles.cardSubtitle}>Give your project a name and choose a starting layout for the first slide.</p>

          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input
              className={styles.input}
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. Product Overview"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Starting Layout</label>
            <div className={styles.pills} style={{ flexWrap: 'wrap' }}>
              {LAYOUTS.map(l => (
                <div
                  key={l.id}
                  className={`${styles.pill} ${layoutId === l.id ? styles.pillActive : ''}`}
                  onClick={() => setLayoutId(l.id)}
                  style={{ minWidth: '140px' }}
                >
                  <div className={styles.pillTitle}>{l.icon} {l.label}</div>
                  <div className={styles.pillDesc}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Choose Avatar */}
      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Add an AI Avatar (Optional)</h2>
          <p className={styles.cardSubtitle}>Pick a pre-built avatar to place on your slides, or skip and add one later in the editor.</p>

          <div className={styles.avatarGrid} data-tour="avatar-select">
            <div
              className={`${styles.avatarItem} ${styles.avatarUpload} ${selectedAvatar === null ? styles.avatarSelected : ''}`}
              onClick={() => setSelectedAvatar(null)}
            >
              <LayoutTemplate size={20} color="#94a3b8" />
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600, marginTop: 4, textAlign: 'center' }}>Skip for now</span>
            </div>
            {AVATARS.map(a => (
              <div
                key={a.id}
                className={`${styles.avatarItem} ${selectedAvatar === a.id ? styles.avatarSelected : ''}`}
                onClick={() => setSelectedAvatar(a.id)}
              >
                {a.emoji}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Voice & Language */}
      {step === 3 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Voice & Language</h2>
          <p className={styles.cardSubtitle}>Set the default language and AI voice for text-to-speech on your slides.</p>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Presentation Language</label>
              <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>AI Voice</label>
              <select className={styles.select} value={voice} onChange={e => setVoice(e.target.value)}>
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Open Editor */}
      {step === 4 && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Ready to Build</h2>
            <p className={styles.cardSubtitle}>Your blank project is configured. Click the button below to open the editor and start adding avatars, text and images.</p>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Project Name</div>
                <div className={styles.summaryValue}>{projectName || '—'}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Starting Layout</div>
                <div className={styles.summaryValue}>{LAYOUTS.find(l => l.id === layoutId)?.label ?? '—'}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Avatar</div>
                <div className={styles.summaryValue}>
                  {selectedAvatar
                    ? AVATARS.find(a => a.id === selectedAvatar)?.emoji + ' Avatar ' + selectedAvatar
                    : 'None (add in editor)'}
                </div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Language</div>
                <div className={styles.summaryValue}>{language}</div>
              </div>
            </div>
          </div>

          <div className={styles.generateCta}>
            <div className={styles.generateCtaTitle}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
              Start with Blank Slide
            </div>
            <div className={styles.generateCtaDesc}>
              The editor lets you add AI avatars, text blocks and images directly on each slide.
            </div>
            <button className={styles.generateBtn} onClick={handleNext}>
              <ExternalLink size={16} /> Open Editor
            </button>
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
