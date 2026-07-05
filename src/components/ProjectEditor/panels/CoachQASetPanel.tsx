'use client'

import React, { useState } from 'react'
import { Link2, FileText, Plus, X, Edit2 } from 'lucide-react'
import { QuestionType, BuyerScenario } from '@/types/coach'
import styles from './KnowledgeBasePanel.module.css'
import cStyles from './CoachPanels.module.css'
import { useCoachStore } from '@/lib/useCoachStore'
import { updateCoachScenarios } from '@/app/actions/coachActions'

type KbSourceType = 'file' | 'link' | 'text' | 'qa'

interface KbEntry {
  id: string
  name: string
  created: string
  type: 'T' | 'file' | 'link'
  language: string
}

export interface QuestionEntry {
  id: string
  question: string
  answer: string
  difficulty: string
  type: QuestionType
}

const MOCK_SOURCES: KbEntry[] = [
  { id: '1', name: 'Product_Documentation.pdf', created: 'Jun 17, 2026', type: 'file', language: 'English' },
]

const MOCK_QUESTIONS: QuestionEntry[] = [
  { id: '1', question: 'What are the main benefits of Pitch Avatar?', answer: 'It saves time and engages the audience.', difficulty: 'Medium', type: 'product' },
  { id: '2', question: 'Can I upload a PDF?', answer: 'Yes, up to 100MB.', difficulty: 'Easy', type: 'technical' },
]

interface CoachQASetPanelProps {
  projectId?: string
}

type AddTab = 'file' | 'link' | 'text'

