'use client'

import React from 'react'
import styles from './UploadStep.module.css'
import { ACCEPTED_UPLOAD_EXTENSIONS } from '@/constants'
import { useFileUpload } from '@/hooks'

interface UploadStepProps {
  onNext: (file: File) => void
}

export default function UploadStep({ onNext }: UploadStepProps) {
  const { isHovering, setIsHovering, handleFileChange, handleDrop, handleDragOver } = useFileUpload({
    onFile: onNext,
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Create New Presentation</h1>
        <p>Upload a file or choose a source to bring your slides to life with an AI avatar</p>
      </header>

      <div className={styles.mainGrid}>
        <div
          className={`${styles.dropzone} ${isHovering ? styles.dropzoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsHovering(false)}
          onDrop={handleDrop}
        >
          <div className={styles.uploadIcon}>📄</div>
          <h2>Upload PDF or PPTX</h2>
          <p>or drag & drop file here</p>
          <label className={styles.uploadBtn}>
             Choose File
             <input type="file" hidden accept={ACCEPTED_UPLOAD_EXTENSIONS} onChange={handleFileChange} />
          </label>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sourceCard}>
            <span className={styles.sourceIcon}>C</span>
            <span>Canva Import</span>
          </div>
          <div className={styles.sourceCard}>
            <span className={styles.sourceIcon}>G</span>
            <span>Google Slides</span>
          </div>
          <div className={styles.sourceCard}>
            <span className={styles.sourceIcon}>P</span>
            <span>Website / Prezi Import</span>
          </div>
          <div className={styles.divider}>or</div>
          <button className={styles.emptyBtn}>Create from scratch</button>
        </div>
      </div>
    </div>
  )
}
