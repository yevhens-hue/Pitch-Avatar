'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Minus, Send, Mic, MicOff, Upload, Volume2, VolumeX } from 'lucide-react'
import styles from './WizardChat.module.css'

/* ── Types ── */
interface Message {
  id: string
  role: 'ai' | 'user'
  text: string
}

export interface WizardChatProps {
  stepName: string
  stepNumber: number
  wizardTitle: string
  hint: string
}

type AvatarState = 'idle' | 'thinking' | 'speaking'

/* ── Tiny ID ── */
let _id = 0
const uid = () => `m${++_id}`

/* ── Mock AI brain ── */
const FALLBACK = "Great question! Check the Watch Tutorial button on the left for a video walkthrough. 🎬"

function buildResponse(q: string, ctx: { stepName: string; wizardTitle: string }): string {
  const lc = q.toLowerCase()
  if (/upload|file|pdf|pptx|drag|drop|format/.test(lc))
    return 'You can upload PDF or PPTX files up to 100 MB. Just drag the file onto the drop zone or click Browse Files. Canva and Google Slides imports are also supported! 📎'
  if (/avatar|face|photo|look|character|presenter/.test(lc))
    return 'Choose any of the built-in AI avatars or upload your own photo. Your avatar will be lip-synced to the script automatically — no recording needed! 🎭'
  if (/voice|language|speak|accent|tts|audio|dub|translate/.test(lc))
    return 'We support 29+ languages! Choose your target language and pick an AI voice that fits your brand. 🌍'
  if (/subtitle|caption|text|srt/.test(lc))
    return 'Enable "Add Subtitles" in the Dubbing Settings step. Subtitles get burned into the dubbed video automatically. 📝'
  if (/lip.?sync|lipsync|mouth/.test(lc))
    return 'Lip sync matches avatar mouth movements to the dubbed audio. It\'s on by default — turn it off in Dubbing Settings if you only want audio replaced.'
  if (/how.?long|time|duration|wait|minutes|fast/.test(lc))
    return 'Processing takes 1–3 minutes per slide depending on settings. You\'ll get a notification when it\'s done! ⏱️'
  if (/cost|credit|plan|price|paid|free|trial/.test(lc))
    return 'Your current plan includes AI Avatar minutes shown in the sidebar. Each generated minute uses roughly 1 minute of your quota. 💎'
  if (/next|after|then|done|finish|what.?now/.test(lc))
    return `Once done with "${ctx.stepName}", click Next at the bottom right. You can revisit completed steps anytime from the sidebar. ✅`
  if (/script|text|word|content|write|notes/.test(lc))
    return 'AI can auto-generate a script from your slides, or use your Presenter Notes. You can control words per slide too! ✍️'
  if (/export|download|share|link|publish|send/.test(lc))
    return 'After generation, your project appears in Projects. Share a link, embed it, or download the video file. 🚀'
  if (/help|what.?can|how.?to|guide|tutorial|explain/.test(lc))
    return "I'm Sara, your Pitch Avatar assistant! I can help with uploading, choosing avatars, voice setup, and more. What would you like to know? 😊"
  return FALLBACK
}