const CoachQASetPanel: React.FC<CoachQASetPanelProps> = ({ projectId }) => {
  const { scenarios, setScenarios, traineeRole } = useCoachStore()
  const [sources, setSources] = useState<KbEntry[]>(MOCK_SOURCES)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Question editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<BuyerScenario>>({ questionText: '', expectedAnswer: '', questionType: 'product' })

  // Generation Settings
  const [genCount, setGenCount] = useState('5')
  const [genDifficulty, setGenDifficulty] = useState('Medium')
  const [genTypes, setGenTypes] = useState<QuestionType[]>(['price', 'objection', 'technical'])

  const TypeIcon = ({ type }: { type: KbEntry['type'] }) => {
    if (type === 'T') return <span className={styles.typeIconT}>T</span>
    if (type === 'link') return <Link2 size={14} className={styles.typeIconLink} />
    return <FileText size={14} className={styles.typeIconFile} />
  }

  const toggleGenType = (type: QuestionType) => {
    setGenTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleGenerate = async () => {
    if (!projectId) return;
    
    // Call real API
    try {
      const res = await fetch('/api/coach/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          maxQuestions: parseInt(genCount) || 5,
          questionTypes: genTypes,
          roleTemplate: traineeRole || 'buyer'
        })
      });
      if (res.ok) {
        const data = await res.json();
        // data.scenarios is BuyerScenario[]
        const newScenarios = data.scenarios.map((s: any) => ({
          ...s,
          id: s.id || `gen-${Date.now()}-${Math.random()}`,
        }));
        const updated = [...scenarios, ...newScenarios];
        setScenarios(updated);
        await updateCoachScenarios(projectId, updated);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setSources(prev => [...prev, { id: Date.now().toString(), name: 'Dropped_File.pdf', created: new Date().toLocaleDateString(), type: 'file', language: 'English' }])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleAddManually = () => {
    const newId = Date.now().toString()
    const newScen: BuyerScenario = { id: newId, questionText: 'New Question?', expectedAnswer: '', questionType: 'product', roleTemplate: traineeRole, evaluationCriteria: [] }
    const updated = [newScen, ...scenarios];
    setScenarios(updated)
    setEditingQuestionId(newId)
    setEditForm({ questionText: 'New Question?', expectedAnswer: '', questionType: 'product' })
    if (projectId) updateCoachScenarios(projectId, updated)
  }

  const saveEdit = () => {
    const updated = scenarios.map(q => q.id === editingQuestionId ? { ...q, ...editForm } as BuyerScenario : q);
    setScenarios(updated)
    setEditingQuestionId(null)
    if (projectId) updateCoachScenarios(projectId, updated)
  }

  const handleDelete = (id: string) => {
    const updated = scenarios.filter(q => q.id !== id);
    setScenarios(updated);
    if (projectId) updateCoachScenarios(projectId, updated)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.headerTop}>
          <div>
            <h2 className={styles.panelTitle}>Coach Q&A Set</h2>
            <p className={styles.panelSubtitle}>Define sources and generate standard questions for the Coach Mode test set.</p>
          </div>
        </div>
      </div>

      <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Top Row: Sources & Generation Settings */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Sources Section */}
          <div style={{ flex: 1 }}>
            <h3 className={cStyles.sectionTitle}>Content Source</h3>
            
            <div 
              className={`${cStyles.dropZone} ${isDragging ? cStyles.dropZoneDragging : ''}`}
              onClick={() => setShowAddModal(true)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Plus size={24} className={`${cStyles.dropIcon} ${isDragging ? cStyles.dropIconDragging : ''}`} />
              <div className={`${cStyles.dropText} ${isDragging ? cStyles.dropTextDragging : ''}`}>
                {isDragging ? 'Drop file here' : 'Drag & drop or click to add'}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {sources.map(entry => (
                <div key={entry.id} className={cStyles.sourcePill}>
                  <TypeIcon type={entry.type} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Settings Section */}
          <div style={{ flex: 1 }}>
            <h3 className={cStyles.sectionTitle}>Generation Parameters</h3>
            
            <div className={cStyles.settingsRow}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label} style={{ fontSize: '12px' }}>Amount</label>
                <input type="number" className={styles.select} value={genCount} onChange={e => setGenCount(e.target.value)} />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label} style={{ fontSize: '12px' }}>Difficulty</label>
                <select className={styles.select} value={genDifficulty} onChange={e => setGenDifficulty(e.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className={styles.field} style={{ marginBottom: '16px' }}>
              <label className={styles.label} style={{ fontSize: '12px' }}>Question Types</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['price', 'objection', 'technical', 'discovery', 'product', 'roi'] as QuestionType[]).map(type => (
                  <label key={type} className={cStyles.checkboxPill}>
                    <input type="checkbox" checked={genTypes.includes(type)} onChange={() => toggleGenType(type)} /> 
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className={`${styles.primaryBtn} ${cStyles.generateBtn}`} onClick={handleGenerate}>
                Generate & add to Set
              </button>
            </div>
          </div>
        </div>

        {/* Test Set Section */}
        <div className={cStyles.testSetSection}>
          <div className={cStyles.testSetHeader}>
            <h3 className={cStyles.testSetTitle}>Test Set · {scenarios.length} Q&A</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAddManually} className={cStyles.textBtn}>+ Add manually</button>
              <button className={cStyles.textBtn}>↑ Import CSV</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scenarios.map((q, i) => (
              <div key={q.id} className={cStyles.qCard}>
                {editingQuestionId === q.id ? (
                  <div className={cStyles.qCardEdit}>
                    <input 
                      type="text" 
                      value={editForm.questionText} 
                      onChange={e => setEditForm(prev => ({ ...prev, questionText: e.target.value }))}
                      className={cStyles.qInput}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select value={editForm.questionType} onChange={e => setEditForm(prev => ({ ...prev, questionType: e.target.value as QuestionType }))} className={cStyles.qSelect}>
                        <option value="product">Product</option>
                        <option value="price">Price</option>
                        <option value="objection">Objection</option>
                        <option value="technical">Technical</option>
                        <option value="discovery">Discovery</option>
                        <option value="roi">ROI</option>
                      </select>
                      <button onClick={saveEdit} className={cStyles.saveBtn}>Save</button>
                      <button onClick={() => setEditingQuestionId(null)} className={cStyles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={cStyles.qText}>
                      <span className={cStyles.qPrefix}>Q{i+1}</span>
                      {q.questionText}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={cStyles.qMeta}>{q.questionType}</span>
                      <Edit2 size={14} className={cStyles.iconBtn} onClick={() => { setEditingQuestionId(q.id); setEditForm(q); }} />
                      <X size={14} className={cStyles.iconBtnDanger} onClick={() => handleDelete(q.id)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Knowledge Source</h2>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalTabs}>
              {(['file', 'link', 'text'] as AddTab[]).map(tab => (
                <button
                  key={tab}
                  className={`${styles.modalTab} ${addTab === tab ? styles.modalTabActive : ''}`}
                  onClick={() => setAddTab(tab)}
                >
                  {tab === 'file' ? 'File' : tab === 'link' ? 'Link / URL' : 'Text'}
                </button>
              ))}
            </div>
            <div className={styles.modalBody}>
              {/* Minimal mock content for modal */}
              {addTab === 'file' && <p>Drag and drop files here...</p>}
              {addTab === 'link' && <textarea className={styles.textarea} placeholder="Paste links..." value={linkText} onChange={e => setLinkText(e.target.value)} />}
              {addTab === 'text' && <textarea className={styles.textarea} placeholder="Paste text..." value={customText} onChange={e => setCustomText(e.target.value)} />}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={() => setShowAddModal(false)}>Add</button>
              <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoachQASetPanel
