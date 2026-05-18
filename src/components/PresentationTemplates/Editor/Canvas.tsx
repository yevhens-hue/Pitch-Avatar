'use client'

import React from 'react'
import { Info } from 'lucide-react'
import { SelectedElement } from './TemplateEditor'
import styles from './Canvas.module.css'

interface CanvasProps {
  selectedElement: SelectedElement
  onSelectElement: (el: SelectedElement) => void
}

export default function Canvas({ selectedElement, onSelectElement }: CanvasProps) {
  // Mock elements for the canvas
  const mockElements: NonNullable<SelectedElement>[] = [
    { id: 'img-1', type: 'image', x: 200, y: 100, w: 300, h: 200 },
    { id: 'txt-1', type: 'bubble', x: 550, y: 150, w: 250, h: 100, content: 'Title: test\nrandom text for testing' }
  ]

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null)
    }
  }

  return (
    <div className={styles.canvasArea} onClick={handleCanvasClick}>
      <div className={styles.canvasContainer}>
        {/* Slide Canvas 16:9 */}
        <div className={styles.slideCanvas} onClick={handleCanvasClick}>
          {mockElements.map(el => {
            const isSelected = selectedElement?.id === el.id
            return (
              <div 
                key={el.id}
                className={`${styles.element} ${isSelected ? styles.selected : ''}`}
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.w,
                  height: el.h,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectElement(el)
                }}
              >
                {el.type === 'image' && (
                  <div className={styles.mockImage}>
                    <div className={styles.starryBg}></div>
                  </div>
                )}
                
                {el.type === 'bubble' && (
                  <div className={styles.mockBubble}>
                    <strong>test</strong>
                    <p>random text for testing</p>
                  </div>
                )}

                {/* Bounding box handles for selected element */}
                {isSelected && (
                  <>
                    <div className={`${styles.handle} ${styles.nw}`} />
                    <div className={`${styles.handle} ${styles.n}`} />
                    <div className={`${styles.handle} ${styles.ne}`} />
                    <div className={`${styles.handle} ${styles.e}`} />
                    <div className={`${styles.handle} ${styles.se}`} />
                    <div className={`${styles.handle} ${styles.s}`} />
                    <div className={`${styles.handle} ${styles.sw}`} />
                    <div className={`${styles.handle} ${styles.w}`} />
                    
                    <div className={styles.rotateHandleWrapper}>
                      <div className={styles.rotateLine} />
                      <div className={styles.rotateHandle} />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Slide global options */}
        <div className={styles.slideOptions}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Финальный слайд
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Слайд для питча
            <Info size={16} color="#9ca3af" />
          </label>
        </div>
      </div>
    </div>
  )
}
