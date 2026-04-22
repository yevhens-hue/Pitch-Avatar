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
    return "I'm Max, your Pitch Avatar assistant! I can help with uploading, choosing avatars, voice setup, and more. What would you like to know? 😊"
  return FALLBACK
}

/* ── Business male character SVG — waist-up ── */
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
      {/* ── Suit jacket body ── */}
      <path d="M22 248 L36 192 C54 178 82 186 90 196 L100 224 L110 196 C118 186 146 178 164 192 L178 248Z" fill="#1a2840" />
      {/* Jacket sheen / lapel edge */}
      <path d="M90 196 L100 224 L82 210 L70 195Z" fill="#223255" />
      <path d="M110 196 L100 224 L118 210 L130 195Z" fill="#223255" />
      {/* Jacket pocket square (left breast) */}
      <rect x="52" y="210" width="16" height="10" rx="2" fill="#e2e8f0" opacity="0.6" />
      <line x1="55" y1="210" x2="55" y2="220" stroke="white" strokeWidth="1" opacity="0.5" />

      {/* ── White shirt visible between lapels ── */}
      <polygon points="91,158 100,226 109,158" fill="#f8fafc" />
      {/* Shirt collar left */}
      <path d="M91 158 L74 180 L91 172Z" fill="#f8fafc" />
      {/* Shirt collar right */}
      <path d="M109 158 L126 180 L109 172Z" fill="#f8fafc" />
      {/* Shirt button dots */}
      <circle cx="100" cy="178" r="1.5" fill="#d1d5db" />
      <circle cx="100" cy="190" r="1.5" fill="#d1d5db" />

      {/* ── Tie ── */}
      <path d="M96 165 L100 212 L104 165 L100 158Z" fill="#6366f1" />
      {/* Tie knot */}
      <path d="M96 165 L100 172 L104 165 L100 161Z" fill="#4338ca" />
      {/* Tie stripe */}
      <line x1="99" y1="175" x2="101" y2="208" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />

      {/* ── Neck ── */}
      <rect x="89" y="156" width="22" height="46" rx="8" fill="#F0C080" />

      {/* ── Head base (skin) ── */}
      <ellipse cx="100" cy="113" rx="53" ry="58" fill="#F0C080" />

      {/* ── Short hair cap (top of head) ── */}
      {/* Hair covers top portion - drawn over the head ellipse's upper area */}
      <path d="M48 100 Q52 54 100 50 Q148 54 152 100 Q138 72 100 70 Q62 72 48 100Z" fill="#1E120A" />
      {/* Side hair strips */}
      <rect x="46" y="90" width="9" height="36" rx="4" fill="#1E120A" />
      <rect x="145" y="90" width="9" height="36" rx="4" fill="#1E120A" />

      {/* ── Sideburns ── */}
      <path d="M47 124 Q45 135 48 146" stroke="#1E120A" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M153 124 Q155 135 152 146" stroke="#1E120A" strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* ── Eyebrows (thick, professional) ── */}
      <path d="M70 90 Q82 84 93 88" stroke="#1E120A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M107 88 Q118 84 130 90" stroke="#1E120A" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* ── Eye whites ── */}
      <ellipse cx="82" cy="105" rx="12.5" ry="10" fill="white" />
      <ellipse cx="118" cy="105" rx="12.5" ry="10" fill="white" />

      {/* ── Irises (grey-blue, professional) ── */}
      <ellipse cx="82" cy="106" rx="7.5" ry="8" fill="#5B7FA6" />
      <ellipse cx="118" cy="106" rx="7.5" ry="8" fill="#5B7FA6" />

      {/* ── Pupils ── */}
      <circle cx="83" cy="107" r="4" fill="#0f172a" />
      <circle cx="119" cy="107" r="4" fill="#0f172a" />

      {/* ── Eye highlights ── */}
      <circle cx="85.5" cy="103.5" r="2.2" fill="white" opacity="0.95" />
      <circle cx="121.5" cy="103.5" r="2.2" fill="white" opacity="0.95" />

      {/* ── Eyelids (blink animation) ── */}
      <ellipse cx="82" cy="105" rx="12.5" ry="10" fill="#F0C080" className={styles.eyelidL} />
      <ellipse cx="118" cy="105" rx="12.5" ry="10" fill="#F0C080" className={styles.eyelidR} />

      {/* ── Nose (stronger, male) ── */}
      <path d="M95 120 Q98 130 100 131 Q102 130 105 120" fill="none" stroke="#c8914a" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="96" cy="130" rx="3" ry="2" fill="#c8914a" opacity="0.5" />
      <ellipse cx="104" cy="130" rx="3" ry="2" fill="#c8914a" opacity="0.5" />

      {/* ── Subtle stubble (5 o'clock shadow) ── */}
      <ellipse cx="100" cy="148" rx="32" ry="16" fill="#1E120A" opacity="0.06" />
      <ellipse cx="72"  cy="145" rx="10" ry="8"  fill="#1E120A" opacity="0.05" />
      <ellipse cx="128" cy="145" rx="10" ry="8"  fill="#1E120A" opacity="0.05" />

      {/* ── MOUTH STATES ── */}
      {/* Idle: confident slight smile */}
      <path
        d="M88 138 Q100 148 112 138"
        stroke="#a0634a" strokeWidth="2.5" strokeLinecap="round" fill="none"
        className={styles.mouthSmile}
      />
      {/* Speaking: open mouth */}
      <g className={styles.mouthSpeakGroup}>
        <ellipse cx="100" cy="141" rx="11" ry="8" fill="#a0634a" />
        <ellipse cx="100" cy="142" rx="7.5" ry="5" fill="#5a1a1a" />
        <line x1="89" y1="141" x2="111" y2="141" stroke="white" strokeWidth="1" opacity="0.25" />
      </g>
      {/* Thinking: small o */}
      <ellipse cx="100" cy="140" rx="6" ry="5" fill="none" stroke="#a0634a" strokeWidth="2" className={styles.mouthThink} />
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
            <span className={styles.fabName}>Max</span>
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
              <span className={styles.headerName}>Max</span>
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
              <span className={styles.charName}>Max</span>
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
                  <div className={styles.bubbleAvatarDot}>M</div>
                )}
                <span className={styles.bubbleText}>{m.text}</span>
              </div>
            ))}
            {avatarState === 'thinking' && (
              <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                <div className={styles.bubbleAvatarDot}>M</div>
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
              placeholder={isRecording ? '🎤 Listening…' : 'Ask Max anything…'}
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
