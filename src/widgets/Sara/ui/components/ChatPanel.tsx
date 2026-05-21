'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import { useSaraStore } from '../../store/useSaraStore'
import { captureSaraEvent } from '../../analytics/posthog'
import styles from './ChatPanel.module.css'

// Context-aware suggested chips based on the current route
function getSuggestedChips(pathname: string): string[] {
  if (/\/create\/video/.test(pathname)) {
    return ['Generate a script', 'Choose an avatar', 'How to share video?']
  }
  if (/\/chat-avatar/.test(pathname)) {
    return ['Set up knowledge base', 'Test chat avatar', 'Get embed code']
  }
  if (/\/locali[sz]/.test(pathname) || /translate/.test(pathname)) {
    return ['Choose target language', 'Pick a voice', 'Download result']
  }
  return ['Create a video', 'Translate a video', 'Set up chat avatar']
}

export default function ChatPanel() {
  const pathname = usePathname()
  const { messages, isLoading, toggleChat, addMessage } = useSaraStore()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chips = getSuggestedChips(pathname)
  const isEmpty = messages.length === 0

  // Auto-scroll to bottom on new messages or typing state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    addMessage({
      id: Date.now(),
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    })
    setInputValue('')
    captureSaraEvent('sara_message_sent', {
      screen: pathname,
      message_length: trimmed.length,
    })
    // Sprint 2: AI call will be triggered here via useSaraStore.sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputValue)
    }
  }

  return (
    <div className={styles.panel}>
      {/* ── Header ───────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerAvatar}>
            <Sparkles size={18} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.headerName}>Sara AI</span>
            <span className={styles.headerStatus}>
              <span className={styles.statusDot} />
              Online
            </span>
          </div>
        </div>
        <button
          className={styles.closeButton}
          onClick={toggleChat}
          aria-label="Close Sara"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Messages ─────────────────────────────────────── */}
      <div className={styles.messages}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyAvatar}>
              <Sparkles size={24} />
            </div>
            <h4 className={styles.emptyTitle}>Hi, I&apos;m Sara! 👋</h4>
            <p className={styles.emptyText}>
              I&apos;m your AI assistant. I can help you create videos, choose
              avatars, set up knowledge bases, and more.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`${styles.messageRow} ${
                msg.role === 'user' ? styles.messageRowUser : styles.messageRowAi
              }`}
            >
              {msg.role !== 'user' && (
                <div className={styles.messageAvatar}>
                  <Sparkles size={11} />
                </div>
              )}
              <div
                className={`${styles.bubble} ${
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${styles.messageRow} ${styles.messageRowAi}`}
          >
            <div className={styles.messageAvatar}>
              <Sparkles size={11} />
            </div>
            <div className={`${styles.bubble} ${styles.bubbleAi} ${styles.typingBubble}`}>
              <span className={styles.dot} style={{ animationDelay: '0ms' }} />
              <span className={styles.dot} style={{ animationDelay: '160ms' }} />
              <span className={styles.dot} style={{ animationDelay: '320ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested chips (shown on empty state only) ─── */}
      {isEmpty && (
        <div className={styles.chips}>
          {chips.map((chip) => (
            <button
              key={chip}
              className={styles.chip}
              onClick={() => handleSend(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ───────────────────────────────────── */}
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ask Sara anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message Sara"
          autoComplete="off"
        />
        <button
          className={styles.sendButton}
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
