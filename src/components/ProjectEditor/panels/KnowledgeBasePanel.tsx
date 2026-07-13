'use client'

import React, { useState } from 'react'
import { Trash2, Settings2, Link2, FileText, Plus, Search, X } from 'lucide-react'
import styles from './KnowledgeBasePanel.module.css'

type KbSourceType = 'file' | 'link' | 'text' | 'qa'

import { getProjectKnowledge } from '@/app/actions/knowledge'
import { KnowledgeItem } from '@/types'

interface KnowledgeBasePanelProps {
  projectId?: string
  hideHeader?: boolean
}

type AddTab = 'file' | 'link' | 'text'

const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = ({ projectId, hideHeader }) => {
  const [kbEntries, setKbEntries] = useState<KnowledgeItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  React.useEffect(() => {
    if (projectId) {
      setIsLoading(true)
      getProjectKnowledge(projectId)
        .then(data => setKbEntries(data))
        .finally(() => setIsLoading(false))
    }
  }, [projectId])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addTab, setAddTab] = useState<AddTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [useWebImages, setUseWebImages] = useState(false)

  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === kbEntries.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(kbEntries.map(e => e.id)))
    }
  }

  const requestDelete = (id: number) => {
    setEntryToDelete(id)
  }

  const confirmDelete = () => {
    if (entryToDelete) {
      setKbEntries(prev => prev.filter(e => e.id !== entryToDelete))
      setSelected(prev => { const n = new Set(prev); n.delete(entryToDelete); return n })
      setEntryToDelete(null)
    }
  }

  const cancelDelete = () => {
    setEntryToDelete(null)
  }

  const filtered = kbEntries.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'Text / Web') return <span className={styles.typeIconT}>T</span>
    if (type === 'link') return <Link2 size={14} className={styles.typeIconLink} />
    return <FileText size={14} className={styles.typeIconFile} />
  }

  return (
    <div className={styles.panel}>
      {!hideHeader && (
        <div className={styles.panelHeader}>
          <div className={styles.headerTop}>
            <div>
              <h2 className={styles.panelTitle}>Knowledge Base</h2>
              <p className={styles.panelSubtitle}>A collection of source materials used to enhance the avatar&apos;s expertise and response accuracy.</p>
            </div>
            <button
              className={styles.addSourceBtn}
              onClick={() => setShowAddModal(true)}
              id="kb-add-source-btn"
            >
              <Plus size={16} /> Add Knowledge Source
            </button>
          </div>
        </div>
      )}

      <div className={styles.panelBody}>
        {/* Search */}
        <div className={styles.searchRow}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search knowledge sources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search knowledge sources"
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span className={styles.colCheck}>
              <input
                type="checkbox"
                checked={selected.size === kbEntries.length && kbEntries.length > 0}
                onChange={toggleAll}
                aria-label="Select all"
              />
            </span>
            <span className={styles.colName}>Source name</span>
            <span className={styles.colCreated}>Created</span>
            <span className={styles.colType}>Type</span>
            <span className={styles.colLang}>Language</span>
            <span className={styles.colAccess}>Access Type</span>
            <span className={styles.colResults}>Results</span>
            <span className={styles.colActions}>Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>No knowledge sources found.</div>
          ) : (
            filtered.map(entry => (
              <div
                key={entry.id}
                className={`${styles.tableRow} ${selected.has(entry.id) ? styles.rowSelected : ''}`}
              >
                <span className={styles.colCheck}>
                  <input
                    type="checkbox"
                    checked={selected.has(entry.id)}
                    onChange={() => toggleSelect(entry.id)}
                    aria-label={`Select ${entry.name}`}
                  />
                </span>
                <span className={styles.colName}>
                  <TypeIcon type={entry.type} />
                  <span className={styles.sourceName} title={entry.name}>{entry.name}</span>
                </span>
                <span className={styles.colCreated}>{entry.date}</span>
                <span className={styles.colType}>
                  <TypeIcon type={entry.type} />
                </span>
                <span className={styles.colLang}>English</span>
                <span className={styles.colAccess}>personal</span>
                <span className={`${styles.colResults}`}>—</span>
                <span className={styles.colActions}>
                  <button
                    className={styles.actionBtn}
                    aria-label={`Settings for ${entry.name}`}
                  >
                    <Settings2 size={15} />
                  </button>
                  <button
                    className={styles.actionBtnDanger}
                    onClick={() => requestDelete(entry.id)}
                    aria-label={`Remove ${entry.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {entryToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={styles.modal}
            style={{ width: '400px', minHeight: 'auto' }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Confirm Deletion"
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete source?</h2>
              <button
                className={styles.closeBtn}
                onClick={cancelDelete}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody} style={{ padding: '1rem 1.5rem' }}>
              <p>Are you sure you want to delete this source from the knowledge base? This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.actionBtnDanger} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }} onClick={confirmDelete}>Delete</button>
              <button className={styles.cancelBtn} onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Knowledge Source Modal ── */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div
            className={styles.modal}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Add Knowledge Source"
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Knowledge Source</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal tabs */}
            <div className={styles.modalTabs}>
              {(['file', 'link', 'text'] as AddTab[]).map(tab => (
                <button
                  key={tab}
                  className={`${styles.modalTab} ${addTab === tab ? styles.modalTabActive : ''}`}
                  onClick={() => setAddTab(tab)}
                  id={`kb-modal-tab-${tab}`}
                >
                  {tab === 'file' ? 'File' : tab === 'link' ? 'Link / URL' : 'Text / QA'}
                </button>
              ))}
            </div>

            <div className={styles.modalBody}>
              {/* File tab */}
              {addTab === 'file' && (
                <>
                  <div className={styles.infoBox}>
                    <span>ⓘ</span>
                    <p>Upload files that can serve as a knowledge source. Supports PDF, DOC, DOCX, MP3, MP4 — up to 100 MB.</p>
                  </div>
                  <div
                    className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false) }}
                  >
                    <div className={styles.dropLeft}>
                      <p className={styles.dropTitle}>Drag and drop here</p>
                      <button className={styles.dropLink}>or click to select</button>
                    </div>
                    <div className={styles.dropDivider} />
                    <div className={styles.dropRight}>
                      <p className={styles.dropSelectLabel}>Select from</p>
                      <button className={styles.driveBtn} id="kb-google-drive-btn">
                        <span>📁</span> Google Drive
                      </button>
                    </div>
                  </div>
                  <p className={styles.hint}>Upload a .pdf, .doc, .docx, .mp4, or .mp3 file up to 100 MB</p>
                </>
              )}

              {/* Link tab */}
              {addTab === 'link' && (
                <>
                  <div className={styles.infoBox}>
                    <span>ⓘ</span>
                    <p>Your avatar can visit and analyze all pages in this group to provide detailed, context-aware answers.</p>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="kb-link-type">Link Type</label>
                    <select id="kb-link-type" className={styles.select}>
                      <option>Link Group</option>
                      <option>Single URL</option>
                      <option>Sitemap</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="kb-link-input">URLs <span className={styles.infoIcon}>ⓘ</span></label>
                    <textarea
                      id="kb-link-input"
                      className={styles.textarea}
                      placeholder="Paste your links here, one per line"
                      value={linkText}
                      onChange={e => setLinkText(e.target.value)}
                    />
                    <p className={styles.hint}>{50000 - linkText.length}/50000 remaining characters.</p>
                  </div>
                  <div className={styles.checkRow}>
                    <input
                      type="checkbox"
                      id="kb-use-web-images"
                      checked={useWebImages}
                      onChange={e => setUseWebImages(e.target.checked)}
                    />
                    <label htmlFor="kb-use-web-images" className={styles.checkLabel}>
                      Use web images for answers <span className={styles.infoIcon}>ⓘ</span>
                    </label>
                  </div>
                </>
              )}

              {/* Text tab */}
              {addTab === 'text' && (
                <>
                  <div className={styles.infoBox}>
                    <span>ⓘ</span>
                    <p>Enter text or Q&A pairs to provide your avatar with custom knowledge.</p>
                  </div>
                  <textarea
                    id="kb-text-input"
                    className={styles.textarea}
                    style={{ minHeight: 200 }}
                    placeholder="Paste or type your knowledge base content here…"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                  />
                  <p className={styles.hint}>{customText.length}/50000 characters</p>
                </>
              )}
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

export default KnowledgeBasePanel
