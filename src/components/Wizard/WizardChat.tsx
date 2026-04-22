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
    return "I'm Ava, your Pitch Avatar assistant! I can help with uploading, choosing avatars, voice setup, and more. What would you like to know? 😊"
  return FALLBACK
}

/* ── Cute character SVG — waist-up ── */
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
      {/* ── Shirt / body ── */}
      <ellipse cx="100" cy="256" rx="88" ry="52" fill="#5254d8" />
      <rect x="32" y="200" width="136" height="48" rx="10" fill="#6366f1" />
      {/* shirt highlight stripe */}
      <rect x="32" y="200" width="68" height="48" rx="10" fill="#7577f5" />
      {/* V-neck */}
      <path d="M82 198 L100 222 L118 198" fill="none" stroke="#4338ca" strokeWidth="2.5" />

      {/* ── Neck ── */}
      <rect x="88" y="158" width="24" height="46" rx="10" fill="#FFCDA8" />

      {/* ── Head base ── */}
      <ellipse cx="100" cy="112" rx="56" ry="60" fill="#FFCDA8" />

      {/* ── Hair back ── */}
      <ellipse cx="100" cy="86" rx="59" ry="54" fill="#2D1B10" />

      {/* ── Hair sides (flowing down) ── */}
      <path d="M41 96 Q24 150 40 200" stroke="#2D1B10" strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d="M159 96 Q176 150 160 200" stroke="#2D1B10" strokeWidth="26" strokeLinecap="round" fill="none" />

      {/* ── Face (over hair) ── */}
      <ellipse cx="100" cy="120" rx="50" ry="55" fill="#FFCDA8" />

      {/* ── Bangs ── */}
      <path d="M50 88 Q57 54 100 50 Q143 54 150 88 Q128 70 100 68 Q72 70 50 88Z" fill="#2D1B10" />

      {/* ── Cheek blush ── */}
      <ellipse cx="66" cy="130" rx="13" ry="8" fill="#FFB3A7" opacity="0.5" />
      <ellipse cx="134" cy="130" rx="13" ry="8" fill="#FFB3A7" opacity="0.5" />

      {/* ── Eyebrows ── */}
      <path d="M71 90 Q82 84 92 89" stroke="#3D2310" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M108 89 Q118 84 129 90" stroke="#3D2310" strokeWidth="2.8" strokeLinecap="round" fill="none" />

      {/* ── Eye whites ── */}
      <ellipse cx="82" cy="107" rx="13" ry="11" fill="white" />
      <ellipse cx="118" cy="107" rx="13" ry="11" fill="white" />

      {/* ── Irises ── */}
      <ellipse cx="82" cy="108" rx="8" ry="8.5" fill="#4A8FE0" />
      <ellipse cx="118" cy="108" rx="8" ry="8.5" fill="#4A8FE0" />

      {/* ── Pupils ── */}
      <circle cx="83" cy="109" r="4.5" fill="#12122a" />
      <circle cx="119" cy="109" r="4.5" fill="#12122a" />

      {/* ── Eye highlights ── */}
      <circle cx="85.5" cy="105.5" r="2.5" fill="white" opacity="0.95" />
      <circle cx="121.5" cy="105.5" r="2.5" fill="white" opacity="0.95" />

      {/* ── Eyelids (blink animation — skin-coloured overlay) ── */}
      <ellipse cx="82" cy="107" rx="13" ry="11" fill="#FFCDA8" className={styles.eyelidL} />
      <ellipse cx="118" cy="107" rx="13" ry="11" fill="#FFCDA8" className={styles.eyelidR} />

      {/* ── Lash line ── */}
      <path d="M69 101 Q82 96 95 101" stroke="#2D1B10" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M105 101 Q118 96 131 101" stroke="#2D1B10" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.55" />

      {/* ── Nose ── */}
      <ellipse cx="100" cy="126" rx="3.5" ry="2.5" fill="#d99870" />
      <path d="M95.5 127 Q100 132 104.5 127" fill="none" stroke="#d99870" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── MOUTH STATES ── */}
      {/* Idle: soft smile */}
      <path
        d="M86 139 Q100 152 114 139"
        stroke="#c06050" strokeWidth="2.8" strokeLinecap="round" fill="none"
        className={styles.mouthSmile}
      />
      {/* Speaking: open oval */}
      <g className={styles.mouthSpeakGroup}>
        <ellipse cx="100" cy="143" rx="12" ry="9" fill="#c06050" />
        <ellipse cx="100" cy="144" rx="8" ry="5.5" fill="#7a1830" />
        <line x1="88" y1="143" x2="112" y2="143" stroke="white" strokeWidth="1" opacity="0.3" />
      </g>
      {/* Thinking: small surprised-o */}
      <ellipse cx="100" cy="141" rx="6" ry="5" fill="none" stroke="#c06050" strokeWidth="2.2" className={styles.mouthThink} />

      {/* ── Earrings ── */}
      <circle cx="44" cy="118" r="4.5" fill="#a5b4fc" />
      <circle cx="44" cy="125" r="3.2" fill="#c7d2fe" />
      <circle cx="156" cy="118" r="4.5" fill="#a5b4fc" />
      <circle cx="156" cy="125" r="3.2" fill="#c7d2fe" />
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
            <span className={styles.fabName}>Ava</span>
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
              <span className={styles.headerName}>Ava</span>
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
              <span className={styles.charName}>Ava</span>
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
                  <div className={styles.bubbleAvatarDot}>A</div>
                )}
                <span className={styles.bubbleText}>{m.text}</span>
              </div>
            ))}
            {avatarState === 'thinking' && (
              <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                <div className={styles.bubbleAvatarDot}>A</div>
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
              placeholder={isRecording ? '🎤 Listening…' : 'Ask Ava anything…'}
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