/* ── Strict business woman SVG — waist-up ── */
const AvatarCharacter = ({ state, size = 'full' }: { state: AvatarState; size?: 'full' | 'mini' }) => {
  const cls = [
    styles.charSvg,
    size === 'mini' ? styles.charSvgMini : '',
    state === 'speaking' ? styles.charSpeaking : '',
    state === 'thinking' ? styles.charThinking : '',
  ].filter(Boolean).join(' ')

  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={cls}
      aria-hidden="true"
    >
      {/* ── Dark blazer body ── */}
      <path d="M22 248 L36 194 C54 180 80 187 90 197 L100 226 L110 197 C120 187 146 180 164 194 L178 248Z" fill="#1a2840" />
      {/* Lapel highlights */}
      <path d="M90 197 L100 226 L82 211 L70 196Z" fill="#223255" />
      <path d="M110 197 L100 226 L118 211 L130 196Z" fill="#223255" />

      {/* ── White blouse (wider V — no tie) ── */}
      <polygon points="86,157 100,228 114,157" fill="#f8fafc" />
      {/* Collar flaps */}
      <path d="M86 157 L68 177 L86 168Z" fill="#f8fafc" />
      <path d="M114 157 L132 177 L114 168Z" fill="#f8fafc" />
      {/* Blouse lace/texture edge */}
      <path d="M86 157 Q100 165 114 157" fill="none" stroke="#e2e8f0" strokeWidth="1" />

      {/* ── Brooch / pin at collar ── */}
      <circle cx="100" cy="163" r="5"   fill="#c7d2fe" />
      <circle cx="100" cy="163" r="2.8" fill="#6366f1" />
      <circle cx="100" cy="163" r="1.2" fill="#e0e7ff" />

      {/* ── Neck (slender) ── */}
      <rect x="90" y="155" width="20" height="46" rx="8" fill="#F2C090" />

      {/* ── Head/face base ── */}
      <ellipse cx="100" cy="115" rx="50" ry="56" fill="#F2C090" />

      {/* ── Hair (dark, pulled back — back layer) ── */}
      {/* Back of hair (behind face) */}
      <ellipse cx="100" cy="88" rx="52" ry="44" fill="#180E06" />
      {/* Sides pulled tight against face */}
      <path d="M50 96 Q47 120 50 152" stroke="#180E06" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M150 96 Q153 120 150 152" stroke="#180E06" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* ── Face overlay (skin, to clean up hair) ── */}
      <ellipse cx="100" cy="122" rx="46" ry="52" fill="#F2C090" />

      {/* ── Hairline (pulled back cleanly) ── */}
      <path d="M54 98 Q58 68 100 63 Q142 68 146 98 Q132 78 100 76 Q68 78 54 98Z" fill="#180E06" />

      {/* ── Chignon / bun (top-back of head) ── */}
      <ellipse cx="100" cy="60" rx="18" ry="14" fill="#180E06" />
      {/* Bun detail lines */}
      <path d="M85 58 Q100 54 115 58" fill="none" stroke="#2a1510" strokeWidth="1.5" />
      <path d="M83 63 Q100 59 117 63" fill="none" stroke="#2a1510" strokeWidth="1" />

      {/* ── Pearl earrings ── */}
      <circle cx="52" cy="128" r="5"   fill="#EDE8E0" />
      <circle cx="52" cy="128" r="2.5" fill="white" opacity="0.7" />
      <circle cx="148" cy="128" r="5"   fill="#EDE8E0" />
      <circle cx="148" cy="128" r="2.5" fill="white" opacity="0.7" />

      {/* ── Thin arched eyebrows (elegant, strict) ── */}
      <path d="M71 93 Q82 87 93 91" stroke="#180E06" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M107 91 Q118 87 129 93" stroke="#180E06" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* ── Eye whites ── */}
      <ellipse cx="82" cy="108" rx="11.5" ry="9.5" fill="white" />
      <ellipse cx="118" cy="108" rx="11.5" ry="9.5" fill="white" />

      {/* ── Irises — warm hazel/brown ── */}
      <ellipse cx="82"  cy="109" rx="7"   ry="7.5" fill="#6B4020" />
      <ellipse cx="118" cy="109" rx="7"   ry="7.5" fill="#6B4020" />

      {/* ── Pupils ── */}
      <circle cx="82.5"  cy="110" r="4"   fill="#0f0a06" />
      <circle cx="118.5" cy="110" r="4"   fill="#0f0a06" />

      {/* ── Eye highlights ── */}
      <circle cx="85"   cy="107" r="2"   fill="white" opacity="0.95" />
      <circle cx="121"  cy="107" r="2"   fill="white" opacity="0.95" />

      {/* ── Eyelids (blink animation) ── */}
      <ellipse cx="82"  cy="108" rx="11.5" ry="9.5" fill="#F2C090" className={styles.eyelidL} />
      <ellipse cx="118" cy="108" rx="11.5" ry="9.5" fill="#F2C090" className={styles.eyelidR} />

      {/* ── Glasses frames (thin, rectangular — strict look) ── */}
      <rect x="68"  y="101" width="28" height="16" rx="3" fill="none" stroke="#1a1a2e" strokeWidth="2"   />
      <rect x="104" y="101" width="28" height="16" rx="3" fill="none" stroke="#1a1a2e" strokeWidth="2"   />
      {/* Bridge */}
      <line x1="96" y1="109" x2="104" y2="109" stroke="#1a1a2e" strokeWidth="2" />
      {/* Temples */}
      <line x1="68"  y1="109" x2="50"  y2="113" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="132" y1="109" x2="150" y2="113" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
      {/* Subtle lens tint */}
      <rect x="68"  y="101" width="28" height="16" rx="3" fill="#c7d2fe" opacity="0.08" />
      <rect x="104" y="101" width="28" height="16" rx="3" fill="#c7d2fe" opacity="0.08" />

      {/* ── Nose (refined, feminine) ── */}
      <path d="M96 124 Q100 131 104 124" fill="none" stroke="#c8884a" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── MOUTH STATES ── */}
      {/* Idle: composed, professional (subtle curve) */}
      <path
        d="M90 138 Q100 146 110 138"
        stroke="#8B3A2A" strokeWidth="2.2" strokeLinecap="round" fill="none"
        className={styles.mouthSmile}
      />
      {/* Speaking: open */}
      <g className={styles.mouthSpeakGroup}>
        <ellipse cx="100" cy="141" rx="10" ry="7.5" fill="#8B3A2A" />
        <ellipse cx="100" cy="142" rx="6.5" ry="4.5" fill="#4a0f0f" />
        <line x1="90" y1="141" x2="110" y2="141" stroke="white" strokeWidth="1" opacity="0.25" />
      </g>
      {/* Thinking: small o */}
      <ellipse cx="100" cy="140" rx="5.5" ry="4.5" fill="none" stroke="#8B3A2A" strokeWidth="2" className={styles.mouthThink} />
    </svg>
  )
}

