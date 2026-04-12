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
        <h1>Создать новую презентацию</h1>
        <p>Загрузите файл или выберите источник, чтобы оживить ваши слайды ИИ-аватаром</p>
      </header>

      <div className={styles.mainGrid}>
        <div
          className={`${styles.dropzone} ${isHovering ? styles.dropzoneActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsHovering(false)}
          onDrop={handleDrop}
        >
          <div className={styles.uploadIcon}>📄</div>
          <h2>Загрузить PDF или PPTX</h2>
          <p>или перетащите файл сюда</p>
          <label className={styles.uploadBtn}>
             Выбрать файл
             <input type="file" hidden accept={ACCEPTED_UPLOAD_EXTENSIONS} onChange={handleFileChange} />
          </label>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sourceCard}>
            <span className={styles.sourceIcon}>C</span>
            <span>Импорт из Canva</span>
          </div>
          <div className={styles.sourceCard}>
            <span className={styles.sourceIcon}>G</span>
            <span>Google Slides</span>
          </div>
          <div className={styles.sourceCard}>
            <span className={styles.sourceIcon}>P</span>
            <span>Импорт с сайта / Прези</span>
          </div>
          <div className={styles.divider}>или</div>
          <button className={styles.emptyBtn}>Создать с нуля</button>
        </div>
      </div>
    </div>
  )
}
