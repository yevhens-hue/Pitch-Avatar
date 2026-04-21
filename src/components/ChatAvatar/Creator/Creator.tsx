'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Play } from 'lucide-react'
import WizardLayout from '@/components/Wizard/WizardLayout'
import styles from '@/components/Wizard/WizardLayout.module.css'

const STEPS = ['Create Avatar', 'Presentation Content', 'Avatar Instructions', 'Knowledge Base']

const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'
const STEP_VIDEOS = [TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO]
const STEP_VIDEO_TITLES = [
  'How to create your AI avatar',
  'How to add presentation content',
  'How to write avatar instructions',
  'How to set up a knowledge base',
]


const AVATARS = [
  { id: '1',  emoji: '🧑‍💼' },
  { id: '2',  emoji: '👩‍💼' },
  { id: '3',  emoji: '🤵'   },
  { id: '4',  emoji: '🧕'   },
  { id: '5',  emoji: '👨‍💼' },
  { id: '6',  emoji: '👴'   },
  { id: '7',  emoji: '👩'   },
  { id: '8',  emoji: '👨'   },
  { id: '9',  emoji: '🧒'   },
  { id: '10', emoji: '👩‍🔬' },
  { id: '11', emoji: '👨‍🏫' },
  { id: '12', emoji: '👩‍🏫' },
]

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian']
const VOICES    = ['Florian (Multilingual)', 'Emma (Friendly)', 'James (Authoritative)', 'Sofia (Warm)', 'Alex (Professional)']

