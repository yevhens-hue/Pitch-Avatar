'use client'

import React, { useState } from 'react'
import { UploadCloud, FileText, Video } from 'lucide-react'
import styles from './ImportPanel.module.css'

type ImportType = 'presentation' | 'video'

interface ImportPanelProps {
  projectId?: string
}

const ImportPanel: React.FC<ImportPanelProps> = () => {
  const [activeType, setActiveType] = useState<ImportType>('presentation')
  const [isDragging, setIsDragging] = useState(false)

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
        <h2 className={styles.panelTitle}>Import</h2>
        <p className={styles.panelSubtitle}>Upload a presentation file or video to replace current project content.</p>
      </div>

      <div className={styles.panelBody}>
        {/* Type selector */}
        <div className={styles.typeSelector}>
          <button
            className={`${styles.typeCard} ${activeType === 'presentation' ? styles.typeCardActive : ''}`}
            onClick={() => setActiveType('presentation')}
            id="import-type-presentation"
          >
            <FileText size={28} className={styles.typeIcon} />
            <span className={styles.typeName}>Upload Presentation</span>
            <span className={styles.typeDesc}>PDF, PPT, PPTX up to 100 MB</span>
          </button>
          <button
            className={`${styles.typeCard} ${activeType === 'video' ? styles.typeCardActive : ''}`}
            onClick={() => setActiveType('video')}
            id="import-type-video"
          >
            <Video size={28} className={styles.typeIcon} />
            <span className={styles.typeName}>Upload Video</span>
            <span className={styles.typeDesc}>MP4, MOV, WebM up to 2 GB</span>
          </button>
        </div>

        {/* Drop zone */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud size={40} className={styles.uploadIcon} />
          <p className={styles.dropTitle}>
            Drag and drop your {activeType === 'presentation' ? 'presentation' : 'video'} here
          </p>
          <p className={styles.dropOr}>or</p>
          <button className={styles.browseBtn} id="import-browse-btn">
            Browse files
          </button>
          <p className={styles.dropHint}>
            {activeType === 'presentation'
              ? 'Supports .pdf, .ppt, .pptx — up to 100 slides, 100 MB max'
              : 'Supports .mp4, .mov, .webm — up to 2 GB max'}
          </p>
        </div>

        {/* Also import from Google Drive */}
        <div className={styles.sourceRow}>
          <span className={styles.sourceLabel}>Or import from:</span>
          <button className={styles.sourceBtn} id="import-google-drive-btn">
            <span>📁</span> Google Drive
          </button>
          <button className={styles.sourceBtn} id="import-url-btn">
            <span>🔗</span> URL
          </button>
        </div>

        {/* Info */}
        <div className={styles.infoBox}>
          <span>⚠️</span>
          <p>Importing a new file will replace the current {activeType === 'presentation' ? 'slides' : 'video'} content. This action cannot be undone.</p>
        </div>
      </div>
    </div>
  )
}

export default ImportPanel
