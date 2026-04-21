'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Sparkles, Play } from 'lucide-react'
import WizardLayout from './WizardLayout'
import styles from './WizardLayout.module.css'

const STEPS = ['Upload Video', 'Target Language', 'Dubbing Settings', 'Preview & Process']

const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'
const STEP_VIDEOS = [TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO]
const STEP_VIDEO_TITLES = [
  'How to upload your video',
  'How to set translation languages',
  'How to configure dubbing & voice',
  'How to process and export your video',
]

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian', 'Arabic', 'Japanese', 'Chinese']
const VOICES = ['Florian (Multilingual)', 'Emma (Friendly)', 'James (Authoritative)', 'Sofia (Warm)', 'Alex (Professional)']

interface Toggle {
  lipsync: boolean
  subtitles: boolean
  keepOriginal: boolean
}

export default function VideoWizard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [sourceLang, setSourceLang] = useState('English')
  const [targetLang, setTargetLang] = useState('Spanish')
  const [voice, setVoice] = useState('Florian (Multilingual)')
  const [toggles, setToggles] = useState<Toggle>({ lipsync: true, subtitles: false, keepOriginal: false })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const hasSource = !!file || youtubeUrl.trim().length > 0

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const toggle = (key: keyof Toggle) => setToggles(prev => ({ ...prev, [key]: !prev[key] }))

  const handleProcess = () => {
    setIsProcessing(true)
    setTimeout(() => { setIsProcessing(false); setIsDone(true) }, 4000)
  }

  const handleNext = () => {
    if (step === 4) { handleProcess(); return }
    setStep(s => Math.min(s + 1, 4))
  }

  const ToggleSwitch = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button className={`${styles.toggle} ${on ? styles.toggleOn : styles.toggleOff}`} onClick={onToggle}>
      <span className={styles.toggleKnob} />
    </button>
  )

  if (isProcessing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: 56, height: 56, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Translating and dubbing your video…</h2>
        <p style={{ color: '#64748b' }}>AI is generating the dubbed audio track</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✓</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Video dubbed successfully!</h1>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>Your translated and dubbed video is ready. It will appear in your Projects.</p>
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
      title="Translate and Dub Your Video"
      steps={STEPS}
      activeStep={step}
      onStepClick={setStep}
      onNext={handleNext}
      onExit={() => router.push('/')}
      nextLabel="Start Processing"
      isNextDisabled={step === 1 && !hasSource}
      stepVideos={STEP_VIDEOS}
      stepVideoTitles={STEP_VIDEO_TITLES}
    >
      {/* Step 1 — Upload Video */}
      {step === 1 && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Upload Your Video</h2>
            <p className={styles.cardSubtitle}>Upload an MP4 file or paste a YouTube / Google Drive link to get started.</p>

            <div className={styles.formGroup}>
              <label>YouTube or Google Drive URL</label>
              <input
                className={styles.input}
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, margin: '0.75rem 0' }}>— or —</div>

            <div
              className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${file ? styles.dropzoneActive : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}>
                {file ? <span style={{ fontSize: '1.75rem' }}>🎬</span> : <Upload size={28} />}
              </div>
              <p className={styles.dropzoneTitle}>{file ? file.name : 'Drag & drop your video here'}</p>
              <p className={styles.dropzoneHint}>{file ? 'File ready · Click to change' : 'MP4 up to 500 MB, max 5 minutes'}</p>
              {!file && <button className={styles.dropzoneBtn} onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>Browse Files</button>}
              <input ref={fileInputRef} type="file" accept=".mp4,.mov" hidden onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
            </div>
          </div>

          <div className={styles.card}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Or import from</p>
            <div className={styles.sourceRow}>
              {[
                { icon: '▶', label: 'YouTube' },
                { icon: '▲', label: 'Google Drive' },
                { icon: '🎥', label: 'Vimeo' },
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

      {/* Step 2 — Target Language */}
      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Translation Settings</h2>
          <p className={styles.cardSubtitle}>Select the source and target languages. Our AI will auto-detect the source if unsure.</p>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Source Language</label>
              <select className={styles.select} value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
                <option value="">Auto-detect</option>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Target Language</label>
              <select className={styles.select} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                {LANGUAGES.filter(l => l !== sourceLang).map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Translation Quality</label>
            <div className={styles.pills}>
              {[
                { key: 'standard', label: 'Standard',  desc: 'Fast & accurate' },
                { key: 'enhanced', label: 'Enhanced',  desc: 'Higher fidelity, slower' },
              ].map((q, i) => (
                <div key={q.key} className={`${styles.pill} ${i === 0 ? styles.pillActive : ''}`}>
                  <div className={styles.pillTitle} style={i !== 0 ? { color: '#374151' } : {}}>{q.label}</div>
                  <div className={styles.pillDesc}>{q.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Dubbing Settings */}
      {step === 3 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Dubbing & Voice Settings</h2>
          <p className={styles.cardSubtitle}>Configure how the dubbed audio sounds and optional subtitle export.</p>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>AI Voice</label>
              <select className={styles.select} value={voice} onChange={e => setVoice(e.target.value)}>
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Voice Library</label>
              <select className={styles.select}>
                <option>AI Library</option>
                <option>Cloned Voices</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
            <label>Options</label>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 1rem' }}>
              {[
                { key: 'lipsync',      label: 'Lip Sync',             desc: 'Match lip movements to dubbed audio' },
                { key: 'subtitles',    label: 'Add Subtitles',         desc: 'Embed subtitles in the dubbed video' },
                { key: 'keepOriginal', label: 'Keep Original Track',   desc: 'Include original audio as a secondary track' },
              ].map(t => (
                <div key={t.key} className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>{t.label}</div>
                    <div className={styles.toggleDesc}>{t.desc}</div>
                  </div>
                  <ToggleSwitch on={toggles[t.key as keyof Toggle]} onToggle={() => toggle(t.key as keyof Toggle)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Preview & Process */}
      {step === 4 && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Ready to Process</h2>
            <p className={styles.cardSubtitle}>Review your settings before we start dubbing your video.</p>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Source</div>
                <div className={styles.summaryValue}>{file?.name ?? (youtubeUrl || '—')}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>From → To</div>
                <div className={styles.summaryValue}>{sourceLang || 'Auto'} → {targetLang}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Voice</div>
                <div className={styles.summaryValue}>{voice}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryLabel}>Lip Sync</div>
                <div className={styles.summaryValue}>{toggles.lipsync ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
          </div>

          <div className={styles.generateCta}>
            <div className={styles.generateCtaTitle}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
              Upload Your Video
            </div>
            <div className={styles.generateCtaDesc}>AI will translate, generate dubbed audio and optionally add subtitles.</div>
            <button className={styles.generateBtn} onClick={handleProcess}>
              <Play size={16} /> Start Processing
            </button>
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
