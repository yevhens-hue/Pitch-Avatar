'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Play, Settings2 } from 'lucide-react'
import WizardLayout from '@/components/Wizard/WizardLayout'
import styles from '@/components/Wizard/WizardLayout.module.css'

const STEPS = ['Создать аватара', 'Контент для презентации', 'Инструкции для аватара', 'База знаний']

const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'
const STEP_VIDEOS = [TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO]
const STEP_VIDEO_TITLES = [
  'How to create your AI avatar',
  'How to add presentation content',
  'How to write avatar instructions',
  'How to set up a knowledge base',
]

const STEP_HINTS = [
  "👋 Let's set up your AI avatar's identity! Give it a memorable name, pick the default language, and choose a voice. You can always change these later in Settings.",
  '📂 Upload the PDF or PPTX file your avatar will present. Max 20 slides — make sure the text is selectable (not a scanned image) so the AI can read it.',
  '🤖 Write a system prompt telling the AI who it is, how it should communicate, and what topics to cover or avoid. The more specific, the better the result!',
  '📚 Upload FAQs, product docs, or price lists. The AI will reference these to answer audience questions accurately. Supports PDF, DOCX, and TXT up to 10 MB each.',
]

const STEP_SUGGESTIONS = [
  ['How to name the avatar?', 'Best voice for sales?', 'Can I change language later?'],
  ['What file formats work?', 'Max slides allowed?', 'Can I use scanned PDFs?'],
  ['How long should the prompt be?', 'Tone examples?', 'Can I add fallback answers?'],
  ['What files can I upload?', 'How many KB docs?', 'When is KB used by the AI?'],
]


const AVATARS = [
  { id: '1',  url: 'https://i.pravatar.cc/150?img=11' },
  { id: '2',  url: 'https://i.pravatar.cc/150?img=12' },
  { id: '3',  url: 'https://i.pravatar.cc/150?img=13' },
  { id: '4',  url: 'https://i.pravatar.cc/150?img=14' },
  { id: '5',  url: 'https://i.pravatar.cc/150?img=15' },
  { id: '6',  url: 'https://i.pravatar.cc/150?img=16' },
  { id: '7',  url: 'https://i.pravatar.cc/150?img=17' },
  { id: '8',  url: 'https://i.pravatar.cc/150?img=18' },
  { id: '9',  url: 'https://i.pravatar.cc/150?img=19' },
  { id: '10', url: 'https://i.pravatar.cc/150?img=20' },
  { id: '11', url: 'https://i.pravatar.cc/150?img=21' },
  { id: '12', url: 'https://i.pravatar.cc/150?img=22' },
]

const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Italian', 'Portuguese', 'Polish', 'Ukrainian', 'Russian']
const VOICES    = ['Seraphina Multilingual', 'Florian (Multilingual)', 'Emma (Friendly)', 'James (Authoritative)', 'Sofia (Warm)', 'Alex (Professional)']

const INSTRUCTIONS = [
  { name: 'Show relevant slide and play', desc: '-' },
  { name: 'Intro message', desc: '-' },
  { name: 'Goodbye message', desc: '-' },
  { name: 'Show digest', desc: '-' },
  { name: 'Create slide with relevant data', desc: '-' },
  { name: 'Jokes and interesting facts periodically', desc: '-' },
  { name: 'Collect Data - Listener First Name', desc: '-' },
]

