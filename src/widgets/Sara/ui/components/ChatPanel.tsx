'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, VolumeX, MoreHorizontal, Mic, Send } from 'lucide-react'
import { useSaraStore } from '../../store/useSaraStore'
import { captureSaraEvent } from '../../analytics/posthog'
import styles from './ChatPanel.module.css'

// ── Context label derived from current route ───────────────
function getContextLabel(pathname: string): string {
  if (/\/chat-avatar\/create/.test(pathname)) return 'Chat Avatar Setup'
  if (/\/create\/video/.test(pathname)) return 'Video Creation'
  if (/\/avatar\/setup/.test(pathname)) return 'Avatar Setup'
  if (/\/dashboard/.test(pathname)) return 'Dashboard'
  if (/\/locali[sz]|translate/.test(pathname)) return 'Video Translation'
  return 'AI Assistant'
}

// ── Context-aware quick reply chips ───────────────────────
function getSuggestedChips(pathname: string): string[] {
  if (/\/chat-avatar/.test(pathname)) {
    return ['Set up knowledge base', 'Test chat avatar', 'Get embed code']
  }
  if (/\/create\/video/.test(pathname)) {
    return ['Generate a script', 'Choose an avatar', 'How to share video?']
  }
  if (/\/locali[sz]|translate/.test(pathname)) {
    return ['Choose target language', 'Pick a voice', 'Download result']
  }
  return ['Create a video', 'Translate a video', 'Set up chat avatar']
}

// ── Custom Markdown/Formatting Parser for premium readability ──────
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

const renderMessageContent = (content: string) => {
  const lines = content.split('\n')
  return lines.map((line, idx) => {
    // 1. Headings (### or ##)
    if (line.startsWith('### ')) {
      return <h4 key={idx} style={{ margin: '10px 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>{parseBold(line.slice(4))}</h4>
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} style={{ margin: '12px 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>{parseBold(line.slice(3))}</h3>
    }
    
    // 2. Bullet list items
    if (line.trim().startsWith('- ')) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0 4px 8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
          <span style={{ flex: 1 }}>{parseBold(line.trim().slice(2))}</span>
        </div>
      )
    }

    // 3. Spacing for empty lines
    if (!line.trim()) {
      return <div key={idx} style={{ height: '6px' }} />
    }

    // 4. Standard text line
    return <p key={idx} style={{ margin: '2px 0' }}>{parseBold(line)}</p>
  })
}

export default function ChatPanel() {
  const pathname = usePathname()
  const { messages, isLoading, toggleChat, addMessage, prefillMessage, setPrefillMessage } = useSaraStore()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Consume prefill from store (e.g. from "Shorten script" CTA)
  useEffect(() => {
    if (prefillMessage) {
      setInputValue(prefillMessage)
      setPrefillMessage(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contextLabel = getContextLabel(pathname)
  const chips = getSuggestedChips(pathname)
  const isEmpty = messages.length === 0

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const newMessage = {
      id: Date.now(),
      role: 'user' as const,
      content: trimmed,
      created_at: new Date().toISOString(),
    }
    addMessage(newMessage)
    setInputValue('')
    captureSaraEvent('sara_message_sent', {
      screen: pathname,
      message_length: trimmed.length,
    })
    
    // Sprint 2: AI call triggered via actual backend API
    const runAi = async () => {
      useSaraStore.getState().setLoading(true)
      try {
        const allMessages = [...useSaraStore.getState().messages]
        // Ensure the newly added message is included if state hasn't flushed
        if (!allMessages.find(m => m.id === newMessage.id)) {
          allMessages.push(newMessage)
        }
        
        const res = await fetch('/api/sara/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        })
        const data = await res.json()
        
        if (data.message) {
          useSaraStore.getState().addMessage({
            id: Date.now() + 1,
            role: 'assistant',
            content: data.message,
            created_at: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Failed to fetch AI response:', err)
      } finally {
        useSaraStore.getState().setLoading(false)
      }
    }
    runAi()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputValue)
    }
  }

  return (
    <div className={styles.panel}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.statusDot} />
          <div className={styles.headerMeta}>
            <span className={styles.headerName}>Sara</span>
            <span className={styles.headerSep}>•</span>
            <span className={styles.headerSub}>{contextLabel}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerIconBtn} aria-label="Mute">
            <VolumeX size={15} />
          </button>
          <button className={styles.headerIconBtn} aria-label="More options">
            <MoreHorizontal size={15} />
          </button>
          <button
            className={styles.headerIconBtn}
            onClick={toggleChat}
            aria-label="Close Sara"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Avatar section ─────────────────────────────── */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarPulseWrapper}>
          <span className={`${styles.ring} ${styles.ring1}`} />
          <span className={`${styles.ring} ${styles.ring2}`} />
          <span className={`${styles.ring} ${styles.ring3}`} />
          <div className={styles.avatarCircle}>S</div>
        </div>
        <span className={styles.avatarLabel}>Sara</span>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div className={styles.messages}>
        {isEmpty ? (
          <p className={styles.welcomeText}>
            Hi! I&apos;m Sara, your AI assistant 👋<br />
            Ask me anything or pick a suggestion below.
          </p>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`${styles.messageRow} ${
                msg.role === 'user' ? styles.messageRowUser : styles.messageRowAi
              }`}
            >
              {msg.role !== 'user' && (
                <div className={styles.messageAvatar}>S</div>
              )}
              <div
                className={`${styles.bubble} ${
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi
                }`}
              >
                {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
              </div>
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${styles.messageRow} ${styles.messageRowAi}`}
          >
            <div className={styles.messageAvatar}>S</div>
            <div className={`${styles.bubble} ${styles.bubbleAi} ${styles.typingBubble}`}>
              <span className={styles.dot} style={{ animationDelay: '0ms' }} />
              <span className={styles.dot} style={{ animationDelay: '150ms' }} />
              <span className={styles.dot} style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested chips (empty state only) ─────────── */}
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

      {/* ── Input area ─────────────────────────────────── */}
      <div className={styles.inputArea}>
        <button className={styles.micButton} aria-label="Voice input">
          <Mic size={17} />
        </button>
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
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
