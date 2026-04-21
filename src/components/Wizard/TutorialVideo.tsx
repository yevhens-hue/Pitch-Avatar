'use client'

import React, { useRef, useEffect } from 'react'
import { X, PlayCircle } from 'lucide-react'
import styles from './TutorialVideo.module.css'

interface TutorialVideoProps {
  videoUrl: string
  title: string
  stepLabel: string
  onClose: () => void
}

export default function TutorialVideo({ videoUrl, title, stepLabel, onClose }: TutorialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Pause video on unmount
  useEffect(() => {
    return () => {
      videoRef.current?.pause()
    }
  }, [])

  // Reload when URL changes (step change)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [videoUrl])

  return (
    <div className={styles.widget} role="dialog" aria-label="Tutorial video">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBadge}>
            <PlayCircle size={14} />
          </div>
          <div>
            <div className={styles.stepLabel}>{stepLabel}</div>
            <div className={styles.title}>{title}</div>
          </div>
        </div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close tutorial"
        >
          <X size={16} />
        </button>
      </div>

      {/* Video */}
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          controls
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  )
}
