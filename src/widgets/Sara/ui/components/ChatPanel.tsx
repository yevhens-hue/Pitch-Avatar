'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Volume2, VolumeX, MoreHorizontal, Mic, Send, ChevronDown } from 'lucide-react'
import { useSaraStore } from '../../store/useSaraStore'
import { captureSaraEvent } from '../../analytics/posthog'
import { useSaraActions } from '../../hooks/useSaraActions'
import { useSaraVoiceInterruption } from '../../hooks/useSaraVoiceInterruption'
import styles from './ChatPanel.module.css'

// ── Context label derived from current route ───────────────
function getContextLabel(pathname: string, wizardStep: number | null = null): string {
  if (/\/chat-avatar\/create/.test(pathname)) {
    if (wizardStep === 1) return 'Chat Avatar Setup'
    if (wizardStep === 2) return 'Presentation Content'
    if (wizardStep === 3) return 'Avatar Instructions'
    if (wizardStep === 4) return 'Knowledge Base'
    return 'Chat Avatar Setup'
  }
  if (/\/create\/video/.test(pathname)) return 'Video Creation'
  if (/\/avatar\/setup/.test(pathname)) return 'Avatar Setup'
  if (/\/dashboard/.test(pathname)) return 'Dashboard'
  if (/\/locali[sz]|translate/.test(pathname)) return 'Video Translation'
  return 'AI Assistant'
}

