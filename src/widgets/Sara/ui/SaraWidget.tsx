'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useSaraStore } from '../store/useSaraStore'
import { captureSaraEvent } from '../analytics/posthog'
import { useAuth } from '@/context/AuthContext'
import { useSaraIdleDetector } from '../hooks/useSaraIdleDetector'
import { useSaraEventDetector } from '../hooks/useSaraEventDetector'
import ProactiveBubble from './components/ProactiveBubble'
import ChatPanel from './components/ChatPanel'
import styles from './SaraWidget.module.css'

export default function SaraWidget() {
  const pathname = usePathname()
  const { user } = useAuth()
  const mainGoal = user?.user_metadata?.main_goal ?? null

  const { isOpen, isDismissed, proactiveTrigger, toggleChat } = useSaraStore()

  useSaraIdleDetector(pathname, mainGoal)
  useSaraEventDetector(pathname, mainGoal)

  useEffect(() => {
    captureSaraEvent('chat_avatar_rendered', { screen: pathname, main_goal: mainGoal })
  }, [pathname, mainGoal])

  if (isDismissed) return null

  const handleFabClick = () => {
    toggleChat()
    captureSaraEvent(isOpen ? 'chat_avatar_closed' : 'chat_avatar_opened', {
      screen: pathname,
      main_goal: mainGoal,
    })
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
    </div>
  )
}