/* ── Component ── */
export default function WizardChat({
  stepName, stepNumber, wizardTitle, hint,
}: WizardChatProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [prevStep, setPrevStep] = useState(stepNumber)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioUploadRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  /* Check API support */
  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))
    )
  }, [])

  /* TTS */
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.0
    u.pitch = 1.15
    u.lang = 'en-US'
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => /samantha|karen|moira|google us english|zira/i.test(v.name))
    if (preferred) u.voice = preferred
    u.onstart = () => setAvatarState('speaking')
    u.onend = () => setAvatarState('idle')
    u.onerror = () => setAvatarState('idle')
    window.speechSynthesis.speak(u)
  }, [isMuted])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
    setAvatarState('idle')
  }, [])

  /* Push hint on step change */
  useEffect(() => {
    if (stepNumber === prevStep && messages.length > 0) return
    setPrevStep(stepNumber)
    const msg: Message = { id: uid(), role: 'ai', text: hint }
    setMessages(prev => [...prev, msg])
    const delay = messages.length === 0 ? 2200 : 400
    if (isOpen) {
      const t = setTimeout(() => speakText(hint), delay)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNumber, hint])

  /* Auto-scroll */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, avatarState])

  /* Focus input when opened */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  /* Send message */
  const sendMessage = useCallback((text?: string) => {
    const txt = (text ?? input).trim()
    if (!txt) return
    setInput('')
    stopSpeaking()
    const userMsg: Message = { id: uid(), role: 'user', text: txt }
    setMessages(prev => [...prev, userMsg])
    setAvatarState('thinking')
    const delay = 600 + Math.random() * 600
    setTimeout(() => {
      const reply = buildResponse(txt, { stepName, wizardTitle })
      const aiMsg: Message = { id: uid(), role: 'ai', text: reply }
      setMessages(prev => [...prev, aiMsg])
      setAvatarState('idle')
      speakText(reply)
    }, delay)
  }, [input, stepName, wizardTitle, speakText, stopSpeaking])

  /* Voice recording */
  const startRecording = useCallback(() => {
    if (!voiceSupported) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const r = new SR()
    r.lang = 'en-US'
    r.interimResults = false
    r.maxAlternatives = 1
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setIsRecording(false)
      sendMessage(transcript)
    }
    r.onerror = () => setIsRecording(false)
    r.onend = () => setIsRecording(false)
    recognitionRef.current = r
    r.start()
    setIsRecording(true)
  }, [voiceSupported, sendMessage])

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    sendMessage(`I uploaded an audio file: "${file.name}". Can you help me with this step?`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const openDialog = () => {
    setIsOpen(true)
    if (messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last.role === 'ai') setTimeout(() => speakText(last.text), 400)
    }
  }

  /* Dynamic suggestions per step */
  const suggestions =
    stepNumber === 1 ? ['What formats work?', 'Max file size?', 'Can I use Google Slides?'] :
    stepNumber === 2 ? ['Upload my own photo?', 'How many avatars?', 'What\'s lip sync?'] :
    stepNumber === 3 ? ['How many languages?', 'Best voice for EU?', 'Can I add subtitles?'] :
    ['How long will it take?', 'How do I share?', 'Download as video?']

  return (
    <>
      {/* ── FAB (shown when minimised) ── */}
      {!isOpen && (
        <button className={styles.fab} onClick={openDialog} aria-label="Open AI assistant">
          <div className={styles.fabFaceWrap}>
            <div className={styles.fabFaceClip}>
              <AvatarCharacter state="idle" />
            </div>
            <span className={styles.fabOnline} />
          </div>
          <div className={styles.fabInfo}>
            <span className={styles.fabName}>Sara</span>
            <span className={styles.fabSub}>AI Assistant · online</span>
          </div>
        </button>
      )}

      {/* ── Dialog ── */}
      {isOpen && (
        <div className={styles.dialog} role="dialog" aria-label="AI avatar assistant">

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.headerDot} />
              <span className={styles.headerName}>Sara</span>
              <span className={styles.headerSep}>·</span>
              <span className={styles.headerStep}>Step {stepNumber}: {stepName}</span>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerBtn}
                onClick={() => isMuted ? setIsMuted(false) : (stopSpeaking(), setIsMuted(true))}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button className={styles.headerBtn} onClick={() => { stopSpeaking(); setIsOpen(false) }} title="Minimise">
                <Minus size={14} />
              </button>
              <button className={styles.headerBtn} onClick={() => { stopSpeaking(); setIsOpen(false) }} title="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ── Character zone ── */}
          <div className={styles.characterZone}>
            {/* Ripples when speaking */}
            {avatarState === 'speaking' && (
              <div className={styles.rippleWrap}>
                <span className={`${styles.ripple} ${styles.ripple1}`} />
                <span className={`${styles.ripple} ${styles.ripple2}`} />
                <span className={`${styles.ripple} ${styles.ripple3}`} />
              </div>
            )}

            {/* Character */}
            <div className={styles.charWrap}>
              <AvatarCharacter state={avatarState} />
            </div>

            {/* Name + status row */}
            <div className={styles.charFooter}>
              <span className={styles.charName}>Sara</span>
              <span className={styles.charDivider}>·</span>
              {avatarState === 'speaking' && (
                <span className={styles.statusSpeaking}>
                  <span className={styles.mouthBars}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={styles.mouthBar} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </span>
                  Speaking…
                </span>
              )}
              {avatarState === 'thinking' && (
                <span className={styles.statusThinking}>
                  <span className={styles.thinkDots}><span /><span /><span /></span>
                  Thinking…
                </span>
              )}
              {avatarState === 'idle' && (
                <span className={styles.statusIdle}>● Ready to help</span>
              )}
            </div>
          </div>

          {/* ── Messages ── */}
          <div className={styles.messages}>
            {messages.map(m => (
              <div
                key={m.id}
                className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}
                onClick={() => m.role === 'ai' && speakText(m.text)}
                title={m.role === 'ai' ? 'Click to replay' : undefined}
              >
                {m.role === 'ai' && (
                  <div className={styles.bubbleAvatarDot}>S</div>
                )}
                <span className={styles.bubbleText}>{m.text}</span>
              </div>
            ))}
            {avatarState === 'thinking' && (
              <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                <div className={styles.bubbleAvatarDot}>S</div>
                <span className={styles.bubbleText}>
                  <span className={styles.thinkDots}><span /><span /><span /></span>
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* ── Quick suggestions ── */}
          <div className={styles.suggestions}>
            {suggestions.map(s => (
              <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          {/* ── Input zone ── */}
          <div className={styles.inputZone}>
            {voiceSupported && (
              <button
                className={`${styles.iconBtn} ${isRecording ? styles.iconBtnRecording : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? 'Stop recording' : 'Ask with voice'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            <button className={styles.iconBtn} onClick={() => audioUploadRef.current?.click()} title="Upload audio">
              <Upload size={16} />
            </button>
            <input ref={audioUploadRef} type="file" accept="audio/*" hidden onChange={handleAudioUpload} />
            <input
              ref={inputRef}
              className={styles.textInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? '🎤 Listening…' : 'Ask Sara anything…'}
              aria-label="Chat input"
              disabled={avatarState === 'thinking'}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim() || avatarState === 'thinking'}
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