// ── Context-aware quick reply chips ───────────────────────
function getSuggestedChips(pathname: string, wizardStep: number | null = null): string[] {
  if (/\/chat-avatar/.test(pathname)) {
    if (wizardStep === 1) {
      return ['How to name the avatar?', 'Best voice for sales?', 'Can I change language later?']
    }
    if (wizardStep === 2) {
      return ['What file formats work?', 'Max slides allowed?', 'Can I use scanned PDFs?']
    }
    if (wizardStep === 3) {
      return ['How long should the prompt be?', 'Tone examples?', 'Can I add fallback answers?']
    }
    if (wizardStep === 4) {
      return ['What files can I upload?', 'How many KB docs?', 'When is KB used by the AI?']
    }
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

// ── Relative timestamp formatter ──────────────────────────
function formatMessageTime(isoString?: string): string {
  if (!isoString) return ''
  const diffSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diffSeconds < 60) return 'just now'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`
  return `${Math.floor(diffSeconds / 3600)}h ago`
}

// ── Custom Markdown/Formatting Parser for premium readability ──────
const parseText = (text: string, onAction?: (type: string, payload: string) => void) => {
  const parts = text.split(/(\[.*?\]\(action:(?:navigate|reply):.*?\))/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[(.*?)\]\(action:(navigate|reply):(.*?)\)$/)
    if (match) {
      const [, label, actionType, payload] = match
      return (
        <button
          key={i}
          className={styles.interactiveButton}
          onClick={() => onAction && onAction(actionType, payload)}
        >
          {label}
        </button>
      )
    }
    const boldParts = part.split(/(\*\*.*?\*\*)/g)
    return (
      <React.Fragment key={i}>
        {boldParts.map((bPart, j) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return <strong key={j}>{bPart.slice(2, -2)}</strong>
          }
          return bPart
        })}
      </React.Fragment>
    )
  })
}

const renderMessageContent = (content: string, onAction?: (type: string, payload: string) => void) => {
  const sanitizedContent = content.replace(/\]\s*\(\s*action:/g, '](action:')
  const lines = sanitizedContent.split('\n')
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return <h4 key={idx} style={{ margin: '10px 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>{parseText(line.slice(4), onAction)}</h4>
    }
    if (line.startsWith('## ')) {
      return <h3 key={idx} style={{ margin: '12px 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>{parseText(line.slice(3), onAction)}</h3>
    }
    if (line.trim().startsWith('- ')) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0 4px 8px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
          <span style={{ flex: 1 }}>{parseText(line.trim().slice(2), onAction)}</span>
        </div>
      )
    }
    if (!line.trim()) {
      return <div key={idx} style={{ height: '6px' }} />
    }
    return <p key={idx} style={{ margin: '2px 0' }}>{parseText(line, onAction)}</p>
  })
}

export default function ChatPanel() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    messages, isLoading, toggleChat, addMessage, prefillMessage,
    setPrefillMessage, wizardStep, isMuted, setMuted,
  } = useSaraStore()
  const { startTour } = useSaraActions()
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSaraVoiceInterruption()

  const [inputValue, setInputValue] = useState('')
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isAtBottomRef = useRef(true)
  const lastSpokenMessageId = useRef<number | null>(null)

  // Consume prefill from store (e.g. from "Shorten script" CTA)
  useEffect(() => {
    if (prefillMessage) {
      setInputValue(prefillMessage)
      setPrefillMessage(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-focus input on open
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(timer)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleChat()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleChat])

  const contextLabel = getContextLabel(pathname, wizardStep)
  const chips = getSuggestedChips(pathname, wizardStep)
  const isEmpty = messages.length === 0

  // Scroll helpers
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
    setShowScrollToBottom(false)
    isAtBottomRef.current = true
  }, [])

  const handleScroll = useCallback(() => {
    const el = messagesRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    isAtBottomRef.current = atBottom
    setShowScrollToBottom(!atBottom)
  }, [])

  // Smart auto-scroll: only when user is already at the bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading])

  // Sync voice transcript with input
  useEffect(() => {
    if (isListening && transcript) {
      setInputValue(transcript)
    }
  }, [transcript, isListening])

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Cancel speech immediately when muted
  useEffect(() => {
    if (isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [isMuted])

  // Speak AI responses
  useEffect(() => {
    if (isMuted || messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    
    if (lastMsg.role === 'assistant' && lastMsg.id !== lastSpokenMessageId.current) {
      lastSpokenMessageId.current = lastMsg.id
      
      // Strip markdown syntax, buttons, and emojis from the text before speaking
      const textToSpeak = lastMsg.content
        .replace(/\[.*?\]\(.*?\)/g, '') // remove action buttons
        .replace(/[#*`_]/g, '') // remove markdown symbols
        .replace(/\p{Extended_Pictographic}/gu, '') // remove emojis/smilies
        .replace(/\s+/g, ' ') // normalize whitespace
        .trim()
        
      if (textToSpeak && typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        // Cancel any ongoing speech before starting a new one
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      }
    }
  }, [messages, isMuted])

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
    setTranscript('')
    // Auto-scroll on user send
    isAtBottomRef.current = true
    captureSaraEvent('sara_message_sent', {
      screen: pathname,
      message_length: trimmed.length,
    })

    const runAi = async () => {
      useSaraStore.getState().setLoading(true)
      try {
        const allMessages = [...useSaraStore.getState().messages]
        if (!allMessages.find(m => m.id === newMessage.id)) {
          allMessages.push(newMessage)
        }
        const res = await fetch('/api/sara/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        })
        const data = await res.json()
        if (data.action === 'start_tour' && data.actionPayload) {
          startTour(data.actionPayload)
        }
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

  const handleActionClick = (type: string, payload: string) => {
    if (type === 'navigate') {
      router.push(payload)
      toggleChat()
    } else if (type === 'reply') {
      handleSend(payload)
    }
  }

  // ── Avatar data-state for CSS-driven animation variants ──
  const avatarState = isLoading ? 'thinking' : isListening ? 'listening' : 'idle'

  // ── Avatar label text ─────────────────────────────────────
  const avatarLabelText = isLoading ? 'Thinking…' : isListening ? 'Listening…' : 'Sara'

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
          <button
            className={styles.headerIconBtn}
            onClick={() => setMuted(!isMuted)}
            aria-label={isMuted ? 'Unmute Sara' : 'Mute Sara'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            className={styles.headerIconBtn}
            onClick={() => useSaraStore.getState().clearMessages()}
            aria-label="Clear chat"
            title="Clear chat"
          >
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
      <div className={styles.avatarSection} data-state={avatarState}>
        <div className={styles.avatarPulseWrapper}>
          <span className={`${styles.ring} ${styles.ring1}`} />
          <span className={`${styles.ring} ${styles.ring2}`} />
          <span className={`${styles.ring} ${styles.ring3}`} />
          <div className={styles.avatarCircle}>S</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={avatarLabelText}
            className={`${styles.avatarLabel} ${isLoading ? styles.avatarLabelThinking : ''} ${isListening ? styles.avatarLabelListening : ''}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {avatarLabelText}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* ── Messages container ──────────────────────────── */}
      <div className={styles.messagesContainer}>
        <div
          className={styles.messages}
          ref={messagesRef}
          onScroll={handleScroll}
        >
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
                <div className={styles.messageBubbleGroup}>
                  <div
                    className={`${styles.bubble} ${
                      msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi
                    }`}
                  >
                    {msg.role === 'user'
                      ? msg.content
                      : renderMessageContent(msg.content, handleActionClick)}
                  </div>
                  {msg.created_at && (
                    <span className={`${styles.messageTimestamp} ${
                      msg.role === 'user' ? styles.messageTimestampUser : ''
                    }`}>
                      {formatMessageTime(msg.created_at)}
                    </span>
                  )}
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

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollToBottom && !isEmpty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.15 }}
              className={styles.scrollToBottom}
              onClick={() => scrollToBottom()}
              aria-label="Scroll to latest message"
            >
              <ChevronDown size={14} />
            </motion.button>
          )}
        </AnimatePresence>
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
        <button
          className={`${styles.micButton} ${isListening ? styles.micButtonActive : ''}`}
          aria-label={isListening ? 'Stop voice input' : 'Voice input'}
          onClick={isListening ? stopListening : startListening}
        >
          <Mic size={17} />
        </button>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={isListening ? 'Listening...' : 'Ask Sara anything...'}
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
