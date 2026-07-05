'use client'

import React, { useState } from 'react'
import { Trash2, Settings2, Link2, FileText, Plus, Search, X, Edit2 } from 'lucide-react'
import styles from './KnowledgeBasePanel.module.css'

type KbSourceType = 'file' | 'link' | 'text' | 'qa'

interface KbEntry {
  id: string
  name: string
  created: string
  type: 'T' | 'file' | 'link'
  language: string
}

interface QuestionEntry {
  id: string
  question: string
  answer: string
  difficulty: string
  type: string
}

const MOCK_SOURCES: KbEntry[] = [
  { id: '1', name: 'Product_Documentation.pdf', created: 'Jun 17, 2026', type: 'file', language: 'English' },
]

const MOCK_QUESTIONS: QuestionEntry[] = [
  { id: '1', question: 'What are the main benefits of Pitch Avatar?', answer: 'It saves time and engages the audience.', difficulty: 'Medium', type: 'Open-ended' },
  { id: '2', question: 'Can I upload a PDF?', answer: 'Yes, up to 100MB.', difficulty: 'Easy', type: 'True/False' },
]

interface CoachQASetPanelProps {
  projectId?: string
}

type AddTab = 'file' | 'link' | 'text'

const CoachQASetPanel: React.FC<CoachQASetPanelProps> = () => {
  const [sources, setSources] = useState<KbEntry[]>(MOCK_SOURCES)
  const [questions, setQuestions] = useState<QuestionEntry[]>(MOCK_QUESTIONS)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Question editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ question: '', answer: '', difficulty: 'Medium', type: 'Mixed' })


  // Generation Settings
  const [genCount, setGenCount] = useState('5')
  const [genDifficulty, setGenDifficulty] = useState('Medium')
  const [genType, setGenType] = useState('Mixed')

  const TypeIcon = ({ type }: { type: KbEntry['type'] }) => {
    if (type === 'T') return <span className={styles.typeIconT}>T</span>
    if (type === 'link') return <Link2 size={14} className={styles.typeIconLink} />
    return <FileText size={14} className={styles.typeIconFile} />
  }

  const handleGenerate = () => {
    // Mock generate questions
    const newQuestions = Array.from({ length: parseInt(genCount) || 1 }).map((_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      question: `Generated question ${i+1} about ${genType}?`,
      answer: `Generated answer ${i+1}`,
      difficulty: genDifficulty,
      type: genType
    }))
    setQuestions(prev => [...prev, ...newQuestions])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Mock adding a file
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
    setQuestions(prev => [{ id: newId, question: 'New Question?', answer: '', difficulty: 'Medium', type: 'Open-ended' }, ...prev])
    setEditingQuestionId(newId)
    setEditForm({ question: 'New Question?', answer: '', difficulty: 'Medium', type: 'Open-ended' })
  }

  const saveEdit = () => {
    setQuestions(prev => prev.map(q => q.id === editingQuestionId ? { ...q, ...editForm } : q))
    setEditingQuestionId(null)
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
          <div className="sources-section" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>ДЖЕРЕЛО КОНТЕНТУ</h3>
            
            <div 
              style={{ 
                border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`, 
                borderRadius: '8px', 
                padding: '32px', 
                textAlign: 'center', 
                cursor: 'pointer', 
                background: isDragging ? '#eff6ff' : '#f9fafb',
                transition: 'all 0.2s'
              }}
              onClick={() => setShowAddModal(true)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Plus size={24} style={{ color: isDragging ? '#3b82f6' : '#9ca3af', margin: '0 auto 8px auto' }} />
              <div style={{ color: isDragging ? '#2563eb' : '#6b7280', fontSize: '14px' }}>
                {isDragging ? 'Drop file here' : 'Drag & drop or click to add'}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {sources.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: '#1e3a8a' }}>
                  <TypeIcon type={entry.type} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generation Settings Section */}
          <div className="generation-section" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>ПАРАМЕТРИ ГЕНЕРАЦІЇ</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label} style={{ fontSize: '12px' }}>Кількість</label>
                <input type="number" className={styles.select} value={genCount} onChange={e => setGenCount(e.target.value)} />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label} style={{ fontSize: '12px' }}>Складність</label>
                <select className={styles.select} value={genDifficulty} onChange={e => setGenDifficulty(e.target.value)}>
                  <option>Легка</option>
                  <option>Середня</option>
                  <option>Складна</option>
                </select>
              </div>
            </div>

            <div className={styles.field} style={{ marginBottom: '16px' }}>
              <label className={styles.label} style={{ fontSize: '12px' }}>Тип питань</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                  <input type="checkbox" defaultChecked /> Pricing
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                  <input type="checkbox" defaultChecked /> Objection
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                  <input type="checkbox" defaultChecked /> Technical
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                  <input type="checkbox" /> Discovery
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className={styles.primaryBtn} onClick={handleGenerate} style={{ background: '#d97706', border: 'none' }}>
                Generate & add to Set
              </button>
            </div>
          </div>
        </div>

        {/* Test Set Section */}
        <div className="testset-section" style={{ border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', background: '#fffbeb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#92400e' }}>Test Set · {questions.length} Q&A</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAddManually} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>+ Add manually</button>
              <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer' }}>↑ Import CSV</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                {editingQuestionId === q.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={editForm.question} 
                      onChange={e => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select value={editForm.difficulty} onChange={e => setEditForm(prev => ({ ...prev, difficulty: e.target.value }))} style={{ padding: '4px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                        <option>Легка</option><option>Medium</option><option>Складна</option>
                      </select>
                      <button onClick={saveEdit} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingQuestionId(null)} style={{ background: 'transparent', color: '#6b7280', border: 'none', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#374151' }}>
                      <span style={{ color: '#d97706', fontWeight: 500, marginRight: '8px' }}>Q{i+1}</span>
                      {q.question}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{q.type} · {q.difficulty}</span>
                      <Edit2 size={14} style={{ color: '#9ca3af', cursor: 'pointer' }} onClick={() => { setEditingQuestionId(q.id); setEditForm(q); }} />
                      <X size={14} style={{ color: '#d1d5db', cursor: 'pointer' }} onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))} />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div style={{ fontSize: '12px', color: '#9ca3af', padding: '4px 12px' }}>... ще 8 Q&A</div>
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
