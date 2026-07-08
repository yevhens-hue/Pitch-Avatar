'use client'

import React, { useState } from 'react'
import { Link2, FileText, Plus, X, Edit2, Loader2 } from 'lucide-react'
import { QuestionType, BuyerScenario, RoleTemplate } from '@/types/coach'
import { KnowledgeItem } from '@/types'
import { getProjectKnowledge } from '@/app/actions/knowledge'
import kbStyles from './KnowledgeBasePanel.module.css'
import cStyles from './CoachPanels.module.css'
import panelStyles from './CoachQASetPanel.module.css'
import { useCoachStore } from '@/lib/useCoachStore'
import { updateCoachScenarios } from '@/app/actions/coachActions'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/ui/Toast'
import Button from '@/components/ui/Button'

interface CoachQASetPanelProps {
  projectId?: string
}

type AddTab = 'file' | 'link' | 'text'

const QUESTION_TYPE_OPTIONS: QuestionType[] = ['price', 'objection', 'technical', 'discovery', 'product', 'roi']

const CoachQASetPanel: React.FC<CoachQASetPanelProps> = ({ projectId }) => {
  const { scenarios, setScenarios, traineeRole } = useCoachStore()
  const [sources, setSources] = useState<KnowledgeItem[]>([])
  const [isLoadingSources, setIsLoadingSources] = useState(false)

  React.useEffect(() => {
    if (projectId) {
      setIsLoadingSources(true)
      getProjectKnowledge(projectId)
        .then(data => setSources(data))
        .finally(() => setIsLoadingSources(false))
    }
  }, [projectId])

  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
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
  const [genTypes, setGenTypes] = useState<QuestionType[]>(['price', 'objection', 'technical'])

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'Text / Web') return <span className={kbStyles.typeIconT}>T</span>
    if (type === 'link') return <Link2 size={14} className={kbStyles.typeIconLink} />
    return <FileText size={14} className={kbStyles.typeIconFile} />
  }

  const toggleGenType = (type: QuestionType) => {
    setGenTypes(prev => (prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]))
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

  const handleAddManually = () => {
    const newId = Date.now().toString()
    const newScenario: BuyerScenario = {
      id: newId,
      questionText: 'New Question?',
      expectedAnswer: '',
      questionType: 'product',
      roleTemplate: (traineeRole as RoleTemplate) || 'buyer',
      evaluationCriteria: [],
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

      <div className={kbStyles.panelHeader}>
        <div className={kbStyles.headerTop}>
          <div>
            <h2 className={kbStyles.panelTitle}>Coach Q&A Set</h2>
            <p className={kbStyles.panelSubtitle}>
              Define sources and generate standard questions for the Coach Mode test set.
            </p>
          </div>
        </div>
      </div>

      <div className={kbStyles.panelBody}>
        <div className={panelStyles.content}>
          <div className={panelStyles.grid}>
            <section className={panelStyles.section}>
              <h3 className={panelStyles.sectionHeading}>Content Source</h3>
              <div
                className={`upload-zone ${isDragging ? 'upload-zone-active' : ''} ${panelStyles.dropArea}`}
                onClick={() => setShowAddModal(true)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Plus size={24} className={`${cStyles.dropIcon} ${isDragging ? cStyles.dropIconDragging : ''}`} />
                <div className={`${cStyles.dropText} ${isDragging ? cStyles.dropTextDragging : ''}`}>
                  {isDragging ? 'Drop file here' : 'Drag & drop or click to add'}
                </div>
                <p className={panelStyles.dropHint}>
                  Add files, links, or text snippets that the coach should use when generating questions.
                </p>
              </div>

              {sources.length > 0 && (
                <div className={panelStyles.sourceTags}>
                  {sources.map(entry => (
                    <div key={entry.id} className={panelStyles.sourceTag}>
                      <TypeIcon type={entry.type} />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={panelStyles.section}>
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
                    </select>
                  </div>
                </div>

                <div className={panelStyles.field}>
                  <label className={panelStyles.label}>Question Types</label>
                  <div className={panelStyles.typeGrid}>
                    {QUESTION_TYPE_OPTIONS.map(type => {
                      const isActive = genTypes.includes(type)
                      return (
                        <button
                          key={type}
                          type="button"
                          className={`${panelStyles.typeToggle} ${isActive ? panelStyles.typeToggleActive : ''}`}
                          onClick={() => toggleGenType(type)}
                          aria-pressed={isActive}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
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
          </div>

          <section className={`card ${panelStyles.testSetCard}`}>
            <div className={panelStyles.testSetHeader}>
              <h3 className={panelStyles.testSetTitle}>Test Set · {scenarios.length} Q&A</h3>
              <div className={panelStyles.testSetActions}>
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
              {scenarios.length === 0 ? (
                <div className={panelStyles.emptyState}>
                  No questions yet. Generate a batch or add your first Q&A manually.
                </div>
              ) : (
                scenarios.map((question, index) => (
                  <div key={question.id} className="list-item-card">
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
                          >
                            <option value="product">Product</option>
                            <option value="price">Price</option>
                            <option value="objection">Objection</option>
                            <option value="technical">Technical</option>
                            <option value="discovery">Discovery</option>
                            <option value="roi">ROI</option>
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
                <p className={panelStyles.modalCopy}>Drag and drop files here to include them as Coach generation sources.</p>
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
              <Button variant="primary" onClick={() => setShowAddModal(false)}>
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
