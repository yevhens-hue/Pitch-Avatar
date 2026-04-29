'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, Sparkles, Play } from 'lucide-react'
import WizardLayout from './WizardLayout'
import styles from './WizardLayout.module.css'

const STEPS = ['Upload Slides', 'Choose Avatar', 'Voice & Language', 'Preview & Generate']

const CHECKLIST_ITEMS = [
  'Pick a Creation Method',
  'Upload Your Slides',
  'Choose Your AI Avatar',
  'Generate Your Presentation',
  'Share Your Presentation',
]

/**
 * Maps the QuickWizard's active step to how many checklist items are "done".
 * "Pick a Creation Method" is auto-done the moment the user arrives here.
 */
const getChecklistDone = (wizardStep: number): number => {
  if (wizardStep >= 4) return 3  // Voice & Generate steps: Avatar done
  if (wizardStep >= 3) return 3  // Voice step: Avatar done
  if (wizardStep >= 2) return 2  // Avatar step: Upload done
  return 1                       // Upload step: Pick done
}

// Tutorial video (same for all steps — replace per-step when ready)
const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'

const STEP_VIDEOS = [
  TUTORIAL_VIDEO,
  TUTORIAL_VIDEO,
  TUTORIAL_VIDEO,
  TUTORIAL_VIDEO,
]

const STEP_VIDEO_TITLES = [
  'How to upload your slides',
  'How to choose an AI avatar',
  'How to configure voice & language',
  'How to generate your presentation',
]

