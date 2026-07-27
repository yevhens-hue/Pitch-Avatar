'use client'

import React, { useState } from 'react'
import { Plus, Edit3, Trash2, X, Search, Bot, FileText } from 'lucide-react'

import { useTemplateStore } from '@/lib/templateStore'
import { PresentationTemplate } from '@/data/presentation-templates'
import styles from './ProjectTemplatesTab.module.css'

import { Project } from '@/types'
import { getProjects } from '@/app/actions/projects'
import SourceProjectPicker from './SourceProjectPicker'


const COVER_GRADIENTS = [
  'linear-gradient(135deg,#0076ff 0%,#0061d6 100%)',
  'linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)',
  'linear-gradient(135deg,#a855f7 0%,#0061d6 100%)',
  'linear-gradient(135deg,#f97316 0%,#ea580c 100%)',
  'linear-gradient(135deg,#10b981 0%,#059669 100%)',
  'linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)',
  'linear-gradient(135deg,#14b8a6 0%,#0d9488 100%)',
  'linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)',
  'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
  'linear-gradient(135deg,#06b6d4 0%,#0891b2 100%)',
]

// ── Types ─────────────────────────────────────────────────────────────────────
interface TemplateFormData {
  creationMethod: 'existing' | 'scratch' | 'upload'
  name: string
  description: string
  selectedProjectId: string
  file: File | null
  status: 'active' | 'inactive'
  isOnHomepage: boolean
  order: number
}

const EMPTY_FORM: TemplateFormData = {
  creationMethod: 'existing',
  name: '',
  description: '',
  selectedProjectId: '',
  file: null,
  status: 'active',
  isOnHomepage: true,
  order: 1,
}

