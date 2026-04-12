'use client'

import React, { useState } from 'react'
import styles from './Editor.module.css'

const MOCK_SLIDES = [
  { id: 1, title: 'Введение' },
  { id: 2, title: 'Наши услуги' },
  { id: 3, title: 'Контакты' }
]

export default function StudioEditor() {
  const [activeSlide, setActiveSlide] = useState(1)
  const [script, setScript] = useState('')
  const [isRendering, setIsRendering] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const handleRender = () => {
    setIsRendering(true)
    setTimeout(() => {
      setIsRendering(false)
      setIsFinished(true)
    }, 4000)
  }

  if (isRendering) {
    return (
      <div className={styles.renderingOverlay}>
         <div className={styles.loader}></div>
         <h2>Ваше видео генерируется...</h2>
         <p>ИИ-аватар произносит ваш текст и синхронизирует губы со слайдами.</p>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className={styles.finishedContainer}>
         <div className={styles.successBadge}>✓ Готово</div>
         <h1>Видео успешно создано!</h1>
         <div className={styles.videoPlayer}>
            <div className={styles.playIcon}>▶</div>
            <p>Превью вашего ИИ-видео</p>
         </div>
         <div className={styles.finishedActions}>
            <button className={styles.primaryBtn}>Опубликовать</button>
            <button className={styles.secondaryBtn} onClick={() => setIsFinished(false)}>Редактировать</button>
         </div>
      </div>
    )
  }

  return (
    <div className={styles.editor}>
      {/* Левая панель: Слайды */}
      <aside className={styles.slidesPanel}>
        {MOCK_SLIDES.map((slide) => (
          <div 
            key={slide.id} 
            className={`${styles.slideThumbnail} ${activeSlide === slide.id ? styles.activeThumbnail : ''}`}
            onClick={() => setActiveSlide(slide.id)}
          >
            <div className={styles.slideNumber}>{slide.id}</div>
            <div className={styles.slidePreview}>Slide {slide.id}</div>
          </div>
        ))}
        <button className={styles.addSlideBtn}>+</button>
      </aside>

      {/* Центральная часть: Превью слайда */}
      <main className={styles.mainPreview}>
        <div className={styles.slideContainer}>
           <div className={styles.avatarOverlay}>
             <div className={styles.avatarPlaceholder}>AI Avatar</div>
           </div>
           <div className={styles.slideContent}>
             <h1>Слайд {activeSlide}</h1>
             <p>Предварительный просмотр содержимого презентации...</p>
           </div>
        </div>
      </main>

      {/* Правая панель: Настройки ИИ */}
      <aside className={styles.settingsPanel}>
        <div className={styles.section}>
          <h3>ИИ-Аватар</h3>
          <div className={styles.avatarGrid}>
            <div className={styles.avatarCircleActive}>👨‍💼</div>
            <div className={styles.avatarCircle}>👩‍💼</div>
            <div className={styles.avatarCircle}>🤵</div>
            <div className={styles.avatarCircle}>+</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Текст для озвучки</h3>
          <textarea 
            className={styles.scriptInput} 
            placeholder="Напишите здесь, что должен сказать аватар на этом слайде..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
          <div className={styles.charCount}>{script.length} / 500</div>
        </div>

        <div className={styles.section}>
          <h3>Голос и язык</h3>
          <select className={styles.select}>
            <option>Русский (Дмитрий, Спокойный)</option>
            <option>Английский (Alex, Professional)</option>
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.renderBtn} onClick={handleRender}>Сгенерировать видео</button>
        </div>
      </aside>
    </div>
  )
}
