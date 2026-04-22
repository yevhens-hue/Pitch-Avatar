'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, ChevronDown } from 'lucide-react'
import styles from './WizardChat.module.css'

/* ── Types ─────────────────────────────────────────── */
interface Message {
  id: string
  role: 'ai' | 'user'
  text: string
  ts: number
}

export interface WizardChatProps {
  /** Current step name (passed in so AI can personalise) */
  stepName: string
  /** Index of current step, 1-based */
  stepNumber: number
  /** Wizard title / context */
  wizardTitle: string
  /** Proactive hint shown when step becomes active */
  hint: string
}

/* ── Mock AI brain ──────────────────────────────────── */
const FALLBACK = "Great question! Feel free to check the Watch Tutorial button on the left if you'd prefer a video walkthrough."

function buildResponse(q: string, ctx: { stepName: string; wizardTitle: string }): string {
  const lc = q.toLowerCase()

  // Upload related
  if (/upload|file|pdf|pptx|drag|drop|format/.test(lc))
    return `You can upload PDF or PPTX files up to 100 MB. Just drag the file onto the drop zone or click "Browse Files". Canva and Google Slides imports are also supported via the source cards below.`

  // Avatar related
  if (/avatar|face|photo|look|character|presenter/.test(lc))
    return `You can pick any of the built-in AI avatars or upload your own photo. The avatar will be lip-synced to your script automatically — no video recording required.`

  // Voice / language related
  if (/voice|language|speak|accent|tts|audio|dub|translate/.test(lc))
    return `We support 29+ languages. Choose your target language and pick an AI voice that matches your brand. "Florian (Multilingual)" works great for most European languages.`

  // Subtitle related
  if (/subtitle|caption|text|srt/.test(lc))
    return `Enable "Add Subtitles" in the Dubbing Settings step. Subtitles will be burned into the dubbed video automatically.`

  // Lip sync
  if (/lip.?sync|lipsync|mouth/.test(lc))
    return `Lip sync matches the avatar's mouth movements to the dubbed audio track. It's enabled by default — you can turn it off in Dubbing Settings if you only want the audio replaced.`

  // Time / how long
  if (/how.?long|time|duration|wait|minutes|fast/.test(lc))
    return `Processing typically takes 1–3 minutes per slide or 1 minute per video minute, depending on length and settings. You'll get a notification when it's done.`

  // Cost / credits / plan
  if (/cost|credit|plan|price|paid|free|trial/.test(lc))
    return `Your current plan includes AI Avatar minutes as shown in the sidebar. Each generated minute of video uses roughly 1 minute of your AI quota.`

  // Next step / what now
  if (/next|after|then|done|finish|what.?now/.test(lc))
    return `Once you're done with "${ctx.stepName}", click "Next →" at the bottom right. You can always click a completed step in the sidebar to go back and change settings.`

  // Script / words / text
  if (/script|text|word|content|write|notes/.test(lc))
    return `The AI can auto-generate a script from your slide content, or you can use your existing Presenter Notes. You can also set the approximate words-per-slide count to control pacing.`

  // Export / download / share
  if (/export|download|share|link|publish|send/.test(lc))
    return `After generation, your project will appear in the Projects section. From there you can share a link, embed it, or download the video file.`

  // Template / layout
  if (/template|layout|blank|slide|design/.test(lc))
    return `Choose from Blank, Title+Content, Avatar+Text, or Split Screen starting layouts. You can always change individual slides later inside the editor.`

  // Generic help
  if (/help|what.?can|how.?to|guide|tutorial|explain/.test(lc))
    return `I'm your Pitch Avatar assistant! I can answer questions about this wizard step — uploading files, choosing avatars, configuring voice, or understanding settings. What would you like to know?`

  return FALLBACK
}

/* ── Tiny ID helper ─────────────────────────────────── */
let _id = 0
const uid = () => `msg-${++_id}`

/* ── Component ─────────────────────────────────────── */
export default function WizardChat({ stepName, stepNumber, wizardTitle, hint }: WizardChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [prevStep, setPrevStep] = useState(stepNumber)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Push AI hint whenever step changes */
  useEffect(() => {
    if (stepNumber === prevStep && messages.length > 0) return
    setPrevStep(stepNumber)
    const hintMsg: Message = { id: uid(), role: 'ai', text: hint, ts: Date.now() }
    setMessages(prev => [...prev, hintMsg])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNumber, hint])

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen, isTyping])

  /* Focus input when opened */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = { id: uid(), role: 'user', text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const delay = 700 + Math.random() * 800
    setTimeout(() => {
      const reply = buildResponse(text, { stepName, wizardTitle })
      setMessages(prev => [...prev, { id: uid(), role: 'ai', text: reply, ts: Date.now() }])
      setIsTyping(false)
    }, delay)
  }, [input, stepName, wizardTitle])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── Collapsed FAB ── */}
      {!isOpen && (
        <button
          className={styles.fab}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI assistant"
          title="Ask AI assistant"
        >
          <span className={styles.fabEmoji}>🤖</span>
          <span className={styles.fabPulse} />
          <span className={styles.fabLabel}>Ask AI</span>
        </button>
      )}

      {/* ── Expanded chat panel ── */}
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label="AI wizard assistant">
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerAvatar}>🤖</div>
            <div className={styles.headerInfo}>
              <div className={styles.headerName}>Pitch Avatar AI</div>
              <div className={styles.headerStatus}>
                <span className={styles.statusDot} />
                Step {stepNumber}: {stepName}
              </div>
            </div>
            <button
              className={styles.headerClose}
              onClick={() => setIsOpen(false)}
              aria-label="Minimize chat"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map(m => (
              <div
                key={m.id}
                className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}
              >
                {m.role === 'ai' && <span className={styles.bubbleAvatar}>🤖</span>}
                <span className={styles.bubbleText}>{m.text}</span>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                <span className={styles.bubbleAvatar}>🤖</span>
                <span className={styles.bubbleText}>
                  <span className={styles.typing}>
                    <span /><span /><span />
                  </span>
                </span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className={styles.suggestions}>
            {[
              'How long will this take?',
              'What file formats are supported?',
              'How do I share my result?',
            ].map(s => (
              <button
                key={s}
                className={styles.suggestion}
                onClick={() => { setInput(s); setTimeout(sendMessage, 0) }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this step…"
              aria-label="Chat input"
            />
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
