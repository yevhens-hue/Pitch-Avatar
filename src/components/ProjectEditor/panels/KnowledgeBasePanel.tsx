'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import styles from './KnowledgeBasePanel.module.css'

type KbTab = 'file' | 'link' | 'text'

interface KbEntry {
  id: string
  name: string
  type: string
  size: string
  status: 'ready' | 'processing' | 'error'
  addedAt: string
}

const MOCK_KB: KbEntry[] = [
  { id: '1', name: 'product-overview.pdf', type: 'PDF', size: '1.2 MB', status: 'ready', addedAt: '02.05.2026' },
  { id: '2', name: 'faq-document.docx', type: 'DOCX', size: '342 KB', status: 'ready', addedAt: '01.05.2026' },
  { id: '3', name: 'pricing-2026.pdf', type: 'PDF', size: '800 KB', status: 'processing', addedAt: '29.04.2026' },
]

interface KnowledgeBasePanelProps {
  projectId?: string
}

const KnowledgeBasePanel: React.FC<KnowledgeBasePanelProps> = () => {
  const [activeTab, setActiveTab] = useState<KbTab>('file')
  const [linkText, setLinkText] = useState('')
  const [customText, setCustomText] = useState('')
  const [useWebImages, setUseWebImages] = useState(false)
  const [kbEntries, setKbEntries] = useState<KbEntry[]>(MOCK_KB)

  const removeEntry = (id: string) => {
    setKbEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Knowledge Base</h2>
        <p className={styles.panelSubtitle}>Upload files or links that your avatar will reference to answer questions accurately.</p>
      </div>

      <div className={styles.panelBody}>
        {/* ── Tabs ── */}
        <div className={styles.tabRow}>
          {(['file', 'link', 'text'] as KbTab[]).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`kb-tab-${tab}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── File tab ── */}
        {activeTab === 'file' && (
          <>
            <div className={styles.infoBox}>
              <span>ⓘ</span>
              <p>Upload files that can serve as a knowledge source for your Chat Avatar. This information will improve your avatar&apos;s responses during conversations.</p>
            </div>
            <div className={styles.dropZone}>
              <div className={styles.dropLeft}>
                <p className={styles.dropTitle}>Drag and drop files here</p>
                <button className={styles.dropLink}>or click to select</button>
              </div>
              <div className={styles.dropDivider} />
              <div className={styles.dropRight}>
                <p className={styles.dropSelectLabel}>Select from</p>
                <div className={styles.driveBtn}>
                  <span>📁</span> Google Drive
                </div>
              </div>
            </div>
            <p className={styles.hint}>Upload a .pdf, .ppt, .pptx, .doc, .docx, .mp4, or .mp3 file up to 100 MB</p>
          </>
        )}

        {/* ── Link tab ── */}
        {activeTab === 'link' && (
          <>
            <div className={styles.infoBox}>
              <span>ⓘ</span>
              <p>Your chat avatar can visit and analyze all pages in this group to provide detailed, context-aware answers.</p>
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
              <div className={styles.fieldRow}>
                <label className={styles.label} htmlFor="kb-link-input">
                  Link Group <span className={styles.infoIcon}>ⓘ</span>
                </label>
                <button className={styles.linkBtn}>+ Upload File</button>
              </div>
              <textarea
                id="kb-link-input"
                className={styles.textarea}
                placeholder="Paste your links here, one per line"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
              />
              <p className={styles.hint}>{50000 - linkText.length}/50000 remaining characters. Internal links will not work.</p>
            </div>
            <div className={styles.checkRow}>
              <input
                type="checkbox"
                id="kb-use-web-images"
                checked={useWebImages}
                onChange={e => setUseWebImages(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="kb-use-web-images" className={styles.checkLabel}>
                Use web images for answers <span className={styles.infoIcon}>ⓘ</span>
              </label>
            </div>
          </>
        )}

        {/* ── Text tab ── */}
        {activeTab === 'text' && (
          <>
            <div className={styles.infoBox}>
              <span>ⓘ</span>
              <p>Enter text here to provide your avatar with a knowledge source to answer your audience.</p>
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

        {/* ── Add button ── */}
        <button className={styles.addBtn} id="kb-add-btn">Add</button>

        {/* ── KB Table ── */}
        {kbEntries.length > 0 && (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Status</span>
              <span>Added</span>
              <span />
            </div>
            {kbEntries.map(entry => (
              <div key={entry.id} className={styles.tableRow}>
                <span className={styles.fileName}>{entry.name}</span>
                <span className={styles.cell}>{entry.type}</span>
                <span className={styles.cell}>{entry.size}</span>
                <span className={styles.cell}>
                  <span className={`${styles.status} ${entry.status === 'ready' ? styles.statusReady : entry.status === 'processing' ? styles.statusProcessing : styles.statusError}`}>
                    {entry.status === 'ready' && '● ready'}
                    {entry.status === 'processing' && '◌ processing'}
                    {entry.status === 'error' && '✕ error'}
                  </span>
                </span>
                <span className={styles.cell}>{entry.addedAt}</span>
                <span className={styles.cellActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeEntry(entry.id)}
                    aria-label={`Remove ${entry.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default KnowledgeBasePanel