export default function ChatAvatarCreator() {
  const router = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const kbRef    = useRef<HTMLInputElement>(null)

  const [step, setStep]                   = useState(1)
  const [avatarName, setAvatarName]       = useState('Chat Avatar [02.05.2026]')
  const [language, setLanguage]           = useState('English')
  const [voice, setVoice]                 = useState('Seraphina Multilingual')
  const [selectedAvatar, setSelectedAvatar] = useState('1')
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
        <div style={{ width: 56, height: 56, border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
          <button onClick={() => router.push('/chat-avatar')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
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
      title="< Создаем вашего AI Чат-аватара"
      steps={STEPS}
      activeStep={step}
      onStepClick={setStep}
      onNext={handleNext}
      onExit={() => router.push('/')}
      nextLabel="Далее"
      stepVideos={STEP_VIDEOS}
      stepVideoTitles={STEP_VIDEO_TITLES}
      stepHints={STEP_HINTS}
      stepSuggestions={STEP_SUGGESTIONS}
    >
      {/* Step 1 — Create Avatar */}
      {step === 1 && (
        <div style={{ padding: '1rem 0' }}>
          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Имя аватара</label>
            <input className={styles.input} value={avatarName} onChange={e => setAvatarName(e.target.value)} style={{ padding: '0.625rem 0.875rem' }} />
          </div>
          
          <div className={styles.formRow} style={{ marginTop: '1.5rem' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Язык по умолчанию</label>
              <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '0.625rem 0.875rem' }}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Голос</label>
              <select className={styles.select} value={voice} onChange={e => setVoice(e.target.value)} style={{ padding: '0.625rem 0.875rem' }}>
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', padding: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⊕</span> Добавить язык
          </button>

          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827', marginBottom: '1rem' }}>Фото</label>
          </div>
          
          <div className={styles.avatarGrid}>
            {AVATARS.map(a => (
              <div
                key={a.id}
                className={`${styles.avatarItem} ${selectedAvatar === a.id ? styles.avatarSelected : ''}`}
                onClick={() => setSelectedAvatar(a.id)}
                style={{
                  backgroundImage: `url(${a.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: 0,
                  fontSize: 0,
                  borderRadius: '8px',
                  border: selectedAvatar === a.id ? '2px solid #3b82f6' : '2px solid transparent',
                  boxShadow: selectedAvatar === a.id ? '0 0 0 2px white inset' : 'none'
                }}
              >
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Presentation Content */}
      {step === 2 && (
        <div style={{ padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>Контент для презентации</h2>
            <button style={{ 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              color: '#3b82f6', 
              padding: '0.625rem 1.25rem', 
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>+</span> Добавить новую
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" id="no-slides" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <label htmlFor="no-slides" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer' }}>
              Я хочу получить своего аватара в виде чат-виджета без слайдов
            </label>
            <span style={{ color: '#9ca3af', cursor: 'help', fontSize: '1.1rem' }}>ⓘ</span>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            {/* Search and Toolbar */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Найти" 
                  style={{ width: '100%', padding: '0.625rem 2.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }} 
                />
                <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', cursor: 'pointer' }}>✕</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', color: '#6b7280' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>≡</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>▦</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>☰</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>⛶</button>
              </div>
            </div>

            {/* Pagination Controls */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Строк на странице
                <select style={{ border: 'none', background: 'none', fontWeight: 600, color: '#111827', cursor: 'pointer' }}>
                  <option>5</option>
                  <option>10</option>
                  <option>20</option>
                </select>
              </div>
              <div>1-5 из 23</div>
              <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
                <span style={{ cursor: 'pointer', opacity: 0.3 }}>«</span>
                <span style={{ cursor: 'pointer', opacity: 0.3 }}>‹</span>
                <span style={{ cursor: 'pointer' }}>›</span>
                <span style={{ cursor: 'pointer' }}>»</span>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#f9fafb', color: '#4b5563' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Предварительный просмотр</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Название</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Язык</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Статус</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Дата создания</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Widget_Chat ...', lang: 'en', date: '02.05.2026' },
                    { name: 'pitch-avatar-...', lang: 'en', date: '02.05.2026' },
                    { name: 'pitch-avatar-...', lang: 'en', date: '29.04.2026' },
                    { name: 'pitch-avatar-...', lang: 'en', date: '29.04.2026' },
                    { name: 'pitch-avatar-...', lang: 'en', date: '29.04.2026' },
                  ].map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ width: '60px', height: '36px', background: '#1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '40px', height: '20px', border: '1px solid #334155' }}></div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{item.lang}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                          success
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Blue Progress Bar at Bottom */}
            <div style={{ height: '4px', background: '#f3f4f6', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '90%', background: '#3b82f6' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Avatar Instructions */}
      {step === 3 && (
        <div style={{ padding: '1rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>Выбранные инструкции</h2>
            <button style={{ 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              color: '#3b82f6', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              + Добавить инструкцию
            </button>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#4b5563', width: '40%' }}>Имя</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#4b5563', width: '40%' }}>Описание</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#9ca3af', width: '20%' }}>Параметры ⊘</th>
                </tr>
              </thead>
              <tbody>
                {INSTRUCTIONS.map((inst, idx) => (
                  <tr key={idx} style={{ borderBottom: idx !== INSTRUCTIONS.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '1rem', color: '#111827' }}>{inst.name}</td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>{inst.desc}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Settings2 size={18} color="#6b7280" style={{ cursor: 'pointer' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>Пользовательские инструкции</h2>
          <textarea
            className={styles.textarea}
            style={{ 
              minHeight: 120, 
              padding: '1rem', 
              fontSize: '0.9rem', 
              lineHeight: 1.5,
              color: '#6b7280'
            }}
            placeholder={'Здесь вы можете описать вашу целевую аудиторию и дать четкие инструкции о том, как ваш аватар должен отвечать.\nНапример, укажите, что говорить, когда кто-то спрашивает о скидках, ценах, партнерских программах, сроках доставки или некоторых уникальных аспектах вашего бизнеса.'}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            {instructions.length}/7000 символов
          </div>
        </div>
      )}

      {/* Step 4 — Knowledge Base */}
      {step === 4 && (
        <div style={{ padding: '1rem 0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>База знаний</h2>
          
          <div
            className={styles.dropzone}
            onClick={() => kbRef.current?.click()}
            style={{ background: '#f9fafb', borderColor: '#e5e7eb', padding: '4rem 2rem' }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', color: '#9ca3af' }}>📄</span>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 500, color: '#111827', margin: '0 0 0.5rem 0' }}>
              Перетащите файлы сюда или нажмите, чтобы загрузить
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Поддерживаются PDF, DOCX, TXT до 10 МБ
            </p>
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

          {kbFiles.length > 0 && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {kbFiles.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{f.name}</span>
                  <button onClick={() => setKbFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </WizardLayout>
  )
}

