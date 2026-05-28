'use client'

import React, { useState, Suspense } from 'react'
import styles from '../../components/Settings/Settings.module.css'
import BillingTab from '../../components/Settings/Tabs/BillingTab'
import { Plus, Edit3, Trash2, X, ChevronDown, Layers } from 'lucide-react'
import { PresentationTemplate, MOCK_PRESENTATION_TEMPLATES } from '@/data/presentation-templates'
import { useTemplateStore } from '@/lib/templateStore'

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)',
  'linear-gradient(135deg,#a855f7 0%,#7c3aed 100%)',
  'linear-gradient(135deg,#f97316 0%,#ea580c 100%)',
  'linear-gradient(135deg,#10b981 0%,#059669 100%)',
  'linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)',
  'linear-gradient(135deg,#14b8a6 0%,#0d9488 100%)',
  'linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)',
  'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
  'linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)',
]

const CATEGORY_EMOJI: Record<string, string> = {
  HR: '👥',
  'Internal Communications': '📣',
  Marketing: '🚀',
  Sales: '💼',
  Support: '🎧',
  Compliance: '⚖️',
  'IT Security': '🔐',
  Research: '🔍',
  Recruiter: '🤝',
  Partnerships: '🤝',
  'Investor Relations': '📊',
}

const SOURCE_PROJECTS = [
  'Virtual PM Template',
  'HR Assistant Template',
  'Product Demo Template',
  'EU AI Act Compliance Training Template',
  'Customer Development Template',
  'Onboarding Template',
  'Internal Communication Template',
  'Corporate Trainings Template',
  'Virtual Recruiter Template',
  'Customer Support Template',
  'Anti-Bribery & Anti-Corruption Template',
]


// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseType {
  id: string
  name: string
  description: string
  metrics: string[]
}

interface ResultMetric {
  id: string
  name: string
  dataType: 'string' | 'bool' | 'integer' | 'double'
  parameter?: string
  aggregation: 'Last value' | 'Sum' | 'Max' | 'Use LLM'
  llmPrompt?: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const METRICS_CATALOG_ALL = [
  'Visited', 'Time Spent', 'Score', 'Q&A Completed',
  'Employee Hired', 'Deal Closed', 'Feedback Given',
  'Documents Signed', 'Assessment Passed', 'Custom Goal',
]

const INITIAL_COURSE_TYPES: CourseType[] = [
  { id: 'ct1', name: 'Onboarding', description: 'Standard new-hire orientation flow', metrics: ['Visited', 'Time Spent', 'Employee Hired'] },
  { id: 'ct2', name: 'Training', description: 'Skills and knowledge training program', metrics: ['Score', 'Time Spent', 'Assessment Passed'] },
  { id: 'ct3', name: 'Assessment', description: 'Knowledge and compliance assessment', metrics: ['Score', 'Q&A Completed', 'Documents Signed'] },
  { id: 'ct4', name: 'Interview', description: 'Structured candidate screening interview', metrics: ['Score', 'Q&A Completed', 'Employee Hired'] },
  { id: 'ct5', name: 'Presentation', description: 'General interactive presentation', metrics: ['Visited', 'Time Spent'] },
]

const INITIAL_METRICS: ResultMetric[] = [
  { id: 'm1', name: 'Visited', dataType: 'bool', aggregation: 'Last value', parameter: 'session.visited' },
  { id: 'm2', name: 'Time Spent', dataType: 'integer', aggregation: 'Sum', parameter: 'session.duration_seconds' },
  { id: 'm3', name: 'Score', dataType: 'double', aggregation: 'Last value', parameter: 'quiz.final_score' },
  { id: 'm4', name: 'Q&A Completed', dataType: 'bool', aggregation: 'Last value', parameter: 'quiz.all_answered' },
  { id: 'm5', name: 'Employee Hired', dataType: 'bool', aggregation: 'Use LLM', llmPrompt: 'Based on the session transcript #analytics_all_questions# and answers provided, determine if this candidate should be hired. Return true or false with a brief justification.' },
  { id: 'm6', name: 'Deal Closed', dataType: 'bool', aggregation: 'Use LLM', llmPrompt: 'Analyze the sales presentation session #analytics_all_questions# and determine whether the prospect signaled buying intent. Return a probability score 0-100.' },
  { id: 'm7', name: 'Assessment Passed', dataType: 'bool', aggregation: 'Last value', parameter: 'quiz.passed' },
  { id: 'm8', name: 'Documents Signed', dataType: 'bool', aggregation: 'Last value', parameter: 'compliance.docs_signed' },
]

const emptyMetric: Omit<ResultMetric, 'id'> = {
  name: '', dataType: 'bool', aggregation: 'Last value', parameter: '', llmPrompt: '',
}

const emptyCourseType: Omit<CourseType, 'id'> = {
  name: '', description: '', metrics: [],
}

// ── Settings page ─────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('billing')

