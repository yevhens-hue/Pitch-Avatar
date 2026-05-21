'use client'

import React, { useRef } from 'react'
import { Info } from 'lucide-react'
import { SelectedElement } from './TemplateEditor'
import styles from './Canvas.module.css'

interface CanvasProps {
  elements: SelectedElement[]
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<SelectedElement>) => void
}

export default function Canvas({ elements, selectedElementId, onSelectElement, onUpdateElement }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectElement(null)
    }
  }

  // --- DRAG (MOVE) LOGIC ---
  const handlePointerDownMove = (e: React.PointerEvent, el: SelectedElement) => {
    e.stopPropagation()
    onSelectElement(el.id)

    const startX = e.clientX
    const startY = e.clientY
    const startElX = el.x
    const startElY = el.y

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      onUpdateElement(el.id, {
        x: Math.round(startElX + dx),
        y: Math.round(startElY + dy)
      })
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  // --- RESIZE LOGIC ---
  const handlePointerDownResize = (e: React.PointerEvent, el: SelectedElement, direction: string) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startW = el.w
    const startH = el.h
    const startElX = el.x
    const startElY = el.y

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      let newW = startW
      let newH = startH
      let newX = startElX
      let newY = startElY

      if (direction.includes('e')) newW = startW + dx
      if (direction.includes('s')) newH = startH + dy
      if (direction.includes('w')) {
        newW = startW - dx
        newX = startElX + dx
      }
      if (direction.includes('n')) {
        newH = startH - dy
        newY = startElY + dy
      }

      // Min size limits
      if (newW < 20) { newW = 20; newX = el.x }
      if (newH < 20) { newH = 20; newY = el.y }

      onUpdateElement(el.id, {
        w: Math.round(newW),
        h: Math.round(newH),
        x: Math.round(newX),
        y: Math.round(newY)
      })
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return (
    <div className={styles.canvasArea} onClick={handleCanvasClick}>
      <div className={styles.canvasContainer}>
        {/* Slide Canvas 16:9 */}
        <div className={styles.slideCanvas} ref={canvasRef} onClick={handleCanvasClick}>
          {elements.map(el => {
            const isSelected = selectedElementId === el.id
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
                onPointerDown={(e) => handlePointerDownMove(e, el)}
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
                    <div className={`${styles.handle} ${styles.nw}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'nw')} />
                    <div className={`${styles.handle} ${styles.n}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'n')} />
                    <div className={`${styles.handle} ${styles.ne}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'ne')} />
                    <div className={`${styles.handle} ${styles.e}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'e')} />
                    <div className={`${styles.handle} ${styles.se}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'se')} />
                    <div className={`${styles.handle} ${styles.s}`} onPointerDown={(e) => handlePointerDownResize(e, el, 's')} />
                    <div className={`${styles.handle} ${styles.sw}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'sw')} />
                    <div className={`${styles.handle} ${styles.w}`} onPointerDown={(e) => handlePointerDownResize(e, el, 'w')} />
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Slide global options */}
        <div className={styles.slideOptions}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Final Slide
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Pitch Slide
            <Info size={16} color="#9ca3af" />
          </label>
        </div>
      </div>
    </div>
  )
}
