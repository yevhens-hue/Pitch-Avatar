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
  { id: '1',  pos: '0% 0%' },
  { id: '2',  pos: '33.33% 0%' },
  { id: '3',  pos: '66.66% 0%' },
  { id: '4',  pos: '100% 0%' },
  { id: '5',  pos: '0% 50%' },
  { id: '6',  pos: '33.33% 50%' },
  { id: '7',  pos: '66.66% 50%' },
  { id: '8',  pos: '100% 50%' },
  { id: '9',  pos: '0% 100%' },
  { id: '10', pos: '33.33% 100%' },
  { id: '11', pos: '66.66% 100%' },
  { id: '12', pos: '100% 100%' },
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
  
  const [isModalOpen, setIsModalOpen]     = useState(false)
  const [modalTab, setModalTab]           = useState<'file' | 'video'>('file')

  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState('Demo role')
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [expandedInstruction, setExpandedInstruction] = useState<string | null>(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => { setIsGenerating(false); setIsDone(true) }, 3500)
  }

  const handleNext = () => {
    if (step === 4) { handleGenerate(); return }
    setStep(s => Math.min(s + 1, 4))
  }

  const roles = [
    { name: 'Demo role', desc: 'shows how businesses can automate and personalize their customer interactions through Avatars' },
    { name: 'Sales Consultant', desc: 'designed to understand what customers need and show them how product or service can help' },
    { name: 'Customer Success Manager', desc: 'helps users get the best results from product and keep them happy' },
    { name: 'Support Agent', desc: 'answers questions about product or service and connect users with human support when needed' },
    { name: 'Coach', desc: 'guides users through educational content or professional development tasks' },
  ]

  const libraryItems = [
    { title: 'About avatar info', desc: 'Avatar tells about its features and guides users on how it can...' },
    { title: 'Go to Main Menu Slide', desc: 'Takes the user to the main menu slide by voice command or cha...' },
    { title: 'Intro message new for demo', desc: 'Avatar greets your audience with a warm welcome before the...' },
    { title: 'Show page', desc: 'Avatar redirects the listener to any page you specify by URL.' },
    { title: 'Answer with Generated Image ...', desc: 'Answer with Generated Image on Slide' },
    { title: 'Call human to join', desc: "If Avatar cannot handle user's question it offers to connect wi..." },
    { title: 'Schedule meeting', desc: 'Avatar suggests scheduling a meeting and helps book the...' },
    { title: 'Show relevant links', desc: 'Shows relevant links from Knowledge base' },
    { title: 'Show relevant slide', desc: 'Show relevant slide' },
    { title: 'List of URLs', desc: 'Pages your avatar can link to' },
    { title: 'Change language', desc: 'Avatar detects and switches languages when needed.' },
    { title: 'Pricing request', desc: "Control Avatar's answer about pricing. You can add your..." },
    { title: 'Irrelevant request', desc: "Avatar's reaction to the question or request that is out of..." },
    { title: 'Need more info', desc: "Avatar's reaction if it doesn't understand user's answer." },
  ]

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
      {/* Create Presentation Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '640px',
            borderRadius: '24px',
            padding: '2.5rem',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Создать новую презентацию</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Название презентации"
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  color: '#111827'
                }}
              />
            </div>

            <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setModalTab('file')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalTab === 'file' ? '#fff' : 'transparent',
                  color: modalTab === 'file' ? '#111827' : '#6b7280',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: modalTab === 'file' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Загрузить файл
              </button>
              <button 
                onClick={() => setModalTab('video')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: modalTab === 'video' ? '#fff' : 'transparent',
                  color: modalTab === 'video' ? '#111827' : '#6b7280',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: modalTab === 'video' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Загрузить видео
              </button>
            </div>

            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '3rem 2rem',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <div style={{ flex: 1, textAlign: 'center', paddingRight: '1rem', borderRight: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem 0' }}>
                  Перетащите файлы сюда
                </p>
                <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', padding: 0 }}>
                  или нажмите, чтобы выбрать
                </button>
              </div>
              <div style={{ flex: 1, textAlign: 'center', paddingLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.75rem 0' }}>
                  Выберите из
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.25rem' }}>📁</span> Google Drive
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 2.5rem 0', textAlign: 'center' }}>
              Загрузите файл .pdf, .ppt или .pptx размером до 100 МБ, содержащий не более 100 слайдов
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <button style={{
                background: '#f3f4f6',
                color: '#9ca3af',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'not-allowed'
              }}>
                Создать
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instruction Library Modal */}
      {isLibraryOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '16px', padding: '2rem', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Библиотека инструкций</h2>
              <button onClick={() => setIsLibraryOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {libraryItems.map((item, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                  <button style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0, fontSize: '1rem' }}>+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create New Role Modal */}
      {isRoleModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '640px', borderRadius: '24px', padding: '2.5rem', position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Создать новую роль</h2>
              <button onClick={() => setIsRoleModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Имя: <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span></label>
              <input type="text" placeholder="Введите название роли" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>0/50 символов</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Описание: <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span></label>
              <textarea placeholder="Опишите свою роль" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>0/200 символов</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Инструкции: <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span></label>
              <textarea placeholder="Введите инструкции для своей роли" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '120px', resize: 'vertical' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>0/7000 символов</div>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem', marginBottom: '2rem', position: 'relative' }}>
              <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
              <p style={{ fontSize: '0.8rem', color: '#1e40af', margin: 0, lineHeight: 1.5, paddingRight: '1.5rem' }}>
                Эти инструкции определяют, как ваш аватар будет взаимодействовать с пользователями во время чат-сессий. Вы можете задать тон, стиль и конкретные модели поведения, чтобы аватар соответствовал вашему бренду и целям коммуникации.
              </p>
              <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Создать</button>
              <button onClick={() => setIsRoleModalOpen(false)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

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
                  backgroundImage: 'url(/avatars-grid.png)',
                  backgroundSize: '400% 300%',
                  backgroundPosition: a.pos,
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
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{ 
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
              }}
            >
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>Инструкции для аватара</h2>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>Имя</label>
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span style={{ fontSize: '1.1rem' }}>+</span> Добавить собственную роль
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #3b82f6', borderRadius: '12px', background: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontWeight: 600, color: '#111827' }}>{selectedRole}</span>
                <span style={{ color: '#3b82f6', fontSize: '0.8rem' }}>{isRoleDropdownOpen ? '▲' : '▼'}</span>
              </div>
              {isRoleDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', marginTop: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 10 }}>
                  {roles.map((r, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { setSelectedRole(r.name); setIsRoleDropdownOpen(false) }}
                      style={{ padding: '1rem', cursor: 'pointer', borderBottom: idx !== roles.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: selectedRole === r.name ? '#3b82f6' : '#111827', marginBottom: '0.25rem' }}>{r.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>{r.desc}</div>
                      </div>
                      {selectedRole === r.name && <span style={{ color: '#3b82f6' }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>Выбранные инструкции</h3>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer' }}
            >
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
                {INSTRUCTIONS.map((inst, idx) => {
                  const isExpanded = expandedInstruction === inst.name;
                  return (
                    <React.Fragment key={idx}>
                      <tr style={{ borderBottom: (idx !== INSTRUCTIONS.length - 1 || isExpanded) ? '1px solid #e5e7eb' : 'none' }}>
                        <td style={{ padding: '1rem', color: '#111827' }}>{inst.name}</td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>{inst.desc}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <Settings2 
                            size={18} 
                            color={isExpanded ? "#3b82f6" : "#6b7280"} 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => setExpandedInstruction(isExpanded ? null : inst.name)}
                          />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={3} style={{ padding: '1.5rem', background: '#fff' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>{inst.name}</h4>
                              <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: 0 }}>Create presentation digest using data from slides and slides scripts</p>
                            </div>

                            {[1, 2].map((num) => (
                              <div key={num} style={{ marginBottom: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Выберите слайд из медиаданных</label>
                                  <div style={{ position: 'relative' }}>
                                    <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', appearance: 'none', background: '#fff' }}>
                                      <option></option>
                                    </select>
                                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }}>▼</span>
                                  </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Сообщение от помощника</label>
                                  <textarea 
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', fontSize: '0.9rem', color: '#374151' }}
                                    defaultValue="Here is the presentation digest"
                                  />
                                </div>
                              </div>
                            ))}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                                  Update instructions settings
                                </button>
                                <button 
                                  onClick={() => setExpandedInstruction(null)}
                                  style={{ background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                  Cancel
                                </button>
                              </div>
                              <button style={{ background: '#ff1a1a', color: '#fff', border: 'none', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                                Delete instruction
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>Пользовательские инструкции</h3>
          <textarea
            className={styles.textarea}
            style={{ minHeight: 120, padding: '1rem', fontSize: '0.9rem', lineHeight: 1.5, color: '#6b7280' }}
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