  // ── Project Templates state ────────────────────────────────────────────────
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore()
  const [showPTModal, setShowPTModal] = useState(false)
  const [editingPT, setEditingPT] = useState<PresentationTemplate | null>(null)
  
  const [ptForm, setPTForm] = useState({
    name: '',
    description: '',
    selectedProjectId: '',
    status: 'Active' as 'Active' | 'Inactive',
    isOnHomepage: true,
    order: 1,
    productTypes: ['Sales'],
    projectType: 'Presentation + AI Avatar' as any,
    tags: ['Sales'],
    slideCount: 8,
    templateType: 'copy' as 'copy' | 'generate',
    badge: undefined as any
  })

  const openCreatePT = () => {
    setEditingPT(null)
    setPTForm({
      name: '',
      description: '',
      selectedProjectId: SOURCE_PROJECTS[0],
      status: 'Active',
      isOnHomepage: true,
      order: (templates.length > 0 ? Math.max(...templates.map(t => t.order || 0)) + 1 : 1),
      productTypes: ['Sales'],
      projectType: 'Presentation + AI Avatar',
      tags: ['Sales'],
      slideCount: 8,
      templateType: 'copy',
      badge: undefined
    })
    setShowPTModal(true)
  }

  const openEditPT = (pt: PresentationTemplate) => {
    setEditingPT(pt)
    setPTForm({
      name: pt.name,
      description: pt.description,
      selectedProjectId: pt.selectedProjectId || SOURCE_PROJECTS[0],
      status: (pt.accessType === 'system' || !pt.accessType || pt.accessType === 'active') ? 'Active' : 'Inactive',
      isOnHomepage: pt.isOnHomepage !== false,
      order: pt.order || 1,
      productTypes: pt.productTypes || ['Sales'],
      projectType: pt.projectType || 'Presentation + AI Avatar',
      tags: pt.tags || ['Sales'],
      slideCount: pt.slideCount || 8,
      templateType: pt.templateType || 'copy',
      badge: pt.badge
    })
    setShowPTModal(true)
  }

  const savePT = (e: React.FormEvent) => {
    e.preventDefault()
    const mappedTemplate = {
      name: ptForm.name,
      description: ptForm.description,
      selectedProjectId: ptForm.selectedProjectId,
      accessType: ptForm.status === 'Active' ? 'system' : 'inactive',
      isOnHomepage: ptForm.isOnHomepage,
      order: Number(ptForm.order),
      productTypes: ptForm.productTypes,
      projectType: ptForm.projectType,
      tags: ptForm.tags,
      slideCount: ptForm.slideCount,
      templateType: ptForm.templateType,
      badge: ptForm.badge
    }

    if (editingPT) {
      updateTemplate(editingPT.id, mappedTemplate)
    } else {
      addTemplate(mappedTemplate)
    }
    setShowPTModal(false)
  }

  const handleClearTemplates = () => {
    if (confirm('Reset templates to default?')) {
      useTemplateStore.getState().resetTemplates()
    }
  }

