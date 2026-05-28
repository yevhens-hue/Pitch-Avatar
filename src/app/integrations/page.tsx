'use client'

import React, { useState, useMemo } from 'react'
import styles from './Integrations.module.css'
import {
  Plug, Plus, Search, Edit3, Copy, Trash2, X,
  ArrowUpRight, ArrowDownLeft,
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

// ── Types ─────────────────────────────────────────────────────────────────────
type Direction = 'send' | 'receive'

interface IntegrationMapping {
  id: string
  name: string
  result: string
  direction: Direction
  application: string
  entity: string
  toField: string
  createNewEntity: boolean
  newEntityType: string
}

// ── Catalog data ──────────────────────────────────────────────────────────────
const RESULTS_CATALOG = [
  'Training Passed',
  'Interview Summary',
  'Test Results',
  'Deal Qualified',
  'Meeting Requested',
  'Product Interest',
  'Custdev Hypothesis Confirmed',
  'Feature Needed',
  'Deal Closed',
  'Deal Lost',
  'Deal Stage',
  'Candidate Hired',
  'Candidate Rejected',
  'Employee Started Work',
  'Onboarding Progress',
  'Onboarding Start Date',
  'Score',
  'Q&A Summary',
]

const APPLICATIONS: { label: string; category: string; color: string }[] = [
  { label: 'HubSpot CRM',          category: 'CRM',  color: '#ff7a59' },
  { label: 'Salesforce CRM',       category: 'CRM',  color: '#00a1e0' },
  { label: 'Pipedrive CRM',        category: 'CRM',  color: '#00a35c' },
  { label: 'Workday HRS',          category: 'HRS',  color: '#c00' },
  { label: 'BambooHR HRS',         category: 'HRS',  color: '#73ac39' },
  { label: 'SAP SuccessFactors',   category: 'LMS',  color: '#0070c0' },
  { label: 'Moodle LMS',           category: 'LMS',  color: '#f98012' },
  { label: 'Greenhouse ATS',       category: 'ATS',  color: '#24a04b' },
  { label: 'Lever ATS',            category: 'ATS',  color: '#4d4cf6' },
]

const APP_COLORS: Record<string, string> = Object.fromEntries(APPLICATIONS.map(a => [a.label, a.color]))

// Entity options depend on selected application category
const ENTITY_OPTIONS: Record<string, string[]> = {
  CRM:  ['Deal', 'Contact', 'Task', 'Opportunity'],
  HRS:  ['Candidate', 'Employee', 'Onboarding Record'],
  LMS:  ['Learner', 'Training Record', 'Course Enrollment'],
  ATS:  ['Candidate', 'Application', 'Job Offer'],
}

// Field options depend on entity
const FIELD_OPTIONS: Record<string, string[]> = {
  'Deal':               ['Status', 'Stage', 'Deal Stage', 'Close Date', 'Amount', 'Note'],
  'Contact':            ['Status', 'Tags', 'Last Activity', 'Note'],
  'Task':               ['Title', 'Due Date', 'Assignee', 'Status'],
  'Opportunity':        ['Stage', 'Status', 'Value', 'Note'],
  'Candidate':          ['Hire Status', 'Hire Date', 'Reject Reason', 'Note', 'Onboarding Status'],
  'Employee':           ['Onboarding Status', 'Start Date', 'Department', 'Manager'],
  'Onboarding Record':  ['Progress', 'Start Date', 'Completion Date', 'Status'],
  'Learner':            ['Score', 'Status', 'Completion Date'],
  'Training Record':    ['Status', 'Score', 'Completion Date', 'Attempts'],
  'Course Enrollment':  ['Status', 'Progress', 'Score', 'Completion Date'],
  'Application':        ['Status', 'Stage', 'Interview Score', 'Note'],
  'Job Offer':          ['Status', 'Start Date', 'Offer Amount'],
}

const NEW_ENTITY_TYPES = ['Contact', 'Deal', 'Task', 'Opportunity', 'Candidate', 'Lead']

type FilterCategory = 'All' | 'CRM' | 'HRS' | 'LMS' | 'ATS'

// ── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_MAPPINGS: IntegrationMapping[] = [
  { id: 'm1',  name: 'Deal Closed (CRM)',             result: 'Deal Closed',              direction: 'receive', application: 'HubSpot CRM',        entity: 'Deal',              toField: 'Status',             createNewEntity: false, newEntityType: '' },
  { id: 'm2',  name: 'Deal Lost (CRM)',               result: 'Deal Lost',                direction: 'receive', application: 'HubSpot CRM',        entity: 'Deal',              toField: 'Status',             createNewEntity: false, newEntityType: '' },
  { id: 'm3',  name: 'Deal Stage (CRM)',              result: 'Deal Stage',               direction: 'receive', application: 'HubSpot CRM',        entity: 'Deal',              toField: 'Deal Stage',         createNewEntity: false, newEntityType: '' },
  { id: 'm4',  name: 'Employee Hired (HRS)',          result: 'Candidate Hired',          direction: 'receive', application: 'Workday HRS',        entity: 'Candidate',         toField: 'Hire Status',        createNewEntity: false, newEntityType: '' },
  { id: 'm5',  name: 'Employee Rejected (HRS)',       result: 'Candidate Rejected',       direction: 'receive', application: 'Workday HRS',        entity: 'Candidate',         toField: 'Hire Status',        createNewEntity: false, newEntityType: '' },
  { id: 'm6',  name: 'Start Date (HRS)',              result: 'Onboarding Start Date',    direction: 'receive', application: 'Workday HRS',        entity: 'Candidate',         toField: 'Hire Date',          createNewEntity: false, newEntityType: '' },
  { id: 'm7',  name: 'Employee Started Work (HRS)',   result: 'Employee Started Work',    direction: 'receive', application: 'Workday HRS',        entity: 'Candidate',         toField: 'Onboarding Status',  createNewEntity: false, newEntityType: '' },
  { id: 'm8',  name: 'Onboarding Start Date (HRS)',   result: 'Onboarding Start Date',    direction: 'receive', application: 'Workday HRS',        entity: 'Candidate',         toField: 'Hire Date',          createNewEntity: false, newEntityType: '' },
  { id: 'm9',  name: 'Onboarding Progress (HRS)',     result: 'Onboarding Progress',      direction: 'receive', application: 'Workday HRS',        entity: 'Candidate',         toField: 'Onboarding Progress',createNewEntity: false, newEntityType: '' },
  { id: 'm10', name: 'Training Passed → Moodle',      result: 'Training Passed',          direction: 'send',    application: 'Moodle LMS',         entity: 'Training Record',   toField: 'Status',             createNewEntity: false, newEntityType: '' },
  { id: 'm11', name: 'Interview Summary → Greenhouse', result: 'Interview Summary',       direction: 'send',    application: 'Greenhouse ATS',     entity: 'Application',       toField: 'Note',               createNewEntity: true,  newEntityType: 'Task' },
  { id: 'm12', name: 'Deal Qualified → HubSpot',      result: 'Deal Qualified',           direction: 'send',    application: 'HubSpot CRM',        entity: 'Deal',              toField: 'Stage',              createNewEntity: true,  newEntityType: 'Deal' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const getAppCategory = (app: string): string =>
  APPLICATIONS.find(a => a.label === app)?.category ?? 'CRM'

const getEntityOptions = (app: string) =>
  ENTITY_OPTIONS[getAppCategory(app)] ?? []

const getFieldOptions = (entity: string) =>
  FIELD_OPTIONS[entity] ?? []

const emptyForm = (): IntegrationMapping => ({
  id: '',
  name: '',
  result: RESULTS_CATALOG[0],
  direction: 'send',
  application: APPLICATIONS[0].label,
  entity: ENTITY_OPTIONS['CRM'][0],
  toField: FIELD_OPTIONS['Deal'][0],
  createNewEntity: false,
  newEntityType: '',
})

// ── Component ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const { showToast } = useToast()
  const [mappings, setMappings] = useState<IntegrationMapping[]>(INITIAL_MAPPINGS)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<FilterCategory>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<IntegrationMapping>(emptyForm())

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return mappings.filter(m => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.result.toLowerCase().includes(q) ||
        m.application.toLowerCase().includes(q) ||
        m.entity.toLowerCase().includes(q)
      const matchCat = filterCat === 'All' || getAppCategory(m.application) === filterCat
      return matchSearch && matchCat
    })
  }, [mappings, search, filterCat])

  // ── Form helpers ──────────────────────────────────────────────────────────
  const updateForm = (patch: Partial<IntegrationMapping>) => {
    setForm(prev => {
      const next = { ...prev, ...patch }
      // cascade: when app changes, reset entity & field
      if (patch.application) {
        const entities = ENTITY_OPTIONS[getAppCategory(patch.application)] ?? []
        next.entity = entities[0] ?? ''
        next.toField = getFieldOptions(next.entity)[0] ?? ''
      }
      // cascade: when entity changes, reset field
      if (patch.entity) {
        next.toField = getFieldOptions(patch.entity)[0] ?? ''
      }
      return next
    })
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setIsModalOpen(true)
  }

  const handleOpenEdit = (m: IntegrationMapping) => {
    setEditingId(m.id)
    setForm({ ...m })
    setIsModalOpen(true)
  }

  const handleDuplicate = (m: IntegrationMapping) => {
    const dup: IntegrationMapping = {
      ...m,
      id: `m${Date.now()}`,
      name: `${m.name} (copy)`,
    }
    setMappings(prev => [...prev, dup])
    showToast('Integration duplicated', 'success')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this integration mapping?')) return
    setMappings(prev => prev.filter(m => m.id !== id))
    showToast('Deleted', 'success')
  }

  const handleSave = () => {
    if (!form.result || !form.application || !form.entity || !form.toField) {
      showToast('Please fill all required fields', 'error')
      return
    }
    const autoName = form.name.trim() ||
      `${form.result} → ${form.application} (${form.entity}.${form.toField})`

    if (editingId) {
      setMappings(prev => prev.map(m => m.id === editingId ? { ...form, name: autoName } : m))
      showToast('Integration updated', 'success')
    } else {
      setMappings(prev => [...prev, { ...form, id: `m${Date.now()}`, name: autoName }])
      showToast('Integration created', 'success')
    }
    setIsModalOpen(false)
  }

  const FILTER_CATS: FilterCategory[] = ['All', 'CRM', 'HRS', 'LMS', 'ATS']

  const entityOptions  = getEntityOptions(form.application)
  const fieldOptions   = getFieldOptions(form.entity)

  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <Plug size={22} style={{ color: 'var(--primary, #6366f1)' }} />
            Integrations
          </h1>
          <p className={styles.subtitle}>
            Map Results to external apps. Same Result can be exported to / imported from multiple systems — add one integration per system.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrimary} onClick={handleOpenCreate} aria-label="Add integration">
            <Plus size={16} /> Add Integration
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search integrations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search integrations"
          />
        </div>
        <div className={styles.filterTabs}>
          {FILTER_CATS.map(cat => (
            <button
              key={cat}
              className={`${styles.filterTab} ${filterCat === cat ? styles.filterTabActive : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Plug size={40} />
            <h3 className={styles.emptyStateTitle}>No integrations yet</h3>
            <p className={styles.emptyStateDesc}>Click "+ Add Integration" to map a Result to an external system.</p>
            <button className={styles.btnPrimary} onClick={handleOpenCreate}>
              <Plus size={15} /> Add Integration
            </button>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Result</th>
                <th>Direction</th>
                <th>Application</th>
                <th>Entity + Field</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className={styles.integrationName}>{m.name}</div>
                    {m.createNewEntity && m.newEntityType && (
                      <div style={{ fontSize: '0.72rem', color: '#6366f1', marginTop: '0.15rem' }}>
                        ✦ Creates new {m.newEntityType}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={styles.resultTag}>{m.result}</span>
                  </td>
                  <td>
                    {m.direction === 'send' ? (
                      <span className={styles.directionSend}>
                        <ArrowUpRight size={11} /> Send to App
                      </span>
                    ) : (
                      <span className={styles.directionReceive}>
                        <ArrowDownLeft size={11} /> Receive from App
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={styles.appPill}>
                      <span
                        className={styles.appDot}
                        style={{ background: APP_COLORS[m.application] ?? '#94a3b8' }}
                      />
                      {m.application}
                    </span>
                  </td>
                  <td>
                    <div className={styles.entityField}>
                      <span className={styles.entityName}>{m.entity}</span>
                      <span className={styles.fieldName}>→ {m.toField}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleOpenEdit(m)}
                        title="Edit"
                        aria-label={`Edit ${m.name}`}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleDuplicate(m)}
                        title="Duplicate"
                        aria-label={`Duplicate ${m.name}`}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                        onClick={() => handleDelete(m.id)}
                        title="Delete"
                        aria-label={`Delete ${m.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Edit / Create Modal ── */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Edit Integration' : 'Add Integration'}</h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>

              {/* Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="intName">Name</label>
                <input
                  id="intName"
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={e => updateForm({ name: e.target.value })}
                  placeholder="e.g. Deal Closed (CRM)"
                />
                <span className={styles.formHint}>Optional. Auto-generated if empty.</span>
              </div>

              {/* Result */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="intResult">Result</label>
                <select
                  id="intResult"
                  className={styles.select}
                  value={form.result}
                  onChange={e => updateForm({ result: e.target.value })}
                >
                  {RESULTS_CATALOG.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <span className={styles.formHint}>
                  Only Results from the Results catalog can be mapped. Create a new Result there first if needed.
                </span>
              </div>

              {/* Direction */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Direction</label>
                <div className={styles.directionToggle}>
                  <button
                    type="button"
                    className={`${styles.directionOption} ${form.direction === 'send' ? styles.directionOptionActive : ''}`}
                    onClick={() => updateForm({ direction: 'send' })}
                  >
                    <ArrowUpRight size={15} />
                    Send Result to App
                  </button>
                  <button
                    type="button"
                    className={`${styles.directionOption} ${form.direction === 'receive' ? styles.directionOptionActive : ''}`}
                    onClick={() => updateForm({ direction: 'receive' })}
                  >
                    <ArrowDownLeft size={15} />
                    Receive Result from App
                  </button>
                </div>
              </div>

              {/* Application */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="intApp">Application</label>
                <select
                  id="intApp"
                  className={styles.select}
                  value={form.application}
                  onChange={e => updateForm({ application: e.target.value })}
                >
                  {['CRM', 'HRS', 'LMS', 'ATS'].map(cat => (
                    <optgroup key={cat} label={cat}>
                      {APPLICATIONS.filter(a => a.category === cat).map(a => (
                        <option key={a.label} value={a.label}>{a.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Entity */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="intEntity">Entity</label>
                <select
                  id="intEntity"
                  className={styles.select}
                  value={form.entity}
                  onChange={e => updateForm({ entity: e.target.value })}
                >
                  {entityOptions.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              {/* To Field */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="intField">To Field</label>
                <select
                  id="intField"
                  className={styles.select}
                  value={form.toField}
                  onChange={e => updateForm({ toField: e.target.value })}
                >
                  {fieldOptions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Create new entity */}
              <div className={styles.createEntityBox}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.createNewEntity}
                    onChange={e => updateForm({ createNewEntity: e.target.checked })}
                    aria-label="Create new entity linked to listener email"
                  />
                  Create new entity linked to listener email
                </label>

                {form.createNewEntity && (
                  <div className={styles.formGroup} style={{ margin: 0 }}>
                    <label className={styles.formLabel} htmlFor="intNewEntity">New entity type</label>
                    <select
                      id="intNewEntity"
                      className={styles.select}
                      value={form.newEntityType}
                      onChange={e => updateForm({ newEntityType: e.target.value })}
                    >
                      <option value="">Select entity type</option>
                      {NEW_ENTITY_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
