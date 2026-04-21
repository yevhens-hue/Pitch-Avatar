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

/** Extract YouTube video ID from watch or embed URLs */
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return match ? match[1] : null
}

export default function TutorialVideo({ videoUrl, title, stepLabel, onClose }: TutorialVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytId = getYouTubeId(videoUrl)
  const isYouTube = !!ytId
  const embedUrl = isYouTube
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
    : null

  // Pause native video on unmount
  useEffect(() => {
    if (!isYouTube) {
      return () => { videoRef.current?.pause() }
    }
  }, [isYouTube])

  // Reload native video when URL changes
  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      videoRef.current.load()
    }
  }, [videoUrl, isYouTube])

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
        {isYouTube ? (
          <iframe
            key={embedUrl}
            src={embedUrl!}
            className={styles.video}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        ) : (
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
        )}
      </div>
    </div>
  )
}
