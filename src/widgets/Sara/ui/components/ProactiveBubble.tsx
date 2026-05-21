'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useSaraStore } from '../../store/useSaraStore'
import { setGlobalMute } from '../../lib/cooldown'
import { useSaraActions } from '../../hooks/useSaraActions'
import styles from './ProactiveBubble.module.css'

export default function ProactiveBubble() {
  const proactiveTrigger = useSaraStore((state) => state.proactiveTrigger)
  const setProactiveTrigger = useSaraStore((state) => state.setProactiveTrigger)
  const toggleChat = useSaraStore((state) => state.toggleChat)
  const { startTour } = useSaraActions()

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!proactiveTrigger) return
    const timer = setTimeout(() => setProactiveTrigger(null), 15_000)
    return () => clearTimeout(timer)
  }, [proactiveTrigger, setProactiveTrigger])

  if (!proactiveTrigger) return null

  const handleDismiss = () => {
    setGlobalMute(1)
    setProactiveTrigger(null)
  }

  const handleAction = () => {
    const action = proactiveTrigger.content.action
    setProactiveTrigger(null)
    toggleChat()
    if (action.type === 'start_tour' && action.tourId) {
      startTour(action.tourId)
    }
  }

  return (
    <motion.div
      className={styles.bubble}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <button
        className={styles.dismiss}
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <div className={styles.content}>
        <div className={styles.avatar}>
          <Sparkles size={16} />
        </div>
        <div className={styles.body}>
          <p className={styles.message}>{proactiveTrigger.content.message}</p>
          <button className={styles.cta} onClick={handleAction}>
            {proactiveTrigger.content.ctaLabel}
          </button>
        </div>
      </div>

      <div className={styles.arrow} />
    </motion.div>
  )
}
