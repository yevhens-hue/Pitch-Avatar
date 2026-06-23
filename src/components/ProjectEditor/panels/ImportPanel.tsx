'use client'

import React, { useState } from 'react'
import { FileText, Video, ChevronDown } from 'lucide-react'
import styles from './ImportPanel.module.css'

type ImportType = 'presentation' | 'video'

interface ImportPanelProps {
  projectId?: string
}

const ImportPanel: React.FC<ImportPanelProps> = () => {
  const [activeType, setActiveType] = useState<ImportType>('presentation')
  const [isDragging, setIsDragging] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [slideLimit, setSlideLimit] = useState('100')
  const [language, setLanguage] = useState('Auto-detect')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // handle dropped files
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Import content</h2>
        <p className={styles.panelSubtitle}>Upload a presentation or a video to generate slides automatically.</p>
      </div>

      <div className={styles.panelBody}>
        {/* Type tabs — styled exactly like Lovable */}
        <div className={styles.typeTabs}>
          <button
            className={`${styles.typeTab} ${activeType === 'presentation' ? styles.typeTabActive : ''}`}
            onClick={() => setActiveType('presentation')}
            id="import-tab-presentation"
          >
            <FileText size={16} />
            Upload Presentation
          </button>
          <button
            className={`${styles.typeTab} ${activeType === 'video' ? styles.typeTabActive : ''}`}
            onClick={() => setActiveType('video')}
            id="import-tab-video"
          >
            <Video size={16} />
            Upload Video
          </button>
        </div>

        {/* Drop zone — two-column like Lovable */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.dropLeft}>
            <p className={styles.dropTitle}>Drag and drop here</p>
            <button
              className={styles.dropSelectLink}
              onClick={() => document.getElementById('import-file-input')?.click()}
            >
              or click to select
            </button>
            <input
              id="import-file-input"
              type="file"
              accept={activeType === 'presentation' ? '.pdf,.ppt,.pptx' : '.mp4,.mov,.webm'}
              style={{ display: 'none' }}
              aria-label={`Upload ${activeType}`}
            />
          </div>

          <div className={styles.dropDivider} />

          <div className={styles.dropRight}>
            <p className={styles.dropRightTitle}>Select from</p>
            <button className={styles.driveBtn} id="import-google-drive-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 19h5.5L12 11l4.5 8H22L12 2z" fill="#4285F4"/>
                <path d="M2 19l4-7 4.5 8H2z" fill="#34A853" opacity="0.7"/>
                <path d="M22 19l-4-7-4.5 8H22z" fill="#FBBC05" opacity="0.7"/>
              </svg>
              Google Drive
            </button>
          </div>
        </div>

        <p className={styles.hint}>
          {activeType === 'presentation'
            ? 'Upload a .pdf, .ppt, or .pptx file of up to 100 MB with no more than 100 slides'
            : 'Upload a .mp4, .mov, or .webm file of up to 2 GB'}
        </p>

        {/* Advanced settings */}
        <button
          className={styles.advancedToggle}
          onClick={() => setIsAdvancedOpen(v => !v)}
          id="import-advanced-toggle"
        >
          <ChevronDown
            size={16}
            className={`${styles.advancedChevron} ${isAdvancedOpen ? styles.advancedChevronOpen : ''}`}
          />
          Advanced settings
        </button>

        {isAdvancedOpen && (
          <div className={styles.advancedSection}>
            {activeType === 'presentation' && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="import-slide-limit">
                  Maximum slides to import
                </label>
                <input
                  id="import-slide-limit"
                  type="number"
                  className={styles.input}
                  value={slideLimit}
                  onChange={e => setSlideLimit(e.target.value)}
                  min="1"
                  max="200"
                />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="import-language">
                Content language
              </label>
              <select
                id="import-language"
                className={styles.select}
                value={language}
                onChange={e => setLanguage(e.target.value)}
              >
                <option>Auto-detect</option>
                <option>English</option>
                <option>Ukrainian</option>
                <option>Spanish</option>
                <option>German</option>
                <option>French</option>
              </select>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className={styles.warningBox}>
          <span>⚠️</span>
          <p>
            Importing a new file will replace the current{' '}
            {activeType === 'presentation' ? 'slides' : 'video'} content.
            This action cannot be undone.
          </p>
        </div>

        {/* Import action button */}
        <button className={styles.importBtn} id="import-submit-btn">
          <FileText size={16} />
          Import
        </button>
      </div>
    </div>
  )
}

export default ImportPanel