  // ── Course Types state ─────────────────────────────────────────────────────
  const [courseTypes, setCourseTypes] = useState<CourseType[]>(INITIAL_COURSE_TYPES)
  const [showCTModal, setShowCTModal] = useState(false)
  const [editingCT, setEditingCT] = useState<CourseType | null>(null)
  const [ctForm, setCTForm] = useState<Omit<CourseType, 'id'>>(emptyCourseType)
  const [ctMetricSearch, setCTMetricSearch] = useState('')

  const openCreateCT = () => { setEditingCT(null); setCTForm(emptyCourseType); setCTMetricSearch(''); setShowCTModal(true) }
  const openEditCT = (ct: CourseType) => { setEditingCT(ct); setCTForm({ name: ct.name, description: ct.description, metrics: [...ct.metrics] }); setCTMetricSearch(''); setShowCTModal(true) }
  const saveCT = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCT) {
      setCourseTypes(prev => prev.map(c => c.id === editingCT.id ? { ...c, ...ctForm } : c))
    } else {
      setCourseTypes(prev => [...prev, { ...ctForm, id: `ct${Date.now()}` }])
    }
    setShowCTModal(false)
  }
  const deleteCT = (id: string) => {
    if (!confirm('Delete this course type?')) return
    setCourseTypes(prev => prev.filter(c => c.id !== id))
  }

  // ── Results Builder state ──────────────────────────────────────────────────
  const [metrics, setMetrics] = useState<ResultMetric[]>(INITIAL_METRICS)
  const [showMetricModal, setShowMetricModal] = useState(false)
  const [editingMetric, setEditingMetric] = useState<ResultMetric | null>(null)
  const [metricForm, setMetricForm] = useState<Omit<ResultMetric, 'id'>>(emptyMetric)

  const openCreateMetric = () => { setEditingMetric(null); setMetricForm(emptyMetric); setShowMetricModal(true) }
  const openEditMetric = (m: ResultMetric) => { setEditingMetric(m); setMetricForm({ name: m.name, dataType: m.dataType, aggregation: m.aggregation, parameter: m.parameter || '', llmPrompt: m.llmPrompt || '' }); setShowMetricModal(true) }
  const saveMetric = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingMetric) {
      setMetrics(prev => prev.map(m => m.id === editingMetric.id ? { ...m, ...metricForm } : m))
    } else {
      setMetrics(prev => [...prev, { ...metricForm, id: `m${Date.now()}` }])
    }
    setShowMetricModal(false)
  }
  const deleteMetric = (id: string) => {
    if (!confirm('Delete this metric?')) return
    setMetrics(prev => prev.filter(m => m.id !== id))
  }

  const AGGREGATION_COLORS: Record<string, string> = {
    'Last value': '#475569', 'Sum': '#1d4ed8', 'Max': '#d97706', 'Use LLM': '#7c3aed',
  }
  const DATATYPE_COLORS: Record<string, string> = {
    bool: '#166534', integer: '#1d4ed8', double: '#ea580c', string: '#475569',
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.tabsContainer}>
        {[
          { key: 'billing', label: 'Billing' },
          { key: 'general', label: 'General' },
          { key: 'domain', label: 'Custom Domain' },
          { key: 'courseTypes', label: 'Course Types' },
          { key: 'resultsBuilder', label: 'Results Builder' },
          { key: 'projectTemplates', label: 'Project Templates' },
          { key: 'branding', label: 'Branding' },
        ].map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.active : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'general' && <div style={{ color: '#64748b' }}>General settings — coming in Sprint 2.</div>}
        {activeTab === 'branding' && <div style={{ color: '#64748b' }}>Branding settings — coming in Sprint 2.</div>}
        {activeTab === 'domain' && <div style={{ color: '#64748b' }}>Custom domain settings are managed in the Profile page → Onboarding Custom Domain section.</div>}
        {activeTab === 'billing' && (
          <Suspense fallback={<div className={styles.loadingState}>Loading billing data…</div>}>
            <BillingTab />
          </Suspense>
        )}

        {/* ── Course Types ── */}
        {activeTab === 'courseTypes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ marginBottom: '0.25rem' }}>Project / Course Types</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Define course categories and their associated result metrics tracked in analytics.</p>
              </div>
              <button
                onClick={openCreateCT}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <Plus size={15} /> Add Type
              </button>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Type Name', 'Description', 'Result Metrics', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseTypes.map(ct => (
                    <tr key={ct.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{ct.name}</td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: '#475569' }}>{ct.description}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {ct.metrics.map(m => (
                            <span key={m} style={{ background: 'rgba(99,102,241,.1)', color: '#6366f1', padding: '0.15rem 0.5rem', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 600 }}>{m}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditCT(ct)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.3rem', borderRadius: 6 }} aria-label={`Edit ${ct.name}`}><Edit3 size={15} /></button>
                          <button onClick={() => deleteCT(ct.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.3rem', borderRadius: 6 }} aria-label={`Delete ${ct.name}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Course Type Modal */}
            {showCTModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }} onClick={() => setShowCTModal(false)}>
                <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 520, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{editingCT ? 'Edit Course Type' : 'New Course Type'}</h2>
                    <button onClick={() => setShowCTModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} aria-label="Close"><X size={20} /></button>
                  </div>
                  <form onSubmit={saveCT} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ctName">Type Name *</label>
                      <input id="ctName" required type="text" value={ctForm.name} onChange={e => setCTForm({ ...ctForm, name: e.target.value })}
                        placeholder="e.g. Onboarding" style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ctDesc">Description</label>
                      <input id="ctDesc" type="text" value={ctForm.description} onChange={e => setCTForm({ ...ctForm, description: e.target.value })}
                        placeholder="Brief description of this course type" style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Result Metrics</label>
                      <input type="text" value={ctMetricSearch} onChange={e => setCTMetricSearch(e.target.value)}
                        placeholder="Search metrics to add…" style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                      {ctMetricSearch && (
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', maxHeight: 160, overflowY: 'auto' }}>
                          {METRICS_CATALOG_ALL.filter(m => !ctForm.metrics.includes(m) && m.toLowerCase().includes(ctMetricSearch.toLowerCase())).map(m => (
                            <button key={m} type="button"
                              onClick={() => { setCTForm({ ...ctForm, metrics: [...ctForm.metrics, m] }); setCTMetricSearch('') }}
                              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.85rem', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                            >+ {m}</button>
                          ))}
                        </div>
                      )}
                      {ctForm.metrics.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                          {ctForm.metrics.map(m => (
                            <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(99,102,241,.1)', color: '#6366f1', padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 600 }}>
                              {m}
                              <button type="button" onClick={() => setCTForm({ ...ctForm, metrics: ctForm.metrics.filter(x => x !== m) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: '0.9rem', lineHeight: 1 }} aria-label={`Remove ${m}`}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <button type="button" onClick={() => setShowCTModal(false)} style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                      <button type="submit" style={{ padding: '0.6rem 1.1rem', borderRadius: 8, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {editingCT ? 'Save Changes' : 'Create Type'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Results Builder ── */}
        {activeTab === 'resultsBuilder' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ marginBottom: '0.25rem' }}>Results Builder</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Define the metrics collected from presentation sessions. Use LLM aggregation for AI-powered insights.</p>
              </div>
              <button
                onClick={openCreateMetric}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <Plus size={15} /> New Metric
              </button>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Metric Name', 'Data Type', 'Parameter / Source', 'Aggregation', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{m.name}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ background: `${DATATYPE_COLORS[m.dataType]}18`, color: DATATYPE_COLORS[m.dataType], padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>{m.dataType}</span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.82rem', color: '#475569', fontFamily: 'monospace' }}>
                        {m.aggregation === 'Use LLM' ? (
                          <span style={{ color: '#7c3aed', fontFamily: 'inherit', fontSize: '0.78rem' }} title={m.llmPrompt}>🧠 LLM Prompt configured</span>
                        ) : (
                          m.parameter || '—'
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ background: `${AGGREGATION_COLORS[m.aggregation]}18`, color: AGGREGATION_COLORS[m.aggregation], padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700 }}>
                          {m.aggregation === 'Use LLM' ? '🧠 Use LLM' : m.aggregation}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditMetric(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.3rem', borderRadius: 6 }} aria-label={`Edit ${m.name}`}><Edit3 size={15} /></button>
                          <button onClick={() => deleteMetric(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.3rem', borderRadius: 6 }} aria-label={`Delete ${m.name}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Results Modal */}
            {showMetricModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }} onClick={() => setShowMetricModal(false)}>
                <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 560, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{editingMetric ? 'Edit Result Metric' : 'New Result Metric'}</h2>
                    <button onClick={() => setShowMetricModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} aria-label="Close"><X size={20} /></button>
                  </div>
                  <form onSubmit={saveMetric} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="mName">Metric Name *</label>
                      <input id="mName" required type="text" value={metricForm.name} onChange={e => setMetricForm({ ...metricForm, name: e.target.value })}
                        placeholder="e.g. Employee Hired, Score, Time Spent" style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="mDataType">Data Type</label>
                        <select id="mDataType" value={metricForm.dataType} onChange={e => setMetricForm({ ...metricForm, dataType: e.target.value as ResultMetric['dataType'] })}
                          style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                          <option value="bool">Boolean (true/false)</option>
                          <option value="integer">Integer (whole number)</option>
                          <option value="double">Double (decimal)</option>
                          <option value="string">String (text)</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="mAggregation">Aggregation Method</label>
                        <select id="mAggregation" value={metricForm.aggregation} onChange={e => setMetricForm({ ...metricForm, aggregation: e.target.value as ResultMetric['aggregation'] })}
                          style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                          <option value="Last value">Last Value</option>
                          <option value="Sum">Sum</option>
                          <option value="Max">Max</option>
                          <option value="Use LLM">Use LLM (AI-powered)</option>
                        </select>
                      </div>
                    </div>
                    {metricForm.aggregation !== 'Use LLM' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="mParam">Data Parameter / Source</label>
                        <input id="mParam" type="text" value={metricForm.parameter || ''} onChange={e => setMetricForm({ ...metricForm, parameter: e.target.value })}
                          placeholder="e.g. session.duration_seconds or quiz.final_score" style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'monospace' }} />
                      </div>
                    )}
                    {metricForm.aggregation === 'Use LLM' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7c3aed' }} htmlFor="mLlm">
                          🧠 LLM Prompt
                          <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: '0.5rem', fontSize: '0.75rem' }}>Use placeholders like #analytics_all_questions# or #session_transcript#</span>
                        </label>
                        <textarea id="mLlm" value={metricForm.llmPrompt || ''} onChange={e => setMetricForm({ ...metricForm, llmPrompt: e.target.value })}
                          rows={5} placeholder={'Based on the session transcript #analytics_all_questions# and answers provided by the listener, determine whether the goal was achieved. Return true or false with a brief explanation.'}
                          style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #c4b5fd', fontSize: '0.88rem', resize: 'vertical', background: '#faf5ff', fontFamily: 'inherit', lineHeight: 1.5 }} />
                        <div style={{ fontSize: '0.75rem', color: '#7c3aed', background: '#faf5ff', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #e9d5ff' }}>
                          <strong>Available placeholders:</strong> #analytics_all_questions# · #session_transcript# · #listener_profile# · #presentation_title#
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <button type="button" onClick={() => setShowMetricModal(false)} style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                      <button type="submit" style={{ padding: '0.6rem 1.1rem', borderRadius: 8, background: '#7c3aed', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {editingMetric ? 'Save Metric' : 'Create Metric'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Project Templates ── */}
        {activeTab === 'projectTemplates' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 className={styles.sectionTitle} style={{ marginBottom: '0.25rem' }}>Project Templates</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Select existing projects to use as templates</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleClearTemplates}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Reset to Mock
                </button>
                <button
                  type="button"
                  onClick={openCreatePT}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  <Plus size={15} /> Add Template
                </button>
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Thumbnail', 'Name', 'Source Project', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', borderBottom: '1px solid #e2e8f0', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {templates.map((pt, idx) => {
                    const gradient = COVER_GRADIENTS[Number(pt.id) - 1] ?? COVER_GRADIENTS[idx % COVER_GRADIENTS.length];
                    const emoji = CATEGORY_EMOJI[pt.productTypes[0]] ?? '📋';
                    const isActive = pt.accessType === 'system' || !pt.accessType || pt.accessType === 'active';
                    return (
                      <tr key={pt.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ width: 64, height: 40, background: gradient, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                            {emoji}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{pt.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pt.description}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.88rem', color: '#334155' }}>
                          {pt.selectedProjectId || 'Virtual PM Template'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{
                            background: isActive ? '#dcfce7' : '#f1f5f9',
                            color: isActive ? '#15803d' : '#475569',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 9999,
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => openEditPT(pt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.3rem', borderRadius: 6 }} aria-label={`Edit ${pt.name}`}>
                              <Layers size={16} />
                            </button>
                            <button type="button" onClick={() => { if (confirm('Delete this template?')) deleteTemplate(pt.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.3rem', borderRadius: 6 }} aria-label={`Delete ${pt.name}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Template Edit/Create Modal */}
            {showPTModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }} onClick={() => setShowPTModal(false)}>
                <div style={{ background: 'white', borderRadius: 16, padding: '2rem', maxWidth: 520, width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,.15)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{editingPT ? 'Edit Project Template' : 'New Project Template'}</h2>
                    <button type="button" onClick={() => setShowPTModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} aria-label="Close"><X size={20} /></button>
                  </div>
                  
                  <form onSubmit={savePT} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ptName">Template Name *</label>
                      <input id="ptName" required type="text" value={ptForm.name} onChange={e => setPTForm({ ...ptForm, name: e.target.value })}
                        placeholder="e.g. B2B Sales Prospecting" style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ptDesc">Description</label>
                      <textarea id="ptDesc" rows={3} value={ptForm.description} onChange={e => setPTForm({ ...ptForm, description: e.target.value })}
                        placeholder="Description of the template..." style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ptSource">Source Project *</label>
                      <select id="ptSource" value={ptForm.selectedProjectId} onChange={e => setPTForm({ ...ptForm, selectedProjectId: e.target.value })}
                        style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                        {SOURCE_PROJECTS.map(proj => (
                          <option key={proj} value={proj}>{proj}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ptStatus">Status</label>
                        <select id="ptStatus" value={ptForm.status} onChange={e => setPTForm({ ...ptForm, status: e.target.value as any })}
                          style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }} htmlFor="ptOrder">Home Page Order</label>
                        <input id="ptOrder" type="number" min={1} value={ptForm.order} onChange={e => setPTForm({ ...ptForm, order: Number(e.target.value) })}
                          style={{ padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <input id="ptOnHome" type="checkbox" checked={ptForm.isOnHomepage} onChange={e => setPTForm({ ...ptForm, isOnHomepage: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <label htmlFor="ptOnHome" style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>Show on Home Page</label>
                    </div>

                    {/* PowerPoint Animation Warning Tip */}
                    <div style={{ display: 'flex', gap: '0.6rem', background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.85rem 1rem', borderRadius: 8 }}>
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>⚠️</span>
                      <span style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: 1.4, fontWeight: 500 }}>
                        PowerPoint files with animations are not currently supported.
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                      <button type="button" onClick={() => setShowPTModal(false)} style={{ padding: '0.6rem 1.1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                      <button type="submit" style={{ padding: '0.6rem 1.1rem', borderRadius: 8, background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {editingPT ? 'Save Changes' : 'Create Template'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
