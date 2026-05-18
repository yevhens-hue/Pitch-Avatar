'use client'

import React from 'react'
import { Plus, MoreVert } from 'lucide-react'
import styles from './EditorSidebar.module.css'

interface EditorSidebarProps {
  activeSlideId: number
  onSelectSlide: (id: number) => void
}

export default function EditorSidebar({ activeSlideId, onSelectSlide }: EditorSidebarProps) {
  const slides = [1, 2]

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
              <div className={styles.slideContent}>Slide {slide}</div>
              <button className={styles.slideMenuBtn} onClick={(e) => { e.stopPropagation(); }}>
                <MoreVert size={16} />
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
