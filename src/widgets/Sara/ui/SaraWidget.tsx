'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useSaraStore } from '../store/useSaraStore'
import ProactiveBubble from './components/ProactiveBubble'
import ChatPanel from './components/ChatPanel'
import styles from './SaraWidget.module.css'

export default function SaraWidget() {
  const { isOpen, isDismissed, proactiveTrigger, toggleChat, config } = useSaraStore()

  if (isDismissed) return null

  const handleFabClick = () => {
    toggleChat()
    // Posthog analytics moved to Container / Store event listeners to decouple widget
  }

  return (
    <div className={styles.container}>
      {/* ── Chat panel (stacks above FAB) ──────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <ChatPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Proactive bubble (stacks above FAB when not open) */}
      <AnimatePresence>
        {!isOpen && proactiveTrigger && (
          <ProactiveBubble key="proactive-bubble" />
        )}
      </AnimatePresence>

      {/* ── FAB — always visible ──────────────────────── */}
      {!config.hideFab && (
        <button
          className={styles.fab}
          onClick={handleFabClick}
          aria-label={isOpen ? 'Close Sara' : 'Open Sara AI assistant'}
        >
          {isOpen ? (
            <X size={20} color="#6366f1" />
          ) : (
            <Sparkles size={20} color="#6366f1" />
          )}
          {!isOpen && proactiveTrigger && <span className={styles.fabPulse} />}
        </button>
      )}
    </div>
  )
}
