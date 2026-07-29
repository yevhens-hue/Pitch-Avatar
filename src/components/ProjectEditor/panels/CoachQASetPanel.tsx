'use client'

import React, { useState } from 'react'
import { X, Edit2, Loader2, Link2, FileText, Database, Sparkles } from 'lucide-react'
import { QuestionType, BuyerScenario, RoleTemplate } from '@/types/coach'
import { KnowledgeItem } from '@/types'
import { getProjectKnowledge, saveKnowledgeItem } from '@/app/actions/knowledge'
import kbStyles from './KnowledgeBasePanel.module.css'
import cStyles from './CoachPanels.module.css'
import panelStyles from './CoachQASetPanel.module.css'
import { useCoachStore } from '@/lib/useCoachStore'
import { updateCoachScenarios, updateCoachSettings } from '@/app/actions/coachActions'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import KnowledgeBaseUI, { KBItem } from '@/components/ChatAvatar/Creator/KnowledgeBaseUI'
import { useUIStore } from '@/lib/store'

interface CoachQASetPanelProps {
  projectId?: string
}

type AddTab = 'file' | 'link' | 'text'

interface SavedSet {
  id: string
  name: string
  scenarios: BuyerScenario[]
  createdAt: string
}

interface SpeechRecognitionAlternativeLike {
  transcript: string
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultLike[]
}

interface SpeechRecognitionErrorEventLike {
  error: string
}

interface SpeechRecognitionInstanceLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionInstanceLike
}

const DEFAULT_TOPICS: QuestionType[] = ['product', 'price', 'objection', 'technical', 'discovery', 'roi', 'competitors', 'use_case']

