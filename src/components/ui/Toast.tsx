'use client'

import React, { useEffect } from 'react'
import styles from './Toast.module.css'

export type ToastType = 'success' | 'error' | 'info' | 'link-updated'

interface ToastProps {
  message: string | React.ReactNode
  type?: ToastType
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      {type !== 'link-updated' && (
        <span className={styles.icon}>
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
      )}
      <span className={styles.message}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close notification">
        ✕
      </button>
    </div>
  )
}
