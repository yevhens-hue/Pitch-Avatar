'use client'

import React from 'react'
import { Plus, MoreVertical } from 'lucide-react'
import styles from './EditorSidebar.module.css'

interface EditorSidebarProps {
  activeSlideId: number
  onSelectSlide: (id: number) => void
  slidesCount: number
  slideTitles?: string[]
}

export default function EditorSidebar({ activeSlideId, onSelectSlide, slidesCount, slideTitles = [] }: EditorSidebarProps) {
  const slides = Array.from({ length: slidesCount || 1 }, (_, i) => i + 1)

  return (
    <div className={styles.sidebar}>
      <div className={styles.slidesList}>
        {slides.map(slide => (
          <div 
            key={slide}
            className={`${styles.slideWrapper} ${activeSlideId === slide ? styles.active : ''}`}
            onClick={() => onSelectSlide(slide)}
          >
            <span className={styles.slideNumber}>{slide}</span>
            <div className={styles.slideThumbnail}>
              <div className={styles.slideContent}>
                {slideTitles[slide - 1] || `Slide ${slide}`}
              </div>
              <button className={styles.slideMenuBtn} onClick={(e) => { e.stopPropagation(); }}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.addSlideWrapper}>
        <button className={styles.addSlideBtn}>
          <Plus size={24} />
        </button>
      </div>
    </div>
  )
}
