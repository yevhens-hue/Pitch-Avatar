import React from 'react'
import styles from './Skeleton.module.css'

interface SkeletonProps {
  lines?: number
  width?: string
  height?: string
  variant?: 'text' | 'circle' | 'rect'
}

export default function Skeleton({ lines = 3, width, height, variant = 'text' }: SkeletonProps) {
  if (variant !== 'text') {
    return (
      <div
        className={styles.skeleton}
        style={{
          width: width || (variant === 'circle' ? '40px' : '100%'),
          height: height || (variant === 'circle' ? '40px' : '20px'),
          borderRadius: variant === 'circle' ? '50%' : '8px',
        }}
      />
    )
  }

  return (
    <div className={styles.container}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={styles.skeleton}
          style={{
            width: i === lines - 1 ? '60%' : width || '100%',
            height: height || '14px',
          }}
        />
      ))}
    </div>
  )
}
