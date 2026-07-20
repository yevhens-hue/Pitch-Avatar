'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Volume2, VolumeX, Mic, ArrowUp, ChevronDown, Hexagon, Phone, Calendar } from 'lucide-react'
import { useSaraStore } from '../../store/useSaraStore'
import { captureSaraEvent } from '../../analytics/posthog'
import { useSaraActions } from '../../hooks/useSaraActions'
import { useSaraMultiActions } from '../../hooks/useSaraMultiActions'
import { useSaraVoiceInterruption } from '../../hooks/useSaraVoiceInterruption'
import styles from './ChatPanel.module.css'

// ── Context label derived from current route ───────────────
// Context label derived from current route - logic moved to Host App

// Removed getSuggestedChips logic for MVP

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
  const parts = text.split(/(\[.*?\]\(action:(?:navigate|reply|start_tour):.*?\))/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[(.*?)\]\(action:(navigate|reply|start_tour):(.*?)\)$/)
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

const renderMessageContent = (content: string, onAction?: (type: string, payload: string) => void, onExecuteSequence?: (seq: any) => void) => {
  // Extract json code blocks first
  const blocks = content.split(/(```json\n[\s\S]*?\n```)/g);
  
  return blocks.map((block, i) => {
    if (block.startsWith('```json\n') && block.endsWith('\n```')) {
      const jsonStr = block.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === 'multiaction' && Array.isArray(parsed.steps)) {
          return (
            <button
              key={`block-${i}`}
              className={styles.interactiveButton}
              onClick={() => onExecuteSequence && onExecuteSequence(parsed.steps)}
            >
              {parsed.label || 'Execute action'}
            </button>
          );
        }
      } catch(e) {
        // ignore parse error, render as text below
      }
    }

    const sanitizedContent = block.replace(/\]\s*\(\s*action:/g, '](action:');
    const lines = sanitizedContent.split('\n');
    return lines.map((line, idx) => {
      const key = `block-${i}-line-${idx}`;
      if (line.startsWith('### ')) {
        return <h4 key={key} style={{ margin: '10px 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>{parseText(line.slice(4), onAction)}</h4>
      }
      if (line.startsWith('## ')) {
        return <h3 key={key} style={{ margin: '12px 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>{parseText(line.slice(3), onAction)}</h3>
      }
      if (line.trim().startsWith('- ')) {
        return (
          <div key={key} style={{ display: 'flex', gap: '6px', margin: '4px 0 4px 8px', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
            <span style={{ flex: 1 }}>{parseText(line.trim().slice(2), onAction)}</span>
          </div>
        )
      }
      if (!line.trim()) {
        return <div key={key} style={{ height: '6px' }} />
      }
      return <p key={key} style={{ margin: '2px 0' }}>{parseText(line, onAction)}</p>
    })
  })
}

export default function ChatPanel() {
  const {
    messages, isLoading, toggleChat, addMessage, prefillMessage,
    setPrefillMessage, wizardStep, isMuted, setMuted, language, setLanguage, config
  } = useSaraStore()
  const { dispatchAction } = useSaraActions()
  const { executeSequence } = useSaraMultiActions()
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSaraVoiceInterruption()

  const [inputValue, setInputValue] = useState('')
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isAtBottomRef = useRef(true)
  const lastSpokenMessageId = useRef<number | string | null>(null)
 
  // Initialize lastSpokenMessageId to avoid repeating history on mount
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === 'assistant') {
        lastSpokenMessageId.current = lastMsg.id
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const contextLabel = typeof config?.contextLabel === 'string' ? config.contextLabel : 'AI Assistant'
  const pageDescription = typeof config?.pageDescription === 'string' ? config.pageDescription : undefined
  const currentUrl = typeof config?.currentUrl === 'string' ? config.currentUrl : undefined
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

  // Speak the latest assistant message
  useEffect(() => {
    if (isMuted) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
      return
    }
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    
    // Check if the message was generated recently (last 10 seconds)
    // This prevents speaking old history messages that just hydrated from storage
    const isRecent = lastMsg.created_at 
      ? (Date.now() - new Date(lastMsg.created_at).getTime() < 10000) 
      : false
      
    if (lastMsg.role === 'assistant' && lastMsg.id !== lastSpokenMessageId.current && isRecent) {
      lastSpokenMessageId.current = lastMsg.id
      
      // Strip markdown syntax, buttons, and emojis from the text before speaking
      const textToSpeak = lastMsg.content
        .replace(/\[.*?\]\(.*?\)/g, '') // remove links/actions
        .replace(/[*#]/g, '')           // remove markdown formatting
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
        .replace(/\s+/g, ' ') // clean up extra spaces left by removals
        .trim()
        
      if (textToSpeak && typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        
        // Cancel any ongoing speech before starting a new one
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      }
    }
  }, [messages, isMuted])

  // Control speaking video — load src lazily only when needed, never on mount
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isSpeaking) {
      if (!video.src || !video.src.includes('speak.mp4')) {
        video.src = '/speak.mp4'
        video.load()
      }
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isSpeaking])

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

    captureSaraEvent('chat_message_sent', {
      message_length: trimmed.length,
    })

    const runAi = async () => {
      useSaraStore.getState().setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout
      
      try {
        const allMessages = [...useSaraStore.getState().messages]
        if (!allMessages.find(m => m.id === newMessage.id)) {
          allMessages.push(newMessage)
        }
        const res = await fetch('/api/sara/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: allMessages, 
            language: useSaraStore.getState().language,
            contextLabel,
            currentUrl,
            pageDescription,
            projectId: config?.projectId,
            tools: useSaraStore.getState().tools,
          }),
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const data = await res.json()
        if (data.message) {
          useSaraStore.getState().addMessage({
            id: Date.now() + 1,
            role: 'assistant',
            content: data.message,
            created_at: new Date().toISOString(),
          })
        }

        // Handle OpenAI function calling / tools
        if (data.toolCalls && Array.isArray(data.toolCalls)) {
          data.toolCalls.forEach((toolCall: any) => {
            if (toolCall.type === 'function') {
              console.log('[Sara Widget] Tool Call received:', toolCall.function.name, toolCall.function.arguments);
              
              let parsedArgs: Record<string, string> = {};
              try { parsedArgs = JSON.parse(toolCall.function.arguments); } catch(e) {}
              
              // Strategy 1: Try global callback registered by host app (most reliable)
              const globalHandler = (window as any).__PITCH_AVATAR_TOOL_HANDLER__;
              if (typeof globalHandler === 'function') {
                globalHandler(toolCall.function.name, parsedArgs);
                return;
              }

              // Strategy 2: postMessage fallback
              const targetOrigin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
              window.parent.postMessage({
                type: 'PITCH_AVATAR_TOOL_CALL',
                tool: toolCall.function.name,
                payload: parsedArgs
              }, targetOrigin);

              // Strategy 3: Build a fallback chat message with a clickable action link
              if (toolCall.function.name === 'create_avatar') {
                const name = parsedArgs.name || '';
                const role = parsedArgs.role || '';
                const params = new URLSearchParams();
                if (name) params.append('name', name);
                if (role) params.append('role', role);
                const url = `/chat-avatar/create?${params.toString()}`;
                useSaraStore.getState().addMessage({
                  id: Date.now() + 2,
                  role: 'assistant',
                  content: `Creating avatar "${name}" (role: ${role}). \n\n[Go to creation](action:navigate:${url})`,
                  created_at: new Date().toISOString(),
                });
              }
            }
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch AI response:', err)
        let errMsg = "A server communication error occurred. Please try again."
        if (err.name === 'AbortError') {
          errMsg = "The server is taking too long to respond. Please try again."
        }
        useSaraStore.getState().addMessage({
          id: Date.now() + 1,
          role: 'assistant',
          content: errMsg,
          created_at: new Date().toISOString(),
        })
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
      dispatchAction({ type: 'navigate', route: payload })
      toggleChat()
    } else if (type === 'reply') {
      handleSend(payload)
    }
  }

  // ── Avatar data-state for CSS-driven animation variants ──
  const avatarState = isLoading ? 'thinking' : isListening ? 'listening' : 'idle'

  // ── Avatar label text ─────────────────────────────────────
  const baseName = config?.avatarName || 'Sara'
  const avatarLabelText = isLoading ? 'Thinking…' : isListening ? 'Listening…' : baseName

  return (
    <div className={styles.panel}>

      {/* ── Header ─────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" style={{ width: '22px', height: '22px', marginRight: '8px', objectFit: 'contain' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: '#0070f3', borderRadius: '4px', marginRight: '8px' }}>
              <Hexagon size={14} color="#ffffff" />
            </div>
          )}
          <div className={styles.headerMeta}>
            <span className={styles.headerName}>{config?.avatarName || 'Pitch Avatar'}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.headerIconBtn}
            onClick={() => useSaraStore.getState().clearMessages()}
            aria-label="Clear chat"
            title="Clear chat history"
            style={{ marginRight: '8px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <button
            className={styles.headerIconBtn}
            onClick={toggleChat}
            aria-label="Close Sara"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Avatar section ─────────────────────────────── */}
      <div
        className={styles.avatarSection}
        data-state={avatarState}
      >
        <button
          className={styles.soundToggleBtn}
          onClick={(e) => {
            e.stopPropagation()
            setMuted(!isMuted)
          }}
          aria-label={isMuted ? 'Unmute Sara' : 'Mute Sara'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className={styles.avatarVideoContainer}>
          <div 
            className={styles.avatarIdleContainer}
            style={{ opacity: isSpeaking ? 0 : 1 }}
          >
            <img 
              className={styles.avatarImage} 
              src={config?.avatarImageUrl || "/Sara.png"} 
              alt={`${baseName} Idle`} 
            />
          </div>
          <video 
            ref={videoRef}
            className={styles.avatarVideo}
            loop 
            muted 
            playsInline
            preload="none"
            style={{ opacity: isSpeaking ? 1 : 0 }}
          />
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
              {config?.greetingMessage ? (
                <span style={{ whiteSpace: 'pre-wrap' }}>{config.greetingMessage}</span>
              ) : (
                <>
                  Hi! I&apos;m {baseName}, your AI assistant 👋<br />
                  Ask me anything or pick a suggestion below.
                </>
              )}
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

                <div className={styles.messageBubbleGroup}>
                  <div
                    className={`${styles.bubble} ${
                      msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi
                    }`}
                  >
                    {msg.role !== 'user' && (
                      <div className={styles.bubbleHeaderAi}>
                        <span className={styles.bubbleNameAi}>{baseName}</span>
                        {msg.created_at && (
                          <span className={styles.bubbleTimeAi}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                    {msg.role === 'user'
                      ? msg.content
                      : renderMessageContent(msg.content, handleActionClick, executeSequence)}
                  </div>
                  {msg.role === 'user' && msg.created_at && (
                    <span className={`${styles.messageTimestamp} ${styles.messageTimestampUser}`}>
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
              <div className={`${styles.bubble} ${styles.bubbleAi} ${styles.typingBubble}`}>
                <div className={styles.bubbleHeaderAi}>
                  <span className={styles.bubbleNameAi}>{baseName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span className={styles.dot} style={{ animationDelay: '0ms' }} />
                  <span className={styles.dot} style={{ animationDelay: '150ms' }} />
                  <span className={styles.dot} style={{ animationDelay: '300ms' }} />
                </div>
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

      {/* ── Suggested chips (removed for MVP) ─────────── */}

      {/* ── Input area ─────────────────────────────────── */}
      <div className={styles.inputArea} style={config?.hideTextInput ? { justifyContent: 'center', background: 'transparent', border: 'none' } : {}}>
        {!config?.hideTextInput && (
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={isListening ? 'Listening...' : 'Send a message'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={() => {
              if (isMuted) setMuted(false)
            }}
            aria-label={`Message ${baseName}`}
            autoComplete="off"
          />
        )}
        <button
          className={`${styles.micButton} ${isListening ? styles.micButtonActive : ''}`}
          aria-label={isListening ? 'Stop voice input' : 'Voice input'}
          onClick={isListening ? stopListening : startListening}
          style={config?.hideTextInput ? { transform: 'scale(1.5)', margin: '10px 0' } : {}}
        >
          <Mic size={18} />
        </button>
        {!config?.hideTextInput && inputValue.trim().length > 0 && (
          <button
            className={styles.sendButton}
            onClick={() => handleSend(inputValue)}
            aria-label="Send message"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}