const STEP_HINTS = [
  '👋 Upload your PDF or PPTX here. You can also import from Canva or Google Slides — just click the source card below the drop zone.',
  '🎭 Pick an AI avatar that will appear on each slide. "Full AI Video" adds a lip-synced face; "Voice Only" adds audio without a visual presenter.',
  '🎙️ Choose the language and AI voice. The AI will auto-generate a spoken script from your slide content — or use your existing presenter notes.',
  '✅ Everything looks good! Click "Generate" and your AI avatar presentation will be ready in under a minute.',
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

export default function QuickWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(() => {
    const urlStep = parseInt(searchParams?.get('step') ?? '1', 10)
    return isNaN(urlStep) || urlStep < 1 || urlStep > 4 ? 1 : urlStep
  })
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState('1')
  const [mode, setMode] = useState<'video' | 'voice'>('video')
  const [language, setLanguage] = useState('English')
  const [voice, setVoice] = useState('Alex (Professional)')
  const [wordCount, setWordCount] = useState('40')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => { setIsGenerating(false); setIsDone(true) }, 3500)
  }

  const goToStep = (s: number) => {
    setStep(s)
    router.replace(`/create/quick?step=${s}`, { scroll: false })
  }

  const handleNext = () => {
    if (step === 4) { handleGenerate(); return }
    goToStep(Math.min(step + 1, 4))
  }

  if (isGenerating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: 56, height: 56, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Generating your AI presentation…</h2>
        <p style={{ color: '#64748b' }}>Avatar is lip-syncing with your slides</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✓</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Your presentation is ready!</h1>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>Your AI avatar presentation has been created. You can now preview or share it.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/projects')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            Go to Projects
          </button>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', color: '#374151' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <WizardLayout
      title="Add AI Avatar or Voice to Your Slides"
      steps={STEPS}
      activeStep={step}
      onStepClick={goToStep}
      onNext={handleNext}
      onExit={() => router.push('/')}
      nextLabel="Generate"
      isNextDisabled={step === 1 && !file}
      stepVideos={STEP_VIDEOS}
      stepVideoTitles={STEP_VIDEO_TITLES}
      stepHints={STEP_HINTS}
      checklistItems={CHECKLIST_ITEMS}
      checklistDone={getChecklistDone(step)}
      checklistReward="+5 AI min reward"
    >
      {/* Step 1 — Upload Slides */}
      {step === 1 && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Upload Your Slides</h2>
            <p className={styles.cardSubtitle}>Upload a PDF or PPTX file and we'll add an AI avatar that speaks your content.</p>
            <div
              data-tour="upload-zone"
              className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${file ? styles.dropzoneActive : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>
                {file ? <span style={{ fontSize: '1.75rem' }}>📄</span> : <Upload size={28} />}
              </div>
              <p className={styles.dropzoneTitle}>{file ? file.name : 'Drag & drop your file here'}</p>
              <p className={styles.dropzoneHint}>{file ? 'File ready · Click to change' : 'PDF or PPTX up to 100 MB, max 100 slides'}</p>
              {!file && <button className={styles.dropzoneBtn} onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>Browse Files</button>}
              <input ref={fileInputRef} type="file" accept=".pdf,.pptx" hidden onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
            </div>
          </div>

          <div className={styles.card}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Or import from</p>
            <div className={styles.sourceRow}>
              {[
                { icon: '🎨', label: 'Canva' },
                { icon: '📊', label: 'Google Slides' },
                { icon: '🌐', label: 'Website / Prezi' },
              ].map(s => (
                <div key={s.label} className={styles.sourceCard}>
                  <div className={styles.sourceCardIcon}>{s.icon}</div>
                  <div className={styles.sourceCardLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Choose Avatar */}
      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Choose Your AI Avatar</h2>
          <p className={styles.cardSubtitle}>Select who will present your slides. You can also upload your own photo.</p>

          <div className={styles.pills} style={{ marginBottom: '1.75rem' }}>
            {[
              { key: 'video', label: 'Full AI Video', desc: 'Lip-synced avatar on slides' },
              { key: 'voice', label: 'Voice Only',    desc: 'AI voice without visual avatar' },
            ].map(m => (
              <div key={m.key} className={`${styles.pill} ${mode === m.key ? styles.pillActive : ''}`} onClick={() => setMode(m.key as 'video' | 'voice')}>
                <div className={styles.pillTitle}>{m.label}</div>
                <div className={styles.pillDesc}>{m.desc}</div>
              </div>
            ))}
          </div>

          {mode === 'video' && (
            <>
              <div className={styles.formGroup}>
                <label>Select Avatar</label>
              </div>
              <div className={styles.avatarGrid} data-tour="avatar-select">
                <div className={`${styles.avatarItem} ${styles.avatarUpload}`} onClick={() => {}}>
                  <span className={styles.avatarUploadPlus}>+</span>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Add Your Own</span>
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
            </>
          )}
        </div>
      )}

      {/* Step 3 — Voice & Language */}
      {step === 3 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Voice & Language</h2>
          <p className={styles.cardSubtitle}>Configure how your AI avatar speaks to the audience.</p>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Presentation Language</label>
              <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Voice Style</label>
              <select className={styles.select} value={voice} onChange={e => setVoice(e.target.value)}>
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Script Source</label>
            <div className={styles.pills}>
              {[
                { key: 'generate', label: 'AI Generate Script', desc: 'Auto-generate from slide content' },
                { key: 'notes',   label: 'Use Slide Notes',     desc: 'Use existing presenter notes' },
              ].map(s => (
                <div key={s.key} className={`${styles.pill} ${styles.pillActive}`} style={s.key === 'generate' ? {} : { background: '#fff', borderColor: '#e2e8f0' }}>
                  <div className={styles.pillTitle} style={s.key !== 'generate' ? { color: '#374151' } : {}}>{s.label}</div>
                  <div className={styles.pillDesc}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Words per Slide (approx.)</label>
            <input className={styles.input} type="number" value={wordCount} onChange={e => setWordCount(e.target.value)} min={10} max={200} />
          </div>
        </div>
      )}

      {/* Step 4 — Preview & Generate */}
      {step === 4 && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Ready to Generate</h2>
            <p className={styles.cardSubtitle}>Review your settings and click Generate to create your AI presentation.</p>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>File</div>
                <div className={styles.summaryValue}>{file?.name ?? '—'}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Mode</div>
                <div className={styles.summaryValue}>{mode === 'video' ? 'Full AI Video' : 'Voice Only'}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Language</div>
                <div className={styles.summaryValue}>{language}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Voice</div>
                <div className={styles.summaryValue}>{voice}</div>
              </div>
            </div>
          </div>

          <div className={styles.generateCta} data-tour="generate-btn">
            <div className={styles.generateCtaTitle}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
              Make Slides Interactive
            </div>
            <div className={styles.generateCtaDesc}>Our AI will lip-sync your avatar to the script and embed it into each slide.</div>
            <button className={styles.generateBtn} onClick={handleGenerate}>
              <Play size={16} /> Generate Presentation
            </button>
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