// ── Helper ────────────────────────────────────────────────────────────────────
function getGradient(id: string, idx: number): string {
  const numId = parseInt(id, 10)
  if (!isNaN(numId)) return COVER_GRADIENTS[(numId - 1) % COVER_GRADIENTS.length]
  return COVER_GRADIENTS[idx % COVER_GRADIENTS.length]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProjectTemplatesTab() {
  const { templates, _hasHydrated, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<PresentationTemplate | null>(null)
  const [form, setForm] = useState<TemplateFormData>(EMPTY_FORM)

  const [projects, setProjects] = useState<Project[]>([])

  // Avoid hydration mismatch by waiting for _hasHydrated
  const [mounted, setMounted] = useState(false)
  React.useEffect(() => {
    setMounted(true)
    getProjects().then(data => {
      if (data) setProjects(data)
    }).catch(console.error)
  }, [])

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, order: templates.length + 1, selectedProjectId: projects[0]?.id || '' })
    setShowModal(true)
  }

  const handleOpenEdit = (tpl: PresentationTemplate) => {
    setEditingId(tpl.id)
    setForm({
      creationMethod: 'existing',
      name: tpl.name,
      description: tpl.description,
      selectedProjectId: tpl.selectedProjectId ?? (projects[0]?.id || ''),
      file: null,
      status: tpl.status ?? 'active',
      isOnHomepage: tpl.isOnHomepage ?? false,
      order: tpl.order ?? 1,
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateTemplate(editingId, {
        name: form.name,
        description: form.description,
        selectedProjectId: form.creationMethod === 'existing' ? form.selectedProjectId : undefined,
        status: form.status,
        isOnHomepage: form.isOnHomepage,
        order: form.order,
      })
    } else {
      await addTemplate({
        name: form.name,
        description: form.description,
        selectedProjectId: form.creationMethod === 'existing' ? form.selectedProjectId : undefined,
        status: form.status,
        isOnHomepage: form.isOnHomepage,
        order: form.order,
        // Required defaults
        productTypes: ['HR'],
        projectType: 'Presentation + AI Avatar',
        tags: [],
        slideCount: 8,
        accessType: 'system',
        templateType: 'copy',
      })
    }
    handleCloseModal()
  }

  const handleDeleteClick = (tpl: PresentationTemplate) => {
    setDeletingTemplate(tpl)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return
    await deleteTemplate(deletingTemplate.id)
    setDeletingTemplate(null)
  }

  const updateField = <K extends keyof TemplateFormData>(key: K, value: TemplateFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Filter and sort templates
  const filteredTemplates = templates.filter(tpl => {
    if (statusFilter !== 'All') {
      const isActive = (tpl.status ?? 'active') === 'active'
      if (statusFilter === 'active' && !isActive) return false
      if (statusFilter === 'inactive' && isActive) return false
    }
    if (typeFilter !== 'All') {
      const pType = tpl.projectType || 'Presentation'
      if (typeFilter === 'Presentation + Avatar' && !pType.includes('Avatar')) return false
      if (typeFilter === 'Presentation' && pType.includes('Avatar')) return false
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      if (!tpl.name.toLowerCase().includes(q) && !(tpl.description?.toLowerCase().includes(q))) return false
    }
    return true
  }).sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

  if (!mounted || !_hasHydrated) return null // or a loading spinner


  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Project Templates</h2>
          <p className={styles.subtitle}>Select existing projects to use as templates</p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenCreate} aria-label="Add template">
          <Plus size={15} /> Add Template
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            style={{ width: '100%', padding: '8px 32px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', outline: 'none' }}
            placeholder="Поиск"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Type Filter */}
        <select
          style={{ padding: '8px 32px 8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#334155', background: '#fff', cursor: 'pointer' }}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          aria-label="Фильтр по типу шаблона"
        >
          <option value="All">Все типы</option>
          <option value="Presentation">Presentation</option>
          <option value="Presentation + Avatar">Presentation + Avatar</option>
        </select>

        {/* Status Filter */}
        <select
          style={{ padding: '8px 32px 8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', color: '#334155', background: '#fff', cursor: 'pointer' }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          aria-label="Фильтр по статусу"
        >
          <option value="All">Статус</option>
          <option value="active">Активный</option>
          <option value="inactive">Неактивный</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {filteredTemplates.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Шаблоны не найдены.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Name</th>
                <th>Source Project</th>
                <th>Template Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((tpl, idx) => {
                const isActive = (tpl.status ?? 'active') === 'active'
                const isAvatar = (tpl.projectType || '').includes('Avatar')
                return (
                  <tr key={tpl.id}>
                    {/* Thumbnail */}
                    <td>
                      <div
                        className={styles.thumbnail}
                        style={{ background: getGradient(tpl.id, idx) }}
                        aria-hidden="true"
                      />
                    </td>

                    {/* Name */}
                    <td>
                      <div className={styles.tplName}>{tpl.name}</div>
                      {tpl.description && (
                        <div className={styles.tplDesc}>{tpl.description}</div>
                      )}
                    </td>

                    {/* Source Project */}
                    <td className={styles.sourceProject}>
                      {projects.find(p => p.id === tpl.selectedProjectId)?.title || tpl.selectedProjectId || '—'}
                    </td>

                    {/* Template Type */}
                    <td>
                      {isAvatar ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#eff6ff', color: '#0284c7', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Bot size={13} /> Presentation + Avatar
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <FileText size={13} /> Presentation
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleOpenEdit(tpl)}
                          title="Edit"
                          aria-label={`Edit ${tpl.name}`}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                          onClick={() => handleDeleteClick(tpl)}
                          title="Delete"
                          aria-label={`Delete ${tpl.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>


      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div
          className={styles.overlay}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tplModalTitle"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className={styles.modalHeader}>
              <h2 id="tplModalTitle" className={styles.modalTitle}>
                {editingId ? 'Edit Template' : 'New Project Template'}
              </h2>
              <button
                className={styles.modalCloseBtn}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className={styles.form}>

              {/* Template Name */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="tplName">Template Name *</label>
                <input
                  id="tplName"
                  required
                  type="text"
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. B2B Sales Prospecting"
                />
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="tplDesc">Description</label>
                <textarea
                  id="tplDesc"
                  className={styles.textarea}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Description of the template..."
                  rows={3}
                />
              </div>

              {/* Creation Method */}
              {!editingId && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Creation Method *</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="creationMethod" 
                        value="existing"
                        checked={form.creationMethod === 'existing'}
                        onChange={() => updateField('creationMethod', 'existing')}
                      />
                      From existing project
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="creationMethod" 
                        value="scratch"
                        checked={form.creationMethod === 'scratch'}
                        onChange={() => updateField('creationMethod', 'scratch')}
                      />
                      Create from scratch
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="creationMethod" 
                        value="upload"
                        checked={form.creationMethod === 'upload'}
                        onChange={() => updateField('creationMethod', 'upload')}
                      />
                      Upload template
                    </label>
                  </div>
                </div>
              )}

              {/* Source Project Selector Table */}
              {form.creationMethod === 'existing' && (
                <SourceProjectPicker
                  projects={projects}
                  selectedProjectId={form.selectedProjectId}
                  onSelectProject={(id) => updateField('selectedProjectId', id)}
                />
              )}


              {/* Upload File */}
              {form.creationMethod === 'upload' && !editingId && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="tplFile">Upload File * (.pptx, .pdf)</label>
                  <input
                    id="tplFile"
                    required
                    type="file"
                    accept=".pptx,.pdf"
                    className={styles.input}
                    style={{ padding: '0.5rem 0' }}
                    onChange={(e) => updateField('file', e.target.files?.[0] || null)}
                  />
                </div>
              )}

              {/* Status + Home Page Order row */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="tplStatus">Status</label>
                  <select
                    id="tplStatus"
                    className={styles.select}
                    value={form.status}
                    onChange={(e) => updateField('status', e.target.value as 'active' | 'inactive')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="tplOrder">Home Page Order</label>
                  <input
                    id="tplOrder"
                    type="number"
                    min={1}
                    className={styles.input}
                    value={form.order}
                    onChange={(e) => updateField('order', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Show on Home Page */}
              <div
                className={`${styles.checkboxBox} ${form.isOnHomepage ? styles.checkboxBoxChecked : ''}`}
              >
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.isOnHomepage}
                    onChange={(e) => updateField('isOnHomepage', e.target.checked)}
                    aria-label="Show on Home Page"
                  />
                  Show on Home Page
                </label>
              </div>

              {/* PowerPoint warning */}
              <div className={styles.warning} role="note">
                <span>⚠️</span>
                <span>PowerPoint files with animations are not currently supported.</span>
              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? 'Save Changes' : 'Create Template'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingTemplate && (
        <div
          className={styles.overlay}
          onClick={() => setDeletingTemplate(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modal} style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Confirm Deletion</h2>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setDeletingTemplate(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px 0', fontSize: '16px', color: '#334155' }}>
              Are you sure you want to delete <strong>{deletingTemplate.name}</strong>?
            </div>
            <div className={styles.modalFooter} style={{ marginTop: '10px' }}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeletingTemplate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                style={{ backgroundColor: '#ef4444' }}
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
