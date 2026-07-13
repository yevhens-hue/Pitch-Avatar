'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Play, Settings2 } from 'lucide-react'
import WizardLayout from '@/components/Wizard/WizardLayout'
import styles from '@/components/Wizard/WizardLayout.module.css'
import ShareModal from '@/components/Modals/ShareModal'
import { useSaraStore } from '@/widgets/Sara/store/useSaraStore'
import { useAuth } from '@/context/AuthContext'
import { trackActivationEvent } from '@/lib/stonly'
import CoachQASetPanel from '@/components/ProjectEditor/panels/CoachQASetPanel'
import CoachSettingsPanel from '@/components/ProjectEditor/panels/CoachSettingsPanel'
import { useSearchParams } from 'next/navigation'
import { getProjects, createProject, updateProject } from '@/app/actions/projects'

import { Project } from '@/types'

const STEPS = ['Create Avatar', 'Presentation Content', 'Avatar Instructions', 'Knowledge Base']

const TUTORIAL_VIDEO = 'https://www.youtube.com/watch?v=OKzPnlCteX4'
const getStepVideos = (isCoachMode: boolean) => {
  if (isCoachMode) return [TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO]
  return [TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO, TUTORIAL_VIDEO]
}
const getStepVideoTitles = (isCoachMode: boolean) => {
  if (isCoachMode) return [
    'How to create your AI avatar',
    'How to add presentation content',
    'How to write avatar instructions',
    'How to set up Coach Q&A',
    'How to configure Coach Settings',
    'How to set up a knowledge base',
  ]
  return [
    'How to create your AI avatar',
    'How to add presentation content',
    'How to write avatar instructions',
    'How to set up a knowledge base',
  ]
}
const STEP_VIDEO_TITLES = [
  'How to create your AI avatar',
  'How to add presentation content',
  'How to write avatar instructions',
  'How to set up a knowledge base',
]

const getStepHints = (isCoachMode: boolean) => {
  const hints = [
    "👋 Let's set up your AI avatar's identity! Give it a memorable name, pick the default language, and choose a voice. You can always change these later in Settings.",
    '📂 Upload the PDF or PPTX file your avatar will present. Max 20 slides — make sure the text is selectable (not a scanned image) so the AI can read it.',
    '🤖 Write a system prompt telling the AI who it is, how it should communicate, and what topics to cover or avoid. The more specific, the better the result!',
  ]
  if (isCoachMode) {
    hints.push('🏋️ Set up Q&A for the coach mode to test the trainee.')
    hints.push('⚙️ Configure timing and scoring for the coach mode.')
  }
  hints.push('📚 Upload FAQs, product docs, or price lists. The AI will reference these to answer audience questions accurately. Supports PDF, DOCX, and TXT up to 10 MB each.')
  return hints
}

const getStepSuggestions = (isCoachMode: boolean) => {
  const suggestions = [
    ['How to name the avatar?', 'Best voice for sales?', 'Can I change language later?'],
    ['What file formats work?', 'Max slides allowed?', 'Can I use scanned PDFs?'],
    ['How long should the prompt be?', 'Tone examples?', 'Can I add fallback answers?'],
  ]
  if (isCoachMode) {
    suggestions.push(['How to generate questions?'])
    suggestions.push(['What is a passing score?'])
  }
  suggestions.push(['What files can I upload?', 'How many KB docs?', 'When is KB used by the AI?'])
  return suggestions
}


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
const getSteps = (isCoachMode: boolean) => {
  if (isCoachMode) {
    return ['Create Avatar', 'Presentation Content', 'Avatar Instructions', 'Coach Q&A Set', 'Coach Settings', 'Knowledge Base']
  }
  return ['Create Avatar', 'Presentation Content', 'Avatar Instructions', 'Knowledge Base']
}

function ChatAvatarCreatorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId') || '28cd95b1-ac14-4e4b-a57d-253b32693011'
  const saraName = searchParams.get('name')
  const saraRole = searchParams.get('role')
  const fileRef  = useRef<HTMLInputElement>(null)
  const kbRef    = useRef<HTMLInputElement>(null)

  const [step, setStep]                   = useState(1)
  const [isCoachMode, setIsCoachMode]     = useState(false)
  const { user } = useAuth()
  const prevStepRef = useRef(step)

  // Sync step with Sara AI widget store
  useEffect(() => {
    const setWizardStep = useSaraStore.getState().setWizardStep
    setWizardStep(step)
    return () => {
      setWizardStep(null)
    }
  }, [step])

  useEffect(() => {
    const prevStep = prevStepRef.current
    if (prevStep !== step) {
      if (prevStep === 1 && step > 1) {
        trackActivationEvent('tour_create_chat_avatar_1', user?.id, user?.user_metadata?.main_goal);
        trackActivationEvent('tour_create_chat_avatar', user?.id, user?.user_metadata?.main_goal);
      } else if (prevStep === 2 && step > 2) {
        trackActivationEvent('tour_create_chat_avatar_2', user?.id, user?.user_metadata?.main_goal);
      } else if (prevStep === 3 && step > 3) {
        trackActivationEvent('tour_create_chat_avatar_3', user?.id, user?.user_metadata?.main_goal);
      }
      prevStepRef.current = step
    }
  }, [step, user])
  const [projectName, setProjectName]     = useState(() => saraName ? `${saraName} Project` : 'Avatar Project [03.05.2026]')
  const [avatarName, setAvatarName]       = useState(() => saraName || 'Chat Avatar [03.05.2026]')
  const [language, setLanguage]           = useState('English')
  const [voice, setVoice]                 = useState('Seraphina Multilingual')
  const [selectedAvatar, setSelectedAvatar] = useState('1')
  const [instructions, setInstructions]   = useState('')
  const [kbFiles, setKbFiles]             = useState<File[]>([])
  const [isGenerating, setIsGenerating]   = useState(false)
  const [isDone, setIsDone]               = useState(false)
  
  const [presentationName, setPresentationName] = useState('')
  const [selectedFile, setSelectedFile]   = useState<File | null>(null)
  const [isCreating, setIsCreating]       = useState(false)
  
  const [presentations, setPresentations] = useState<Project[]>([])
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null)
  
  type KBItem = { id: string, name: string, type: string, date: string, selected: boolean }
  const [kbItems, setKbItems] = useState<KBItem[]>([])
  const [currentKbFile, setCurrentKbFile] = useState<File | null>(null)
  const [currentKbLink, setCurrentKbLink] = useState('')
  const [currentKbText, setCurrentKbText] = useState('')
  
  const loadPresentations = async () => {
    try {
      const data = await getProjects({ type: 'presentation' })
      setPresentations(data)
    } catch (e) {
      console.error('Failed to load presentations', e)
    }
  }

  useEffect(() => {
    if (step === 2) {
      loadPresentations()
    }
  }, [step])

  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(() => {
    if (!saraRole) return 'Demo role'
    // Try to match a known role (case-insensitive)
    const match = [
      'Demo role', 'Sales Consultant', 'Customer Success Manager',
      'Support Agent', 'Coach', 'HR'
    ].find(r => r.toLowerCase() === saraRole.toLowerCase())
    return match || saraRole // use as-is if not found in list
  })
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [expandedInstruction, setExpandedInstruction] = useState<string | null>(null)
  const [kbTab, setKbTab] = useState<'file' | 'link' | 'text'>('file')
  const [isNoSlides, setIsNoSlides] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'file' | 'video'>('file')

  // Auto-select role from Sara's suggestion if provided
  const roles = [
    { name: 'Demo role', desc: 'shows how businesses can automate and personalize their customer interactions through Avatars' },
    { name: 'Sales Consultant', desc: 'designed to understand what customers need and show them how product or service can help' },
    { name: 'Customer Success Manager', desc: 'helps users get the best results from product and keep them happy' },
    { name: 'Support Agent', desc: 'answers questions about product or service and connect users with human support when needed' },
    { name: 'Coach', desc: 'guides users through educational content or professional development tasks' },
    { name: 'HR', desc: 'manages HR-related questions, onboarding, and employee assistance' },
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Create the chat-avatar project in DB
      const newProject = await createProject({
        title: avatarName.trim() || 'Chat Avatar',
        type: 'chat-avatar',
        status: 'ready',
        isCoachMode,
        traineeRole: isCoachMode ? selectedRole : undefined,
        userId: user?.id,
      })

      // Save additional avatar settings into metadata
      if (newProject?.id) {
        try {
          await updateProject(newProject.id, {
            metadata: {
              language,
              voice,
              avatarId: selectedAvatar,
              instructions,
              linkedPresentationId: selectedPresentation,
              isCoachMode,
              traineeRole: isCoachMode ? selectedRole : undefined,
            }
          })
        } catch (metaErr) {
          // Non-fatal — project exists, metadata is optional
          console.warn('Could not save avatar metadata:', metaErr)
        }
      }

      setIsGenerating(false)
      setIsDone(true)
      setIsShareModalOpen(true)
    } catch (err) {
      console.error('Failed to create chat avatar:', err)
      setIsGenerating(false)
      // Still show done screen so user isn't stuck
      setIsDone(true)
    }
  }

  const handleNext = () => {
    const totalSteps = isCoachMode ? 6 : 4
    if (step === totalSteps) { handleGenerate(); return }
    setStep(s => Math.min(s + 1, totalSteps))
  }

  const isKbAddDisabled = 
    kbTab === 'file' ? !currentKbFile : 
    kbTab === 'link' ? !currentKbLink.trim() : 
    !currentKbText.trim()

  const handleAddKb = () => {
    if (isKbAddDisabled) return
    const newItem = {
      id: Math.random().toString(),
      name: kbTab === 'file' ? currentKbFile!.name : kbTab === 'link' ? 'Links group' : 'Text content',
      type: kbTab,
      date: new Date().toLocaleString('en-GB'),
      selected: true
    }
    setKbItems([...kbItems, newItem])
    setCurrentKbFile(null)
    setCurrentKbLink('')
    setCurrentKbText('')
  }


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
        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>Your multilingual AI assistant &quot;{avatarName}&quot; is ready. Find it in My Chat Avatars.</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setIsShareModalOpen(true)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            Get Link / Share
          </button>
          <button onClick={() => router.push('/chat-avatar')} style={{ background: '#fff', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
            My Chat Avatars
          </button>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '0.875rem 2rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', color: '#374151' }}>
            Back to Dashboard
          </button>
        </div>
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} projectType="chat-avatar" />
      </div>
    )
  }

  const currentSteps = getSteps(isCoachMode)

  return (
    <WizardLayout
      title="Create your AI Chat Avatar"
      steps={currentSteps}
      activeStep={step}
      onStepClick={setStep}
      onNext={handleNext}
      onExit={() => router.push('/')}
      nextLabel={step === currentSteps.length ? "Create" : (step === 3 && isCoachMode ? "Next → Coach Q&A Set" : undefined)}
      isNextDisabled={step === 2 && selectedPresentation === null && !isNoSlides}
      stepBadges={isCoachMode ? { 4: 'NEW', 5: 'NEW' } : undefined}
      extraFooterButton={step === currentSteps.length ? (
        <button 
          style={{ 
            background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', padding: '0.625rem 1.5rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginRight: '1rem' 
          }}
          data-tour="check-button"
        >
          Check
        </button>
      ) : null}
      stepVideos={getStepVideos(isCoachMode)}
      stepVideoTitles={getStepVideoTitles(isCoachMode)}
      stepHints={getStepHints(isCoachMode)}
      stepSuggestions={getStepSuggestions(isCoachMode)}
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Create new presentation</h2>
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
                placeholder="Presentation Name"
                value={presentationName}
                onChange={e => setPresentationName(e.target.value)}
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
                Upload File
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
                Upload Video
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
                {selectedFile ? (
                   <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', margin: '0 0 0.5rem 0' }}>
                     Selected: {selectedFile.name}
                   </p>
                ) : (
                   <>
                     <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem 0' }}>
                       Drag and drop files here
                     </p>
                     <label style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                       or click to select
                       <input 
                         type="file" 
                         style={{ display: 'none' }} 
                         accept={modalTab === 'file' ? ".pdf,.ppt,.pptx" : ".mp4"}
                         onChange={(e) => {
                           if (e.target.files && e.target.files[0]) {
                             setSelectedFile(e.target.files[0])
                           }
                         }} 
                       />
                     </label>
                   </>
                )}
              </div>
              <div style={{ flex: 1, textAlign: 'center', paddingLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.75rem 0' }}>
                  Select from
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.25rem' }}>📁</span> Google Drive
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 2.5rem 0', textAlign: 'center' }}>
              Upload a .pdf, .ppt, or .pptx file up to 100 MB, containing no more than 100 slides
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <button 
                disabled={!presentationName.trim() || !selectedFile || isCreating}
                onClick={async () => {
                  setIsCreating(true)
                  try {
                    // 1. Create project in DB
                    const newProject = await createProject({ title: presentationName, type: 'presentation', status: 'ready' })
                    
                    // 2. Kick off conversion fire-and-forget — converter writes slides to DB itself
                    if (selectedFile && newProject?.id) {
                      const formData = new FormData()
                      formData.append('file', selectedFile)
                      formData.append('project_id', newProject.id)
                      // Fire and forget — /api/convert returns 202 immediately
                      fetch('/api/convert', { method: 'POST', body: formData }).catch(console.error)
                    }
                    
                    // 3. Refresh list and close modal immediately (don't wait for conversion)
                    await loadPresentations()
                    setIsModalOpen(false)
                    setSelectedFile(null)
                    setPresentationName('')
                  } catch (e) {
                    console.error('Error creating presentation:', e)
                  } finally {
                    setIsCreating(false)
                  }
                }}
                style={{
                  background: (!presentationName.trim() || !selectedFile || isCreating) ? '#f3f4f6' : '#3b82f6',
                  color: (!presentationName.trim() || !selectedFile || isCreating) ? '#9ca3af' : '#fff',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: (!presentationName.trim() || !selectedFile || isCreating) ? 'not-allowed' : 'pointer'
                }}
              >
                {isCreating ? 'Creating...' : 'Create'}
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
                Cancel
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Instructions Library</h2>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Create new role</h2>
              <button onClick={() => setIsRoleModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Name: <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span></label>
              <input type="text" placeholder="Enter role name" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>0/50 characters</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Description: <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span></label>
              <textarea placeholder="Describe your role" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>0/200 characters</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Instructions: <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span></label>
              <textarea placeholder="Enter instructions for your role" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '120px', resize: 'vertical' }} />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>0/7000 characters</div>
            </div>

            <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem', marginBottom: '2rem', position: 'relative' }}>
              <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
              <p style={{ fontSize: '0.8rem', color: '#1e40af', margin: 0, lineHeight: 1.5, paddingRight: '1.5rem' }}>
                These instructions define how your avatar will interact with users during chat sessions. You can set the tone, style, and specific behavior patterns to align the avatar with your brand and communication goals.
              </p>
              <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>Create</button>
              <button onClick={() => setIsRoleModalOpen(false)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Create Avatar */}
      {step === 1 && (
        <div style={{ padding: '1rem 0' }}>
          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Project Name</label>
            <input className={styles.input} value={projectName} onChange={e => setProjectName(e.target.value)} style={{ padding: '0.625rem 0.875rem' }} />
          </div>
          
          <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Avatar Name</label>
            <input className={styles.input} value={avatarName} onChange={e => setAvatarName(e.target.value)} style={{ padding: '0.625rem 0.875rem' }} />
          </div>
          
          <div className={styles.formRow} style={{ marginTop: '1.5rem' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Default Language</label>
              <select className={styles.select} value={language} onChange={e => setLanguage(e.target.value)} style={{ padding: '0.625rem 0.875rem' }} data-tour="language-selector">
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827' }}>Voice</label>
              <select className={styles.select} value={voice} onChange={e => setVoice(e.target.value)} style={{ padding: '0.625rem 0.875rem' }} data-tour="voice-selector">
                {VOICES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', padding: 0, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⊕</span> Add language
          </button>

          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', color: '#111827', marginBottom: '1rem' }}>Photo</label>
          </div>
          
          <div className={styles.avatarGrid} data-tour="avatar-selector">
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
        <div style={{ padding: '0.5rem 0' }} data-tour="content-step">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0 }}>Presentation Content</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={isNoSlides}
              data-tour="add-content-button"
              style={{ 
                background: '#eff6ff', 
                border: '1px solid #bfdbfe', 
                color: isNoSlides ? '#9ca3af' : '#3b82f6', 
                padding: '0.625rem 1.25rem', 
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isNoSlides ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isNoSlides ? 0.6 : 1
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span> Add new
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="checkbox" 
              id="no-slides" 
              checked={isNoSlides}
              onChange={(e) => setIsNoSlides(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
            />
            <label htmlFor="no-slides" style={{ fontSize: '0.9rem', color: '#374151', cursor: 'pointer' }}>
              I want my avatar as a chat widget without slides
            </label>
            <span style={{ color: '#9ca3af', cursor: 'help', fontSize: '1.1rem' }}>ⓘ</span>
          </div>

          <div data-tour="content-table" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff', opacity: isNoSlides ? 0.5 : 1, pointerEvents: isNoSlides ? 'none' : 'auto' }}>
            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#f9fafb', color: '#4b5563' }}>
                    <th style={{ width: '40px', padding: '1rem' }}></th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Preview</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Language</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {presentations.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        No presentations found. Click "Add new" to create one.
                      </td>
                    </tr>
                  ) : presentations.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedPresentation(item.id)}
                      style={{ 
                        borderTop: '1px solid #e5e7eb', 
                        cursor: 'pointer',
                        background: selectedPresentation === item.id ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="radio" 
                          name="selectedPresentation" 
                          checked={selectedPresentation === item.id} 
                          readOnly 
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ width: '60px', height: '36px', background: '#1e293b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '40px', height: '20px', border: '1px solid #334155' }}></div>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#111827', fontWeight: 500 }}>{item.title}</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>en</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.status === 'ready' ? '#10b981' : '#f59e0b' }}>
                          <span style={{ width: '8px', height: '8px', background: item.status === 'ready' ? '#10b981' : '#f59e0b', borderRadius: '50%' }}></span>
                          {item.status}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
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
          {/* Coach Mode Toggle */}
          <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #fde68a' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1.1rem', color: '#92400e', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isCoachMode}
                onChange={(e) => setIsCoachMode(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#d97706', cursor: 'pointer' }}
              />
              Coach Mode <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>NEW</span>
            </label>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#b45309', lineHeight: 1.5, paddingLeft: '2.25rem' }}>
              Turns this project into a training simulation. Enabling it adds the Coach Q&A Set and Coach Settings steps.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>
              Name
            </h2>
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              style={{ 
                background: 'none', border: 'none', color: '#3b82f6', fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' 
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>+</span> Add custom role
            </button>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', color: '#111827', background: '#fff' }}
            >
              <option value="" disabled>Select a role...</option>
              {roles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: 0 }}>Selected Instructions</h2>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              style={{ 
              background: '#eff6ff', 
              border: '1px solid #bfdbfe', 
              color: '#3b82f6', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              + Add instruction
            </button>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#4b5563', width: '40%' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#4b5563', width: '40%' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#9ca3af', width: '20%' }}>Settings ⊘</th>
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

          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '0.75rem' }}>Custom Instructions</h2>
          <textarea
            className={styles.textarea}
            style={{ 
              minHeight: 120, 
              padding: '1rem', 
              fontSize: '0.9rem', 
              lineHeight: 1.5,
              color: '#6b7280'
            }}
            placeholder={'Here you can describe your target audience and give clear instructions on how your avatar should respond.\nFor example, specify what to say when someone asks about discounts, prices, affiliate programs, delivery times, or specific unique aspects of your business.'}
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            data-tour="instructions-input"
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            {instructions.length}/7000 characters
          </div>
        </div>
      )}

      {/* Step 4 & 5 (Coach Mode) */}
      {isCoachMode && step === 4 && (
        <div style={{ padding: '1rem 0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>Coach Q&A Set</h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Here you can import or generate questions to test the trainee.</p>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <CoachQASetPanel projectId={projectId} />
          </div>
        </div>
      )}

      {isCoachMode && step === 5 && (
        <div style={{ padding: '1rem 0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>Coach Settings</h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Configure constraints, timing, and score thresholds for this simulation.</p>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <CoachSettingsPanel projectId={projectId} />
          </div>
        </div>
      )}

      {/* Final Step — Knowledge Base */}
      {step === (isCoachMode ? 6 : 4) && (
        <div style={{ padding: '1rem 0' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem' }}>Knowledge Base</h2>

          {/* KB Tabs */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
            {(['file', 'link', 'text'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setKbTab(tab)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: kbTab === tab ? '#fff' : 'transparent',
                  color: kbTab === tab ? '#111827' : '#6b7280',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: kbTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {tab === 'file' ? 'File' : tab === 'link' ? 'Link' : 'Text'}
              </button>
            ))}
          </div>

          {/* KB Content Based on Tab */}
          {kbTab === 'file' && (
            <>
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
                  Upload files that can serve as a knowledge source for your Chat Avatar. This information will improve your avatar&apos;s responses during conversations.
                </p>
              </div>
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '3rem 2rem', display: 'flex', alignItems: 'center', marginBottom: '1rem', background: '#fff' }}>
                <div style={{ flex: 1, textAlign: 'center', paddingRight: '1rem', borderRight: '1px solid #e5e7eb' }}>
                  {currentKbFile ? (
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10b981', margin: '0 0 0.5rem 0' }}>
                      Selected: {currentKbFile.name}
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 0.5rem 0' }}>Drag and drop files here</p>
                      <label style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                        or click to select
                        <input 
                          type="file" 
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setCurrentKbFile(e.target.files[0])
                            }
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>
                <div style={{ flex: 1, textAlign: 'center', paddingLeft: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: '0 0 0.75rem 0' }}>Select from</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: 600 }}>
                    <span style={{ fontSize: '1.25rem' }}>📁</span> Google Drive
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 1.5rem 0', textAlign: 'center' }}>
                Upload a .pdf, .ppt, .pptx, .doc, .docx, .mp4, or .mp3 file up to 100 MB
              </p>
            </>
          )}

          {kbTab === 'link' && (
            <>
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
                  Your chat avatar can visit and analyze all pages in this group to provide detailed, context-aware answers.
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Link Type</label>
                <select style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '10px', background: '#fff' }}>
                  <option>Link Group</option>
                </select>
              </div>
              <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Link Group <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span>
                </label>
                <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>+ Upload File</button>
              </div>
              <textarea 
                placeholder="Paste your links here"
                value={currentKbLink}
                onChange={e => setCurrentKbLink(e.target.value)}
                style={{ width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '12px', minHeight: '100px', fontSize: '0.9rem', marginBottom: '0.5rem' }}
                data-tour="knowledge-base-input"
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
                0/50000 remaining characters. Internal links will not work.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                <label style={{ fontSize: '0.9rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Use web images for answers <span style={{ color: '#9ca3af', cursor: 'help' }}>ⓘ</span>
                </label>
              </div>
            </>
          )}

          {kbTab === 'text' && (
            <>
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.25rem', color: '#3b82f6' }}>ⓘ</span>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
                  Enter text here to provide your avatar with a knowledge source to answer your audience.
                </p>
              </div>
              <textarea 
                placeholder="Text"
                value={currentKbText}
                onChange={e => setCurrentKbText(e.target.value)}
                style={{ width: '100%', padding: '1rem', border: '1px solid #d1d5db', borderRadius: '12px', minHeight: '200px', fontSize: '1rem', marginBottom: '1.5rem' }}
              />
            </>
          )}

          <button 
            disabled={isKbAddDisabled}
            onClick={handleAddKb}
            style={{ 
              background: isKbAddDisabled ? '#f3f4f6' : '#3b82f6', 
              color: isKbAddDisabled ? '#9ca3af' : '#fff', 
              border: 'none', 
              padding: '0.625rem 1.5rem', 
              borderRadius: '8px', 
              fontWeight: 600, 
              fontSize: '0.875rem', 
              cursor: isKbAddDisabled ? 'not-allowed' : 'pointer', 
              marginBottom: '2rem' 
          }}>
            Add
          </button>

          {/* KB Table */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#4b5563', background: '#fff' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Settings</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Knowledge Base Date</th>
                </tr>
              </thead>
              <tbody>
                {kbItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No knowledge base items yet. Add some files, links, or text above.
                    </td>
                  </tr>
                ) : kbItems.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem', color: '#111827', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{item.type === 'link' ? '🔗' : item.type === 'text' ? '📝' : '📄'}</span> {item.name}
                    </td>
                    <td style={{ padding: '1rem', color: '#6b7280' }}>{item.type}</td>
                    <td style={{ padding: '1rem' }}></td>
                    <td style={{ padding: '1rem', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.date}
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        onChange={(e) => {
                          setKbItems(items => items.map(i => i.id === item.id ? { ...i, selected: e.target.checked } : i))
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} projectType="chat-avatar" />
    </WizardLayout>
  )
}

export default function ChatAvatarCreator() {
  return (
    <React.Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading Editor...</div>}>
      <ChatAvatarCreatorInner />
    </React.Suspense>
  )
}


