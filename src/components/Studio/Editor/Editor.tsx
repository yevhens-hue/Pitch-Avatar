'use client'

import React, { useState } from 'react'
import styles from './Editor.module.css'

const MOCK_SLIDES = [
  { id: 1, title: 'Introduction' },
  { id: 2, title: 'Our Services' },
  { id: 3, title: 'Contacts' }
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
         <h2>Your video is being generated...</h2>
         <p>AI avatar is speaking your text and lip-syncing with the slides.</p>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className={styles.finishedContainer}>
         <div className={styles.successBadge}>✓ Ready</div>
         <h1>Video created successfully!</h1>
         <div className={styles.videoPlayer}>
            <div className={styles.playIcon}>▶</div>
            <p>Preview of your AI video</p>
         </div>
         <div className={styles.finishedActions}>
            <button className={styles.primaryBtn}>Publish</button>
            <button className={styles.secondaryBtn} onClick={() => setIsFinished(false)}>Edit</button>
         </div>
      </div>
    )
  }

  return (
    <div className={styles.editor}>
      {/* Left panel: Slides */}
      <aside className={styles.slidesPanel}>
        {MOCK_SLIDES.map((slide) => (
          <div 
            key={slide.id} 
            className={`${styles.slideThumbnail} ${activeSlide === slide.id ? styles.activeThumbnail : ''}`}
            onClick={() => setActiveSlide(slide.id)}
            id={`stonly-editor-slide-${slide.id}`}
          >
            <div className={styles.slideNumber}>{slide.id}</div>
            <div className={styles.slidePreview}>Slide {slide.id}</div>
          </div>
        ))}
        <button className={styles.addSlideBtn}>+</button>
      </aside>

      {/* Center: Slide Preview */}
      <main className={styles.mainPreview}>
        <div className={styles.slideContainer}>
           <div className={styles.avatarOverlay}>
             <div className={styles.avatarPlaceholder}>AI Avatar</div>
           </div>
           <div className={styles.slideContent}>
             <h1>Slide {activeSlide}</h1>
             <p>Presentation content preview...</p>
           </div>
        </div>
      </main>

      {/* Right panel: AI Settings */}
      <aside className={styles.settingsPanel}>
        <div className={styles.section}>
          <h3>AI Avatar</h3>
          <div className={styles.avatarGrid} id="stonly-editor-avatar-grid">
            <div className={styles.avatarCircleActive} id="stonly-editor-avatar-1">👨‍💼</div>
            <div className={styles.avatarCircle} id="stonly-editor-avatar-2">👩‍💼</div>
            <div className={styles.avatarCircle} id="stonly-editor-avatar-3">🤵</div>
            <div className={styles.avatarCircle}>+</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Speech Script</h3>
          <textarea 
            className={styles.scriptInput} 
            id="stonly-editor-script-input"
            placeholder="Write here what the avatar should say on this slide..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
          />
          <div className={styles.charCount}>{script.length} / 500</div>
        </div>

        <div className={styles.section}>
          <h3>Voice & Language</h3>
          <select className={styles.select} id="stonly-editor-language-select">
            <option>English (Alex, Professional)</option>
            <option>Spanish (Maria, Friendly)</option>
          </select>
        </div>

        <div className={styles.footer}>
          <button className={styles.renderBtn} id="stonly-editor-generate-btn" onClick={handleRender}>Generate Video</button>
        </div>
      </aside>
    </div>
  )
}
