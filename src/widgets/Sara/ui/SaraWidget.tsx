'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
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

  // Permanently dismissed for this session — render nothing
  if (isDismissed) return null

  const handleFabClick = () => {
    toggleChat()
    captureSaraEvent('chat_avatar_opened', { screen: pathname, main_goal: mainGoal })
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {isOpen ? (
          /* ── Expanded chat panel ───────────────────────── */
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <ChatPanel />
          </motion.div>
        ) : (
          /* ── Collapsed FAB + proactive bubble ──────────── */
          <motion.div
            key="fab-area"
            className={styles.fabWrapper}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence>
              {proactiveTrigger && <ProactiveBubble key="proactive-bubble" />}
            </AnimatePresence>

            <button
              className={styles.fab}
              onClick={handleFabClick}
              aria-label="Open Sara AI assistant"
            >
              <MessageCircle size={26} />
              {proactiveTrigger && <span className={styles.fabPulse} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