export default function ChatAvatarCreator() {
  const router = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const kbRef    = useRef<HTMLInputElement>(null)

  const [step, setStep]                   = useState(1)
  const [projectName, setProjectName]     = useState('Avatar Project [2026]')
  const [avatarName, setAvatarName]       = useState('Chat Avatar [2026]')
  const [language, setLanguage]           = useState('English')
  const [voice, setVoice]                 = useState('Florian (Multilingual)')
  const [selectedAvatar, setSelectedAvatar] = useState('1')
  const [contentFile, setContentFile]     = useState<File | null>(null)
  const [isDragging, setIsDragging]       = useState(false)
  const [instructions, setInstructions]   = useState('')
  const [kbFiles, setKbFiles]             = useState<File[]>([])
  const [isGenerating, setIsGenerating]   = useState(false)
  const [isDone, setIsDone]               = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => { setIsGenerating(false); setIsDone(true) }, 3500)
  }

  const handleNext = () => {
    if (step === 4) { handleGenerate(); return }
    setStep(s => Math.min(s + 1, 4))
  }

  if (isGenerating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: 56, height: 56, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Generating your Chat Avatar…</h2>
        <p style={{ color: '#64748b' }}>Setting up multilingual conversational assistant</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isDone) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✓</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>Chat Avatar created!</h1>
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>Your multilingual AI assistant "{avatarName}" is ready. Find it in My Chat Avatars.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/chat-avatar')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            My Chat Avatars
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
      title="Set Up Conversational Multilingual AI Assistant"
      steps={STEPS}
      activeStep={step}
      onStepClick={setStep}
      onNext={handleNext}
      onExit={() => router.push('/')}
      nextLabel="Generate Chat-avatar"
      stepVideos={STEP_VIDEOS}
      stepVideoTitles={STEP_VIDEO_TITLES}
    >
      {/* Step 1 — Create Avatar */}
      {step === 1 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Create Avatar</h2>
          <p className={styles.cardSubtitle}>Configure the identity and voice of your conversational AI assistant.</p>

          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input className={styles.input} value={projectName} onChange={e => setProjectName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Avatar Name</label>
            <input className={styles.input} value={avatarName} onChange={e => setAvatarName(e.target.value)} />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Default Language</label>
              <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Voice</label>
              <select className={styles.select} value={voice} onChange={e => setVoice(e.target.value)}>
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: 0, marginBottom: '1.5rem' }}>
            + Add Language
          </button>

          <div style={{ padding: '0.875rem 1rem', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #e0e7ff', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, margin: 0 }}>💡 Підказки</p>
            <ul style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 0 1rem', lineHeight: 1.6 }}>
              <li>Дайте аватару запам'ятовуване ім'я у стилі вашого бренду</li>
              <li>Голос Florian найкраще підходить для багатомовного режиму</li>
              <li>Мови можна додати або змінити пізніше в налаштуваннях</li>
            </ul>
          </div>

          <div className={styles.formGroup}>
            <label>Avatar Photo</label>
          </div>
          <div className={styles.avatarGrid}>
            <div
              className={`${styles.avatarItem} ${styles.avatarUpload}`}
              onClick={() => fileRef.current?.click()}
            >
              <span className={styles.avatarUploadPlus}>+</span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Add Your Own</span>
              <input ref={fileRef} type="file" accept="image/*" hidden />
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

      {/* Step 2 — Presentation Content */}
      {step === 2 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Presentation Content</h2>
          <p className={styles.cardSubtitle}>Upload files that the avatar will use to conduct the presentation. Supports PDF and PPTX.</p>

          <div style={{ padding: '0.875rem 1rem', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #e0e7ff', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, margin: 0 }}>💡 Підказки</p>
            <ul style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 0 1rem', lineHeight: 1.6 }}>
              <li>PDF та PPTX — оптимальний формат; до 20 слайдів</li>
              <li>Переконайтеся, що текст у файлі є виділяємим (не сканований)</li>
              <li>Аватар озвучить кожен слайд автоматично</li>
            </ul>
          </div>

          <div
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''} ${contentFile ? styles.dropzoneActive : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setContentFile(f) }}
            onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pdf,.pptx'; inp.onchange = (ev) => { const t = ev.target as HTMLInputElement; if (t.files?.[0]) setContentFile(t.files[0]) }; inp.click() }}
          >
            <div className={styles.dropzoneIcon}>
              {contentFile ? <span style={{ fontSize: '1.75rem' }}>📄</span> : <span style={{ fontSize: '1.75rem' }}>📂</span>}
            </div>
            <p className={styles.dropzoneTitle}>{contentFile ? contentFile.name : 'Upload PDF or PPTX'}</p>
            <p className={styles.dropzoneHint}>{contentFile ? 'File ready · Click to change' : 'Drag & drop or click to browse'}</p>
            {!contentFile && <button className={styles.dropzoneBtn}>Choose File</button>}
          </div>
        </div>
      )}

      {/* Step 3 — Avatar Instructions */}
      {step === 3 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Avatar Instructions</h2>
          <p className={styles.cardSubtitle}>Define how the avatar should behave and communicate with your audience.</p>
          <div className={styles.formGroup}>
            <label>System Prompt / Behavior Instructions</label>
            <textarea
              className={styles.textarea}
              style={{ minHeight: 180 }}
              placeholder={'Example: You are a friendly sales manager named Alex. Greet users warmly, answer questions about our product, and guide them toward booking a demo. Stay on-topic and use a professional but approachable tone.'}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>
          <div style={{ padding: '0.875rem 1rem', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #e0e7ff' }}>
            <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, margin: 0 }}>💡 Tips for better results</p>
            <ul style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 0 1rem', lineHeight: 1.6 }}>
              <li>Specify the avatar's name and role</li>
              <li>Define the tone (formal, friendly, technical)</li>
              <li>List topics to stay on or avoid</li>
              <li>Add a fallback instruction (e.g. "If unsure, offer to connect with a human")</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 4 — Knowledge Base */}
      {step === 4 && (
        <div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Knowledge Base</h2>
            <p className={styles.cardSubtitle}>Upload additional documents so the AI can accurately answer customer questions.</p>
            <div
              className={styles.dropzone}
              onClick={() => kbRef.current?.click()}
            >
              <div className={styles.dropzoneIcon}><span style={{ fontSize: '1.75rem' }}>📚</span></div>
              <p className={styles.dropzoneTitle}>Add documents to the knowledge base</p>
              <p className={styles.dropzoneHint}>PDF, DOCX, TXT (max 10 MB each)</p>
              <button className={styles.dropzoneBtn}>Browse Files</button>
              <input
                ref={kbRef}
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                hidden
                onChange={e => {
                  const files = Array.from(e.target.files ?? [])
                  setKbFiles(prev => [...prev, ...files])
                }}
              />
            </div>

            <div style={{ padding: '0.875rem 1rem', background: '#f5f3ff', borderRadius: '10px', border: '1px solid #e0e7ff', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, margin: 0 }}>💡 Підказки</p>
              <ul style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.5rem 0 0 1rem', lineHeight: 1.6 }}>
                <li>Завантажте FAQ, документацію продукту або прайс-листи</li>
                <li>AI використовуватиме ці файли для відповідей на запитання аудиторії</li>
                <li>Підтримуються: PDF, DOCX, TXT — до 10 МБ кожен</li>
              </ul>
            </div>

            {kbFiles.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {kbFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>📄 {f.name}</span>
                    <button onClick={() => setKbFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.generateCta}>
            <div className={styles.generateCtaTitle}>
              <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
              Generate Chat-avatar
            </div>
            <div className={styles.generateCtaDesc}>Your multilingual conversational AI assistant will be ready in seconds.</div>
            <button className={styles.generateBtn} onClick={handleGenerate}>
              <Play size={16} /> Generate Now
            </button>
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