const CoachQASetPanel: React.FC<CoachQASetPanelProps> = ({ projectId }) => {
  const { isFutureVersion } = useUIStore()
  const { scenarios, setScenarios, traineeRole } = useCoachStore()
  const [sources, setSources] = useState<KnowledgeItem[]>([])
  const [isLoadingSources, setIsLoadingSources] = useState(false)
  const [attachKbNow, setAttachKbNow] = useState(false)
  const [generateQuestionsNow, setGenerateQuestionsNow] = useState(false)
  const [futureVariant, setFutureVariant] = useState<'variant1' | 'variant2' | 'variant3'>('variant3')
  const [setName, setSetName] = useState('Default Coach Q&A Set')
  const [isEditingSetName, setIsEditingSetName] = useState(false)
  const [setNameInput, setSetNameInput] = useState('Default Coach Q&A Set')

  // Topic Management State
  const [availableTopics, setAvailableTopics] = useState<string[]>(DEFAULT_TOPICS)
  const [showAddTopicInput, setShowAddTopicInput] = useState(false)
  const [newTopicInput, setNewTopicInput] = useState('')
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null)
  const [editingTopicValue, setEditingTopicValue] = useState('')
  const [isSavingSet, setIsSavingSet] = useState(false)

  React.useEffect(() => {
    if (projectId) {
      setIsLoadingSources(true)
      getProjectKnowledge(projectId)
        .then(data => setSources(data))
        .finally(() => setIsLoadingSources(false))
    }
  }, [projectId])

  const handleSaveSet = async () => {
    if (!projectId) {
      setToast({ message: 'Q&A Set saved locally!', type: 'success' })
      return
    }
    setIsSavingSet(true)
    try {
      await updateCoachScenarios(projectId, scenarios)
      setToast({ message: 'Q&A Set saved successfully!', type: 'success' })
    } catch (err) {
      console.error(err)
      setToast({ message: 'Failed to save Q&A Set', type: 'error' })
    } finally {
      setIsSavingSet(false)
    }
  }

  const handleGenerateForTopic = async (topic: string) => {
    if (!projectId) return

    setIsGenerating(true)
    setToast(null)

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch('/api/coach/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          projectId,
          maxQuestions: 3,
          questionTypes: [topic],
          roleTemplate: traineeRole || 'buyer',
          sourceIds: sources.map(s => s.id),
        }),
      })

      if (!res.ok) throw new Error('Failed to generate questions')

      const data = await res.json()
      const newScenarios = (data.questions || []).map((scenario: BuyerScenario) => ({
        ...scenario,
        id: scenario.id || `gen-${Date.now()}-${Math.random()}`,
        questionType: topic as QuestionType,
        language: genLanguage,
      }))
      const updated = [...scenarios, ...newScenarios]
      setScenarios(updated)
      await updateCoachScenarios(projectId, updated)
      setToast({ message: `Added +${newScenarios.length} questions for topic "${topic}"!`, type: 'success' })
    } catch (error) {
      console.error(error)
      setToast({ message: `Failed to generate questions for topic "${topic}"`, type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
  const [modalFile, setModalFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<BuyerScenario>>({
    questionText: '',
    expectedAnswer: '',
    questionType: 'product',
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  const [genCount, setGenCount] = useState('5')
  const [genDifficulty, setGenDifficulty] = useState('Medium')
  const [genLanguage, setGenLanguage] = useState('English')
  const [genTypes, setGenTypes] = useState<QuestionType[]>(['price', 'objection', 'technical'])

  // KB state for Content for Tests section
  const [kbTab, setKbTab] = useState<'file' | 'link' | 'text'>('file')
  const [currentKbFile, setCurrentKbFile] = useState<File | null>(null)
  const [currentKbLink, setCurrentKbLink] = useState('')
  const [currentKbText, setCurrentKbText] = useState('')
  const isKbAddDisabled = kbTab === 'file' ? !currentKbFile : kbTab === 'link' ? !currentKbLink.trim() : !currentKbText.trim()

  const handleAddKb = () => {
    const generatedId = Date.now()
    const newItem: KBItem = {
      id: String(generatedId),
      name: kbTab === 'file' ? (currentKbFile?.name ?? 'File') : kbTab === 'link' ? 'Links Group' : 'Text Content',
      type: kbTab === 'file' ? 'file' : kbTab === 'link' ? 'link' : 'text',
      date: new Date().toLocaleDateString(),
      selected: false,
    }
    setSources(prev => [...prev, { id: generatedId, name: newItem.name, type: newItem.type, size: 'Unknown', date: newItem.date, status: 'indexed' }])
    setCurrentKbFile(null)
    setCurrentKbLink('')
    setCurrentKbText('')
  }

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'Text / Web') return <span className={kbStyles.typeIconT}>T</span>
    if (type === 'link') return <Link2 size={14} className={kbStyles.typeIconLink} />
    return <FileText size={14} className={kbStyles.typeIconFile} />
  }

  const toggleGenType = (type: QuestionType) => {
    setGenTypes(prev => (prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]))
  }

  const handleAddTopic = () => {
    const trimmed = newTopicInput.trim().toLowerCase()
    if (!trimmed) return
    if (availableTopics.includes(trimmed)) {
      setToast({ message: 'Topic already exists', type: 'error' })
      return
    }
    setAvailableTopics(prev => [...prev, trimmed])
    setGenTypes(prev => [...prev, trimmed as QuestionType])
    setNewTopicInput('')
    setShowAddTopicInput(false)
    setToast({ message: `Topic "${trimmed}" added!`, type: 'success' })
  }

  const handleSaveEditedTopic = (index: number) => {
    const oldTopic = availableTopics[index]
    const newTopic = editingTopicValue.trim().toLowerCase()
    if (!newTopic) return
    if (oldTopic === newTopic) {
      setEditingTopicIndex(null)
      return
    }
    if (availableTopics.includes(newTopic)) {
      setToast({ message: 'Topic already exists', type: 'error' })
      return
    }
    const updated = [...availableTopics]
    updated[index] = newTopic
    setAvailableTopics(updated)

    setGenTypes(prev => prev.map(t => (t === oldTopic ? (newTopic as QuestionType) : t)))

    const updatedScenarios = scenarios.map(s =>
      s.questionType === oldTopic ? { ...s, questionType: newTopic as QuestionType } : s,
    )
    setScenarios(updatedScenarios)
    if (projectId) updateCoachScenarios(projectId, updatedScenarios)

    setEditingTopicIndex(null)
    setToast({ message: `Topic renamed to "${newTopic}"!`, type: 'success' })
  }

  const handleDeleteTopic = (index: number) => {
    const topicToDelete = availableTopics[index]
    const updated = availableTopics.filter((_, i) => i !== index)
    setAvailableTopics(updated)
    setGenTypes(prev => prev.filter(t => t !== topicToDelete))
    setEditingTopicIndex(null)
    setToast({ message: `Topic "${topicToDelete}" removed`, type: 'success' })
  }

  const handleGenerate = async () => {
    if (!projectId) return

    setIsGenerating(true)
    setToast(null)

    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch('/api/coach/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          projectId,
          maxQuestions: parseInt(genCount, 10) || 5,
          questionTypes: genTypes,
          roleTemplate: traineeRole || 'buyer',
          sourceIds: sources.map(s => s.id),
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const newScenarios = (data.questions || []).map((scenario: BuyerScenario) => ({
        ...scenario,
        id: scenario.id || `gen-${Date.now()}-${Math.random()}`,
        language: genLanguage,
      }))
      const updated = [...scenarios, ...newScenarios]
      setScenarios(updated)
      await updateCoachScenarios(projectId, updated)
      setToast({ message: 'Questions generated successfully!', type: 'success' })
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : 'Unknown error'
      setToast({ message: `Failed to generate questions: ${msg}`, type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    setSources(prev => [
      ...prev,
      {
        id: Date.now(),
        name: 'Dropped_File.pdf',
        date: new Date().toLocaleDateString(),
        type: 'PDF',
        size: '2MB',
        status: 'indexed',
      },
    ])
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleAddSource = async () => {
    let itemToSave: { name: string; type: string; url?: string; content?: string } | null = null

    if (addTab === 'file' && modalFile) {
      itemToSave = { name: modalFile.name, type: 'file' }
      try {
        const formData = new FormData()
        formData.append('file', modalFile)
        
        // Fetch JWT for backend auth if needed
        const session = (await supabase.auth.getSession()).data.session;
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: {
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: formData
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.content) {
            itemToSave.content = data.content
          }
        } else {
          console.error('Failed to extract file text', await res.text())
        }
      } catch (err) {
        console.error('Error uploading file:', err)
      }
    } else if (addTab === 'link' && linkText.trim()) {
      itemToSave = { name: 'Links Group', type: 'link', url: linkText.trim() }
    } else if (addTab === 'text' && customText.trim()) {
      itemToSave = { name: 'Text Content', type: 'Text / Web', content: customText.trim() }
    }

    if (!itemToSave) return

    // Optimistically add to local state
    const tempItem: KnowledgeItem = {
      id: Date.now(),
      name: itemToSave.name,
      type: itemToSave.type,
      size: 'Unknown',
      date: new Date().toLocaleDateString(),
      status: 'indexed',
    }
    setSources(prev => [...prev, tempItem])
    setShowAddModal(false)
    setModalFile(null)
    setLinkText('')
    setCustomText('')

    // Persist to DB if projectId is available
    if (projectId) {
      const saved = await saveKnowledgeItem(projectId, itemToSave)
      if (saved) {
        // Replace temp item with real DB item
        setSources(prev => prev.map(s => s.id === tempItem.id ? saved : s))
      }
    }
  }

  const handleAddManually = () => {
    const newId = Date.now().toString()
    const newScenario: BuyerScenario = {
      id: newId,
      questionText: 'New Question?',
      expectedAnswer: '',
      questionType: 'product',
      roleTemplate: (traineeRole as RoleTemplate) || 'buyer',
      evaluationCriteria: [],
      language: genLanguage,
    }
    const updated = [newScenario, ...scenarios]
    setScenarios(updated)
    setEditingQuestionId(newId)
    setEditForm({ questionText: 'New Question?', expectedAnswer: '', questionType: 'product' })
    if (projectId) updateCoachScenarios(projectId, updated)
  }

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async loadEvent => {
      const text = loadEvent.target?.result as string
      if (!text) return

      const lines = text.split('\n').filter(line => line.trim().length > 0)
      const newScenarios: BuyerScenario[] = []
      const startIndex = lines[0].toLowerCase().includes('question') ? 1 : 0

      for (let index = startIndex; index < lines.length; index += 1) {
        const parts = lines[index].split(',').map(part => part.trim().replace(/^"|"$/g, ''))
        if (!parts[0]) continue

        newScenarios.push({
          id: `csv-${Date.now()}-${index}`,
          questionText: parts[0],
          expectedAnswer: parts[1] || '',
          questionType: (parts[2]?.toLowerCase() || 'product') as QuestionType,
          roleTemplate: ((traineeRole as RoleTemplate) || 'buyer'),
          evaluationCriteria: [],
        })
      }

      if (newScenarios.length > 0) {
        const updated = [...newScenarios, ...scenarios]
        setScenarios(updated)
        if (projectId) await updateCoachScenarios(projectId, updated)
        setToast({ message: `Imported ${newScenarios.length} questions from CSV!`, type: 'success' })
      }
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const saveEdit = () => {
    const updated = scenarios.map(question =>
      question.id === editingQuestionId ? ({ ...question, ...editForm } as BuyerScenario) : question,
    )
    setScenarios(updated)
    setEditingQuestionId(null)
    if (projectId) updateCoachScenarios(projectId, updated)
  }

  const handleDelete = (id: string) => {
    const updated = scenarios.filter(question => question.id !== id)
    setScenarios(updated)
    if (projectId) updateCoachScenarios(projectId, updated)
  }


  return (
    <div className={kbStyles.panel}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className={kbStyles.panelBody}>
        <div className={panelStyles.content}>
          <div style={{ marginBottom: '1rem', padding: '12px', background: 'var(--pitch-surface-2)', borderRadius: '8px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={16} /> Total questions in current set: {(scenarios || []).length}
          </div>

          {/* Setup Choice UI: Future (Quotas) vs Current Version */}
          {isFutureVersion ? (
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Variant Switcher Pill Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  Future Design Experiment:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setFutureVariant('variant1')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: futureVariant === 'variant1' ? 600 : 400,
                      borderRadius: '6px',
                      border: 'none',
                      background: futureVariant === 'variant1' ? '#3b82f6' : 'transparent',
                      color: futureVariant === 'variant1' ? '#fff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Variant 1: Action Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setFutureVariant('variant2')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: futureVariant === 'variant2' ? 600 : 400,
                      borderRadius: '6px',
                      border: 'none',
                      background: futureVariant === 'variant2' ? '#3b82f6' : 'transparent',
                      color: futureVariant === 'variant2' ? '#fff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Variant 2: Segmented Control
                  </button>
                  <button
                    type="button"
                    onClick={() => setFutureVariant('variant3')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: futureVariant === 'variant3' ? 600 : 400,
                      borderRadius: '6px',
                      border: 'none',
                      background: futureVariant === 'variant3' ? '#3b82f6' : 'transparent',
                      color: futureVariant === 'variant3' ? '#fff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    Variant 3: Step Accordions
                  </button>
                </div>
              </div>

              {futureVariant === 'variant1' ? (
                /* Interactive Setup Choice Cards (Variant 1: Action Cards) */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Card 1: Knowledge Base */}
                  <div 
                    onClick={() => setAttachKbNow(!attachKbNow)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${attachKbNow ? '#3b82f6' : '#e2e8f0'}`,
                      background: attachKbNow ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: attachKbNow ? '0 4px 12px rgba(59, 130, 246, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: attachKbNow ? '#3b82f6' : '#f1f5f9', color: attachKbNow ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Database size={20} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#0f172a' }}>Connect Knowledge Base</h4>
                      </div>
                      <input type="checkbox" checked={attachKbNow} readOnly style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Upload files, links, or text to serve as the training knowledge source.
                    </p>
                  </div>

                  {/* Card 2: AI Question Generator */}
                  <div 
                    onClick={() => setGenerateQuestionsNow(!generateQuestionsNow)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${generateQuestionsNow ? '#3b82f6' : '#e2e8f0'}`,
                      background: generateQuestionsNow ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: generateQuestionsNow ? '0 4px 12px rgba(59, 130, 246, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: generateQuestionsNow ? '#3b82f6' : '#f1f5f9', color: generateQuestionsNow ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={20} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#0f172a' }}>Generate Questions with AI</h4>
                      </div>
                      <input type="checkbox" checked={generateQuestionsNow} readOnly style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Configure AI parameters and auto-generate Q&A pairs for your set.
                    </p>
                  </div>
                </div>
              ) : futureVariant === 'variant2' ? (
                /* Interactive Segmented Switcher (Variant 2: Segmented Control) */
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>Choose Setup Method</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Select how you want to build this coaching Q&A set</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
                    {/* Mode 1: Knowledge Base */}
                    <button
                      type="button"
                      onClick={() => { setAttachKbNow(true); setGenerateQuestionsNow(false); }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: attachKbNow && !generateQuestionsNow ? '#ffffff' : 'transparent',
                        color: attachKbNow && !generateQuestionsNow ? '#0f172a' : '#64748b',
                        fontWeight: attachKbNow && !generateQuestionsNow ? 600 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: attachKbNow && !generateQuestionsNow ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Database size={18} style={{ color: attachKbNow && !generateQuestionsNow ? '#3b82f6' : '#94a3b8' }} />
                      Knowledge Base
                    </button>

                    {/* Mode 2: AI Generator */}
                    <button
                      type="button"
                      onClick={() => { setGenerateQuestionsNow(true); setAttachKbNow(false); }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: generateQuestionsNow && !attachKbNow ? '#ffffff' : 'transparent',
                        color: generateQuestionsNow && !attachKbNow ? '#0f172a' : '#64748b',
                        fontWeight: generateQuestionsNow && !attachKbNow ? 600 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: generateQuestionsNow && !attachKbNow ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Sparkles size={18} style={{ color: generateQuestionsNow && !attachKbNow ? '#8b5cf6' : '#94a3b8' }} />
                      AI Generator
                    </button>

                    {/* Mode 3: Combined Workflow */}
                    <button
                      type="button"
                      onClick={() => { setAttachKbNow(true); setGenerateQuestionsNow(true); }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: attachKbNow && generateQuestionsNow ? '#ffffff' : 'transparent',
                        color: attachKbNow && generateQuestionsNow ? '#0f172a' : '#64748b',
                        fontWeight: attachKbNow && generateQuestionsNow ? 600 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: attachKbNow && generateQuestionsNow ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <FileText size={18} style={{ color: attachKbNow && generateQuestionsNow ? '#10b981' : '#94a3b8' }} />
                      Full Workflow (KB + AI)
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Step Accordions (Variant 3: Smart Step Cards) */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Step 1: Knowledge Base */}
                  <div 
                    onClick={() => setAttachKbNow(!attachKbNow)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: `1.5px solid ${attachKbNow ? '#3b82f6' : '#e2e8f0'}`,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: attachKbNow ? '0 4px 12px rgba(59, 130, 246, 0.06)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: attachKbNow ? '#eff6ff' : '#f8fafc', color: attachKbNow ? '#3b82f6' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Database size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>1. Knowledge Base Source</h4>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: attachKbNow ? '#dbeafe' : '#f1f5f9', color: attachKbNow ? '#1e40af' : '#64748b', fontWeight: 600 }}>
                              {attachKbNow ? 'Connected' : 'Optional'}
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                            Upload PDFs, URL links, or product specs for the avatar to base questions on.
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" checked={attachKbNow} readOnly style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }} />
                    </div>
                  </div>

                  {/* Step 2: AI Q&A Generator */}
                  <div 
                    onClick={() => setGenerateQuestionsNow(!generateQuestionsNow)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: `1.5px solid ${generateQuestionsNow ? '#8b5cf6' : '#e2e8f0'}`,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: generateQuestionsNow ? '0 4px 12px rgba(139, 92, 246, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: generateQuestionsNow ? '#f3e8ff' : '#f8fafc', color: generateQuestionsNow ? '#8b5cf6' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>2. AI Question Generator</h4>
                            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', background: generateQuestionsNow ? '#f3e8ff' : '#f1f5f9', color: generateQuestionsNow ? '#6b21a8' : '#64748b', fontWeight: 600 }}>
                              {generateQuestionsNow ? 'Active' : 'Recommended'}
                            </span>
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                            Auto-generate Q&A pairs tailored to your buyer persona and sales topics.
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" checked={generateQuestionsNow} readOnly style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standard Setup Checkboxes (Current Version) */
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={attachKbNow}
                  onChange={e => setAttachKbNow(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                Do you want to connect a Knowledge Base now?
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={generateQuestionsNow}
                  onChange={e => setGenerateQuestionsNow(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer' }}
                />
                Do you want to generate questions now?
              </label>
            </div>
          )}

          {/* Content for Tests — same UI as Knowledge Base step */}
          {attachKbNow && (
            <KnowledgeBaseUI
              title="Content for Tests"
              description="Upload files, links, or text that the coach should use when generating questions."
              kbTab={kbTab}
              setKbTab={setKbTab}
              currentKbFile={currentKbFile}
              setCurrentKbFile={setCurrentKbFile}
              currentKbLink={currentKbLink}
              setCurrentKbLink={setCurrentKbLink}
              currentKbText={currentKbText}
              setCurrentKbText={setCurrentKbText}
              isKbAddDisabled={isKbAddDisabled}
              handleAddKb={handleAddKb}
              kbItems={(sources || []).map(s => ({ id: s.id, name: s.name, type: s.type, date: s.date ?? '', selected: false }))}
              setKbItems={(items) => {
                const current = sources || []
                const resolved = typeof items === 'function'
                  ? items(current.map(s => ({ id: s.id, name: s.name, type: s.type, date: s.date ?? '', selected: false })))
                  : items
                setSources(prev => (prev || []).filter(s => resolved.some(r => r.id === s.id)))
              }}
              dateColumnLabel="Date Added"
            />
          )}

          {/* Generation Parameters */}
          {generateQuestionsNow && (
            <>
              <section className={panelStyles.section} style={{ marginTop: '1.5rem' }}>
              <h3 className={panelStyles.sectionHeading}>Generation Parameters</h3>
              <div className={panelStyles.settingsCard}>
              <div className={panelStyles.fieldGrid}>
                <div className={panelStyles.field}>
                  <label className={panelStyles.label} htmlFor="coach-gen-count">Amount</label>
                  <input
                    id="coach-gen-count"
                    type="number"
                    className={panelStyles.input}
                    value={genCount}
                    onChange={event => setGenCount(event.target.value)}
                  />
                </div>
                <div className={panelStyles.field}>
                  <label className={panelStyles.label} htmlFor="coach-gen-difficulty">Difficulty</label>
                  <select
                    id="coach-gen-difficulty"
                    className={panelStyles.select}
                    value={genDifficulty}
                    onChange={event => setGenDifficulty(event.target.value)}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div className={panelStyles.field}>
                  <label className={panelStyles.label} htmlFor="coach-gen-language">Language</label>
                  <select
                    id="coach-gen-language"
                    className={panelStyles.select}
                    value={genLanguage}
                    onChange={event => setGenLanguage(event.target.value)}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>German</option>
                    <option>French</option>
                    <option>Italian</option>
                    <option>Portuguese</option>
                    <option>Polish</option>
                    <option>Ukrainian</option>
                    <option>Russian</option>
                  </select>
                </div>
              </div>

              <div className={panelStyles.field}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className={panelStyles.label}>Topic</label>
                  <button
                    type="button"
                    className={panelStyles.addTopicBtn}
                    onClick={() => setShowAddTopicInput(prev => !prev)}
                  >
                    + Add Topic
                  </button>
                </div>

                {showAddTopicInput && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className={panelStyles.input}
                      placeholder="New topic name..."
                      value={newTopicInput}
                      onChange={e => setNewTopicInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTopic() }}
                      style={{ height: '32px', fontSize: '0.8rem', flex: 1 }}
                      autoFocus
                    />
                    <Button variant="primary" size="sm" onClick={handleAddTopic} disabled={!newTopicInput.trim()}>
                      Add
                    </Button>
                  </div>
                )}

                <div className={panelStyles.typeGrid} style={{ marginTop: '6px' }}>
                  {availableTopics.map((type, idx) => {
                    const isActive = genTypes.includes(type as QuestionType)
                    const isEditingThis = editingTopicIndex === idx

                    if (isEditingThis) {
                      return (
                        <div key={`edit-${idx}`} style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="text"
                            className={panelStyles.input}
                            value={editingTopicValue}
                            onChange={e => setEditingTopicValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveEditedTopic(idx) }}
                            style={{ height: '32px', width: '100px', fontSize: '0.78rem', padding: '0 6px' }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className={panelStyles.iconButton}
                            style={{ width: '28px', height: '28px', fontSize: '12px' }}
                            onClick={() => handleSaveEditedTopic(idx)}
                            title="Save topic"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            className={panelStyles.iconButtonDanger}
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => handleDeleteTopic(idx)}
                            title="Delete topic"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )
                    }

                    return (
                      <div key={type} className={panelStyles.topicPillWrapper}>
                        <button
                          type="button"
                          className={`${panelStyles.typeToggle} ${isActive ? panelStyles.typeToggleActive : ''}`}
                          onClick={() => toggleGenType(type as QuestionType)}
                          aria-pressed={isActive}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                        <button
                          type="button"
                          className={panelStyles.topicEditIcon}
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingTopicIndex(idx)
                            setEditingTopicValue(type)
                          }}
                          title="Edit topic"
                        >
                          <Edit2 size={10} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={panelStyles.generateRow}>
                <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className={cStyles.spinIcon} />
                      Generating...
                    </>
                  ) : (
                    'Generate & add to Set'
                  )}
                </Button>
              </div>
            </div>
          </section>

          <section className={panelStyles.testSetCard}>
            <div className={panelStyles.testSetHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditingSetName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      className={panelStyles.input}
                      value={setNameInput}
                      onChange={e => setSetNameInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (setNameInput.trim()) setSetName(setNameInput.trim())
                          setIsEditingSetName(false)
                        }
                      }}
                      style={{ height: '32px', fontSize: '1rem', fontWeight: 600, width: '220px' }}
                      autoFocus
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (setNameInput.trim()) setSetName(setNameInput.trim())
                        setIsEditingSetName(false)
                      }}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <h3 className={panelStyles.testSetTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    {setName}
                    <button
                      type="button"
                      onClick={() => {
                        setSetNameInput(setName)
                        setIsEditingSetName(true)
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'inline-flex', alignItems: 'center', padding: '2px 4px', borderRadius: '4px' }}
                      title="Edit set name"
                    >
                      <Edit2 size={14} />
                    </button>
                    · {(scenarios || []).length} Q&A
                  </h3>
                )}
              </div>
              <div className={panelStyles.testSetActions}>
                <Button variant="primary" size="sm" onClick={handleSaveSet} disabled={isSavingSet}>
                  {isSavingSet ? <Loader2 size={14} className={cStyles.spinIcon} /> : null}
                  Save Set
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAddManually}>
                  + Add manually
                </Button>
                <label className={panelStyles.importLabel}>
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    className={panelStyles.hiddenInput}
                    onChange={handleCsvImport}
                  />
                </label>
              </div>
            </div>

            <div className={panelStyles.questionList}>
              {(scenarios || []).length === 0 ? (
                <div className={panelStyles.emptyState}>
                  No questions in this set yet. Generate a batch or add your first Q&A manually.
                </div>
              ) : (
                (scenarios || []).map((question, index) => (
                  <div key={question.id} className={panelStyles.questionCard}>
                    {editingQuestionId === question.id ? (
                      <div className={panelStyles.editCard}>
                          <input
                            type="text"
                            value={editForm.questionText}
                            onChange={event =>
                              setEditForm(prev => ({ ...prev, questionText: event.target.value }))
                            }
                            className={panelStyles.input}
                          />
                          <textarea
                            className={panelStyles.textarea}
                            value={editForm.expectedAnswer || ''}
                            placeholder="Expected answer"
                            onChange={event =>
                              setEditForm(prev => ({ ...prev, expectedAnswer: event.target.value }))
                            }
                          />
                        <div className={panelStyles.editActions}>
                          <select
                            value={editForm.questionType}
                            onChange={event =>
                              setEditForm(prev => ({ ...prev, questionType: event.target.value as QuestionType }))
                            }
                            className={panelStyles.select}
                            aria-label="Topic"
                          >
                            {availableTopics.map(t => (
                              <option key={t} value={t}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                              </option>
                            ))}
                          </select>
                          <select
                            className={panelStyles.select}
                            defaultValue="Medium"
                            aria-label="Difficulty"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            <option value="expert">Expert</option>
                          </select>
                          <Button variant="primary" size="sm" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setEditingQuestionId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={panelStyles.questionRow}>
                        <div className={panelStyles.questionMain}>
                          <span className={panelStyles.questionIndex}>Q{index + 1}</span>
                          <span className={panelStyles.questionText}>{question.questionText}</span>
                        </div>
                        <div className={panelStyles.rowActions}>
                          <span className={panelStyles.questionMeta}>{question.questionType}</span>
                          <button
                            type="button"
                            className={panelStyles.iconButton}
                            onClick={() => {
                              setEditingQuestionId(question.id)
                              setEditForm(question)
                            }}
                            aria-label={`Edit question ${index + 1}`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={panelStyles.iconButtonDanger}
                            onClick={() => handleDelete(question.id)}
                            aria-label={`Delete question ${index + 1}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
            </>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={event => event.stopPropagation()}>
            <div className={kbStyles.modalHeader}>
              <h2 className={kbStyles.modalTitle}>Add Knowledge Source</h2>
              <button className={kbStyles.closeBtn} onClick={() => setShowAddModal(false)} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <div className={kbStyles.modalTabs}>
              {(['file', 'link', 'text'] as AddTab[]).map(tab => (
                <button
                  key={tab}
                  className={`${kbStyles.modalTab} ${addTab === tab ? kbStyles.modalTabActive : ''}`}
                  onClick={() => setAddTab(tab)}
                >
                  {tab === 'file' ? 'File' : tab === 'link' ? 'Link / URL' : 'Text'}
                </button>
              ))}
            </div>
            <div className={kbStyles.modalBody}>
              {addTab === 'file' && (
                <div style={{ padding: '2rem', border: '2px dashed #e2e8f0', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem' }}>
                  {modalFile ? (
                    <p style={{ color: '#10b981', fontWeight: 600 }}>Selected: {modalFile.name}</p>
                  ) : (
                    <>
                      <p className={panelStyles.modalCopy}>Drag and drop files here to include them as Coach generation sources.</p>
                      <label style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        or click to select
                        <input 
                          type="file" 
                          style={{ display: 'none' }} 
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setModalFile(e.target.files[0])
                            }
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>
              )}
              {addTab === 'link' && (
                <textarea
                  className={kbStyles.textarea}
                  placeholder="Paste links..."
                  value={linkText}
                  onChange={event => setLinkText(event.target.value)}
                />
              )}
              {addTab === 'text' && (
                <textarea
                  className={kbStyles.textarea}
                  placeholder="Paste text..."
                  value={customText}
                  onChange={event => setCustomText(event.target.value)}
                />
              )}
            </div>
            <div className={kbStyles.modalFooter}>
              <Button 
                variant="primary" 
                onClick={handleAddSource}
                disabled={
                  (addTab === 'file' && !modalFile) ||
                  (addTab === 'link' && !linkText.trim()) ||
                  (addTab === 'text' && !customText.trim())
                }
              >
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoachQASetPanel
