'use client'

import React, { useState } from 'react'
import { Link2, FileText, Plus, X, Edit2, Loader2 } from 'lucide-react'
import { QuestionType, BuyerScenario, RoleTemplate } from '@/types/coach'
import { KnowledgeItem } from '@/types'
import { MOCK_KNOWLEDGE } from '@/services/mock-data'
import styles from './KnowledgeBasePanel.module.css'
import cStyles from './CoachPanels.module.css'
import { useCoachStore } from '@/lib/useCoachStore'
import { updateCoachScenarios } from '@/app/actions/coachActions'
import Toast from '@/components/ui/Toast'
import Button from '@/components/ui/Button'

export interface QuestionEntry {
  id: string
  question: string
  answer: string
  difficulty: string
  type: QuestionType
}

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
  const [sources, setSources] = useState<KnowledgeItem[]>(MOCK_KNOWLEDGE)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Question editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<BuyerScenario>>({ questionText: '', expectedAnswer: '', questionType: 'product' })

  // Generation Settings
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null)
  const [genCount, setGenCount] = useState('5')
  const [genDifficulty, setGenDifficulty] = useState('Medium')
  const [genTypes, setGenTypes] = useState<QuestionType[]>(['price', 'objection', 'technical'])

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'Text / Web') return <span className={styles.typeIconT}>T</span>
    if (type === 'link') return <Link2 size={14} className={styles.typeIconLink} />
    return <FileText size={14} className={styles.typeIconFile} />
  }

  const toggleGenType = (type: QuestionType) => {
    setGenTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleGenerate = async () => {
    if (!projectId) return;
    
    setIsGenerating(true);
    setToast(null);

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
        // data.questions is BuyerScenario[]
        const newScenarios = (data.questions || []).map((s: any) => ({
          ...s,
          id: s.id || `gen-${Date.now()}-${Math.random()}`,
        }));
        const updated = [...scenarios, ...newScenarios];
        setScenarios(updated);
        await updateCoachScenarios(projectId, updated);
        setToast({ message: 'Questions generated successfully!', type: 'success' });
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to generate questions. Please try again.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setSources(prev => [...prev, { id: Date.now(), name: 'Dropped_File.pdf', date: new Date().toLocaleDateString(), type: 'PDF', size: '2MB', status: 'indexed' }])
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
    const newScen: BuyerScenario = { id: newId, questionText: 'New Question?', expectedAnswer: '', questionType: 'product', roleTemplate: traineeRole as RoleTemplate, evaluationCriteria: [] }
    const updated = [newScen, ...scenarios];
    setScenarios(updated)
    setEditingQuestionId(newId)
    setEditForm({ questionText: 'New Question?', expectedAnswer: '', questionType: 'product' })
    if (projectId) updateCoachScenarios(projectId, updated)
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const newScenarios: BuyerScenario[] = [];
      
      // Skip header row if it exists (e.g. Question, Answer, Type)
      const startIdx = lines[0].toLowerCase().includes('question') ? 1 : 0;
      
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 1) {
          const qText = parts[0];
          const ansText = parts[1] || '';
          const qType = (parts[2]?.toLowerCase() || 'product') as QuestionType;
          
          newScenarios.push({
            id: `csv-${Date.now()}-${i}`,
            questionText: qText,
            expectedAnswer: ansText,
            questionType: qType,
            roleTemplate: traineeRole as RoleTemplate || 'buyer',
            evaluationCriteria: []
          });
        }
      }

      if (newScenarios.length > 0) {
        const updated = [...newScenarios, ...scenarios];
        setScenarios(updated);
        if (projectId) await updateCoachScenarios(projectId, updated);
        setToast({ message: `Imported ${newScenarios.length} questions from CSV!`, type: 'success' });
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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
              className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
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
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '13px', color: '#334155' }}>
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
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {(['price', 'objection', 'technical', 'discovery', 'product', 'roi'] as QuestionType[]).map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#334155' }}>
                    <input type="checkbox" checked={genTypes.includes(type)} onChange={() => toggleGenType(type)} style={{ cursor: 'pointer' }} /> 
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="primary"
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ opacity: isGenerating ? 0.7 : 1 }}
              >
                {isGenerating ? <><Loader2 size={16} className={cStyles.spinIcon} /> Generating...</> : 'Generate & add to Set'}
              </Button>
            </div>
          </div>
        </div>

        {/* Test Set Section */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Test Set · {scenarios.length} Q&A</h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button variant="ghost" size="sm" onClick={handleAddManually}>+ Add manually</Button>
              <label style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 500 }}>↑ Import CSV</span>
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
              </label>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scenarios.map((q, i) => (
              <div key={q.id} className="list-item-card">
                {editingQuestionId === q.id ? (
                  <div className={cStyles.qCardEdit} style={{ width: '100%' }}>
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
                      <Button variant="primary" size="sm" onClick={saveEdit}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingQuestionId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#d97706', minWidth: '24px' }}>Q{i+1}</span>
                      <span style={{ fontSize: '14px', color: '#1e293b' }}>{q.questionText}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.questionType}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Button variant="ghost" size="sm" style={{ padding: '4px', minWidth: 'auto', height: 'auto', color: '#64748b' }} onClick={() => { setEditingQuestionId(q.id); setEditForm(q); }}>
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" style={{ padding: '4px', minWidth: 'auto', height: 'auto', color: '#ef4444' }} onClick={() => handleDelete(q.id)}>
                          <X size={14} />
                        </Button>
                      </div>
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
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
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
              <Button variant="primary" onClick={() => setShowAddModal(false)}>Add</Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoachQASetPanel
