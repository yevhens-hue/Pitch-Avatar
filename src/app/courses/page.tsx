'use client'

import React, { useState } from 'react'
import styles from './Courses.module.css'
import {
  GraduationCap, Plus, Search, Trash2, Edit3, X, ChevronUp,
  ChevronDown, BookOpen, BarChart2, List,
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseStep {
  id: string
  order: number
  contentTitle: string
  delay: number
  delayUnit: 'hours' | 'days'
  transitionRule: 'immediate' | 'on_complete' | 'on_schedule'
}

interface Course {
  id: string
  name: string
  description: string
  type: 'Interview' | 'Onboarding' | 'Training' | 'Assessment' | 'Presentation'
  steps: CourseStep[]
  metrics: string[]
  autoGenerateSlide: boolean
  createdAt: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const METRICS_CATALOG = [
  'Visited', 'Time Spent', 'Score', 'Q&A Completed',
  'Employee Hired', 'Deal Closed', 'Feedback Given',
  'Documents Signed', 'Assessment Passed', 'Custom Goal',
]

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1', name: 'HR Onboarding 2024',
    description: 'Complete new hire orientation covering company culture, tools, and compliance requirements.',
    type: 'Onboarding',
    steps: [
      { id: 's1', order: 1, contentTitle: 'Welcome & Culture Intro', delay: 0, delayUnit: 'hours', transitionRule: 'immediate' },
      { id: 's2', order: 2, contentTitle: 'Benefits & Compensation Overview', delay: 1, delayUnit: 'days', transitionRule: 'on_complete' },
      { id: 's3', order: 3, contentTitle: 'Compliance & Security Training', delay: 2, delayUnit: 'days', transitionRule: 'on_complete' },
    ],
    metrics: ['Visited', 'Time Spent', 'Employee Hired'],
    autoGenerateSlide: true, createdAt: '2026-05-01',
  },
  {
    id: 'c2', name: 'Sales Enablement Q2',
    description: 'Quarterly product training and sales techniques for the revenue team.',
    type: 'Training',
    steps: [
      { id: 's4', order: 1, contentTitle: 'Product Updates Q2', delay: 0, delayUnit: 'hours', transitionRule: 'immediate' },
      { id: 's5', order: 2, contentTitle: 'Objection Handling Playbook', delay: 1, delayUnit: 'days', transitionRule: 'on_complete' },
      { id: 's6', order: 3, contentTitle: 'Competitive Battlecard', delay: 1, delayUnit: 'days', transitionRule: 'on_complete' },
      { id: 's7', order: 4, contentTitle: 'Quota & KPI Review', delay: 2, delayUnit: 'days', transitionRule: 'on_schedule' },
      { id: 's8', order: 5, contentTitle: 'Final Assessment Quiz', delay: 3, delayUnit: 'days', transitionRule: 'on_complete' },
    ],
    metrics: ['Score', 'Time Spent', 'Deal Closed'],
    autoGenerateSlide: false, createdAt: '2026-04-15',
  },
  {
    id: 'c3', name: 'Technical Interview Process',
    description: 'Structured candidate evaluation for senior engineering positions.',
    type: 'Interview',
    steps: [
      { id: 's9', order: 1, contentTitle: 'Role & Team Introduction', delay: 0, delayUnit: 'hours', transitionRule: 'immediate' },
      { id: 's10', order: 2, contentTitle: 'Technical Skills Assessment', delay: 0, delayUnit: 'hours', transitionRule: 'on_complete' },
    ],
    metrics: ['Score', 'Q&A Completed', 'Employee Hired'],
    autoGenerateSlide: false, createdAt: '2026-03-20',
  },
  {
    id: 'c4', name: 'Annual Compliance Certification',
    description: 'Mandatory annual certification covering GDPR, data handling, and security policies.',
    type: 'Assessment',
    steps: [
      { id: 's11', order: 1, contentTitle: 'GDPR & Data Privacy Module', delay: 0, delayUnit: 'hours', transitionRule: 'immediate' },
      { id: 's12', order: 2, contentTitle: 'Cybersecurity Best Practices', delay: 1, delayUnit: 'days', transitionRule: 'on_complete' },
      { id: 's13', order: 3, contentTitle: 'Final Certification Exam', delay: 2, delayUnit: 'days', transitionRule: 'on_complete' },
    ],
    metrics: ['Score', 'Assessment Passed', 'Documents Signed'],
    autoGenerateSlide: true, createdAt: '2026-02-01',
  },
]

const TYPE_BADGE_CLASS: Record<Course['type'], string> = {
  Onboarding:   'typeOnboarding',
  Training:     'typeTraining',
  Assessment:   'typeAssessment',
  Interview:    'typeInterview',
  Presentation: 'typePresentation',
}

const emptyStep = (): CourseStep => ({
  id: `step-${Date.now()}`, order: 0, contentTitle: '',
  delay: 0, delayUnit: 'days', transitionRule: 'immediate',
})

const emptyCourse: Omit<Course, 'id' | 'createdAt'> = {
  name: '', description: '', type: 'Onboarding',
  steps: [], metrics: [], autoGenerateSlide: false,
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const { showToast } = useToast()

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  // Drawer state
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'metrics' | 'steps'>('details')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ ...emptyCourse, steps: [] as CourseStep[], metrics: [] as string[] })

  // Metrics dropdown
  const [metricSearch, setMetricSearch] = useState('')

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ ...emptyCourse, steps: [], metrics: [] })
    setActiveTab('details')
    setMetricSearch('')
    setIsOpen(true)
  }

  const handleOpenEdit = (course: Course) => {
    setEditingId(course.id)
    setFormData({
      name: course.name, description: course.description, type: course.type,
      steps: course.steps.map(s => ({ ...s })),
      metrics: [...course.metrics],
      autoGenerateSlide: course.autoGenerateSlide,
    })
    setActiveTab('details')
    setMetricSearch('')
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { showToast('Course name is required', 'error'); return }
    if (editingId) {
      setCourses(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c))
      showToast('Course updated', 'success')
    } else {
      const newCourse: Course = {
        ...formData,
        id: `c${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setCourses(prev => [newCourse, ...prev])
      showToast('Course created', 'success')
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this course? All associated enrollment sequences will be affected.')) return
    setCourses(prev => prev.filter(c => c.id !== id))
    showToast('Course deleted', 'success')
  }

  // ── Steps helpers ────────────────────────────────────────────────────────────
  const addStep = () => {
    const step = emptyStep()
    step.order = formData.steps.length + 1
    setFormData({ ...formData, steps: [...formData.steps, step] })
  }

  const updateStep = (id: string, updates: Partial<CourseStep>) => {
    setFormData({ ...formData, steps: formData.steps.map(s => s.id === id ? { ...s, ...updates } : s) })
  }

  const removeStep = (id: string) => {
    const filtered = formData.steps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }))
    setFormData({ ...formData, steps: filtered })
  }

  const moveStep = (id: string, dir: 'up' | 'down') => {
    const idx = formData.steps.findIndex(s => s.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === formData.steps.length - 1) return
    const next = [...formData.steps]
    const swap = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setFormData({ ...formData, steps: next.map((s, i) => ({ ...s, order: i + 1 })) })
  }

  // ── Metrics helpers ──────────────────────────────────────────────────────────
  const addMetric = (m: string) => {
    if (formData.metrics.includes(m)) return
    setFormData({ ...formData, metrics: [...formData.metrics, m] })
    setMetricSearch('')
  }
  const removeMetric = (m: string) => setFormData({ ...formData, metrics: formData.metrics.filter(x => x !== m) })

  const filteredMetrics = METRICS_CATALOG.filter(
    m => !formData.metrics.includes(m) && m.toLowerCase().includes(metricSearch.toLowerCase())
  )

  // ── Filters ──────────────────────────────────────────────────────────────────
  const filteredCourses = courses.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || c.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Courses</h1>
          <p className={styles.subtitle}>Build multi-step onboarding sequences from individual presentations.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Create course">
            <Plus size={16} /> New Course
          </button>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text" className={styles.searchInput}
            placeholder="Search courses…" value={search}
            onChange={e => setSearch(e.target.value)} aria-label="Search courses"
          />
        </div>
        <select
          className={styles.typeFilter} value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type"
        >
          <option value="All">All Types</option>
          {(['Onboarding', 'Training', 'Assessment', 'Interview', 'Presentation'] as const).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {!filteredCourses.length ? (
          <div className={styles.emptyState}>
            <GraduationCap size={48} style={{ color: '#cbd5e1' }} />
            <h3 className={styles.emptyStateTitle}>No courses yet</h3>
            <p className={styles.emptyStateDesc}>Build multi-step onboarding or training sequences by combining individual presentations.</p>
            <button className={styles.btnPrimary} onClick={handleOpenCreate}><Plus size={15} /> Create First Course</button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Type</th>
                <th>Steps</th>
                <th>Result Metrics</th>
                <th>Created</th>
                <th style={{ width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div className={styles.courseName}>{course.name}</div>
                    <div className={styles.courseDesc}>{course.description}</div>
                  </td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[TYPE_BADGE_CLASS[course.type]]}`}>
                      {course.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#475569' }}>
                      <List size={14} /> {course.steps.length} step{course.steps.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {course.metrics.slice(0, 3).map(m => (
                        <span key={m} style={{ background: 'rgba(99,102,241,.1)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {m}
                        </span>
                      ))}
                      {course.metrics.length > 3 && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>+{course.metrics.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{course.createdAt}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button className={styles.btnIcon} onClick={() => handleOpenEdit(course)} title="Edit" aria-label={`Edit ${course.name}`}><Edit3 size={15} /></button>
                      <button className={`${styles.btnIcon} ${styles.btnIconDanger}`} onClick={() => handleDelete(course.id)} title="Delete" aria-label={`Delete ${course.name}`}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Side Drawer ── */}
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{editingId ? 'Edit Course' : 'New Course'}</h2>
                {formData.name && <p className={styles.modalSub}>{formData.name}</p>}
              </div>
              <button className={styles.modalClose} onClick={() => setIsOpen(false)} aria-label="Close"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className={styles.drawerTabs}>
              <button className={`${styles.drawerTab} ${activeTab === 'details' ? styles.drawerTabActive : ''}`} onClick={() => setActiveTab('details')}>
                <BookOpen size={13} /> Course Details
              </button>
              <button className={`${styles.drawerTab} ${activeTab === 'metrics' ? styles.drawerTabActive : ''}`} onClick={() => setActiveTab('metrics')}>
                <BarChart2 size={13} /> Results Metrics
              </button>
              <button className={`${styles.drawerTab} ${activeTab === 'steps' ? styles.drawerTabActive : ''}`} onClick={() => setActiveTab('steps')}>
                <List size={13} /> Steps Builder
                {formData.steps.length > 0 && <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '9999px', minWidth: 16, textAlign: 'center' }}>{formData.steps.length}</span>}
              </button>
            </div>

            <form id="course-form" onSubmit={handleSave}>
              <div className={styles.modalBody}>

                {/* ── Details tab ── */}
                {activeTab === 'details' && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="courseName">Course Name *</label>
                      <input id="courseName" type="text" className={styles.input} required
                        placeholder="e.g. HR Onboarding 2024"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="courseDesc">Description</label>
                      <textarea id="courseDesc" className={styles.textarea}
                        placeholder="What will participants learn or achieve?"
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="courseType">Course Type *</label>
                      <select id="courseType" className={styles.input} required
                        value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as Course['type'] })}>
                        {(['Onboarding', 'Training', 'Assessment', 'Interview', 'Presentation'] as const).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.toggleRow}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Auto-generate Content Slide</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Automatically prepend a course overview slide at the beginning of each step.</div>
                      </div>
                      <input
                        type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
                        checked={formData.autoGenerateSlide}
                        onChange={e => setFormData({ ...formData, autoGenerateSlide: e.target.checked })}
                        aria-label="Auto-generate content slide"
                      />
                    </div>
                  </>
                )}

                {/* ── Metrics tab ── */}
                {activeTab === 'metrics' && (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Select result metrics to track for this course. These define what data is collected and shown in Enrollment Results.
                    </p>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="metricSearch">Add metric from catalog</label>
                      <input
                        id="metricSearch" type="text" className={styles.input}
                        placeholder="Search metrics… (e.g. Score, Time Spent)"
                        value={metricSearch} onChange={e => setMetricSearch(e.target.value)}
                      />
                      {metricSearch && filteredMetrics.length > 0 && (
                        <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 8, overflow: 'hidden', marginTop: '0.25rem', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}>
                          {filteredMetrics.map(m => (
                            <button key={m} type="button"
                              onClick={() => addMetric(m)}
                              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 0.85rem', fontSize: '0.85rem', color: '#334155', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                            >
                              + {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.metrics.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: 10, border: '1px dashed var(--border-light)' }}>
                        <BarChart2 size={28} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>No metrics added yet. Search above to add from catalog.</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Selected metrics ({formData.metrics.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {formData.metrics.map(m => (
                            <span key={m} className={styles.metricChip}>
                              {m}
                              <button type="button" className={styles.metricChipRemove} onClick={() => removeMetric(m)} aria-label={`Remove ${m}`}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ background: '#eff6ff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.35rem' }}>📊 Available in Catalog</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {METRICS_CATALOG.filter(m => !formData.metrics.includes(m)).map(m => (
                          <button key={m} type="button"
                            style={{ background: 'rgba(37,99,235,.08)', color: '#2563eb', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            onClick={() => addMetric(m)}
                          >
                            + {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Steps tab ── */}
                {activeTab === 'steps' && (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Define the sequence of presentations that make up this course. Set delays and transition rules between each step.
                    </p>
                    {formData.steps.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: 10, border: '1px dashed var(--border-light)' }}>
                        <List size={28} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>No steps yet. Add your first step below.</p>
                      </div>
                    ) : (
                      <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, overflow: 'hidden' }}>
                        <table className={styles.stepsTable}>
                          <thead>
                            <tr>
                              <th style={{ width: 40 }}>#</th>
                              <th>Content / Presentation</th>
                              <th style={{ width: 120 }}>Delay</th>
                              <th style={{ width: 140 }}>Transition</th>
                              <th style={{ width: 80 }}>Order</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.steps.map((step, idx) => (
                              <tr key={step.id}>
                                <td><div className={styles.stepNum}>{step.order}</div></td>
                                <td>
                                  <input
                                    type="text" className={styles.stepInput}
                                    placeholder="Select or type presentation name…"
                                    value={step.contentTitle}
                                    onChange={e => updateStep(step.id, { contentTitle: e.target.value })}
                                    aria-label={`Step ${step.order} content`}
                                  />
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <input
                                      type="number" className={`${styles.stepInput} ${styles.stepInputNarrow}`}
                                      min={0} value={step.delay}
                                      onChange={e => updateStep(step.id, { delay: parseInt(e.target.value) || 0 })}
                                      aria-label={`Step ${step.order} delay`}
                                    />
                                    <select
                                      className={styles.stepInput} style={{ width: 56 }}
                                      value={step.delayUnit}
                                      onChange={e => updateStep(step.id, { delayUnit: e.target.value as CourseStep['delayUnit'] })}
                                      aria-label={`Step ${step.order} delay unit`}
                                    >
                                      <option value="hours">h</option>
                                      <option value="days">d</option>
                                    </select>
                                  </div>
                                </td>
                                <td>
                                  <select
                                    className={styles.stepInput}
                                    value={step.transitionRule}
                                    onChange={e => updateStep(step.id, { transitionRule: e.target.value as CourseStep['transitionRule'] })}
                                    aria-label={`Step ${step.order} transition`}
                                  >
                                    <option value="immediate">Immediate</option>
                                    <option value="on_complete">On Complete</option>
                                    <option value="on_schedule">Scheduled</option>
                                  </select>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                                    <button type="button" className={styles.btnIcon} onClick={() => moveStep(step.id, 'up')} disabled={idx === 0} aria-label="Move step up" style={{ opacity: idx === 0 ? 0.3 : 1 }}>
                                      <ChevronUp size={14} />
                                    </button>
                                    <button type="button" className={styles.btnIcon} onClick={() => moveStep(step.id, 'down')} disabled={idx === formData.steps.length - 1} aria-label="Move step down" style={{ opacity: idx === formData.steps.length - 1 ? 0.3 : 1 }}>
                                      <ChevronDown size={14} />
                                    </button>
                                    <button type="button" className={`${styles.btnIcon} ${styles.btnIconDanger}`} onClick={() => removeStep(step.id)} aria-label={`Remove step ${step.order}`}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <button type="button" className={styles.addStepBtn} onClick={addStep}>
                      <Plus size={14} /> Add Step
                    </button>
                  </>
                )}
              </div>
            </form>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSecondary} onClick={() => setIsOpen(false)}>Cancel</button>
              <button type="submit" form="course-form" className={styles.btnPrimary}>
                {editingId ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
