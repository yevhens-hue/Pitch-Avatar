'use client'

import React, {
  useState, useEffect, useRef, useCallback, useReducer,
} from 'react'
import { X, Minus, Send, Mic, MicOff, Upload, Volume2, VolumeX } from 'lucide-react'
import styles from './WizardChat.module.css'

/* ── Types ─────────────────────────────────────────── */
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

/* ── Tiny ID ─────────────────────────────────────────── */
let _id = 0
const uid = () => `m${++_id}`

/* ── Mock AI brain ───────────────────────────────────── */
const FALLBACK = "Great question! Feel free to check the Watch Tutorial button on the left if you'd prefer a video walkthrough."

function buildResponse(q: string, ctx: { stepName: string; wizardTitle: string }): string {
  const lc = q.toLowerCase()
  if (/upload|file|pdf|pptx|drag|drop|format/.test(lc))
    return 'You can upload PDF or PPTX files up to 100 MB. Just drag the file onto the drop zone or click Browse Files. Canva and Google Slides imports are also supported.'
  if (/avatar|face|photo|look|character|presenter/.test(lc))
    return 'You can pick any of the built-in AI avatars or upload your own photo. The avatar will be lip-synced to your script automatically — no video recording required.'
  if (/voice|language|speak|accent|tts|audio|dub|translate/.test(lc))
    return 'We support 29 plus languages. Choose your target language and pick an AI voice that matches your brand. Florian works great for most European languages.'
  if (/subtitle|caption|text|srt/.test(lc))
    return 'Enable Add Subtitles in the Dubbing Settings step. Subtitles will be burned into the dubbed video automatically.'
  if (/lip.?sync|lipsync|mouth/.test(lc))
    return 'Lip sync matches the avatar mouth movements to the dubbed audio track. It is enabled by default — you can turn it off in Dubbing Settings if you only want the audio replaced.'
  if (/how.?long|time|duration|wait|minutes|fast/.test(lc))
    return 'Processing typically takes 1 to 3 minutes per slide, or 1 minute per video minute, depending on length and settings. You will get a notification when it is done.'
  if (/cost|credit|plan|price|paid|free|trial/.test(lc))
    return 'Your current plan includes AI Avatar minutes as shown in the sidebar. Each generated minute of video uses roughly 1 minute of your AI quota.'
  if (/next|after|then|done|finish|what.?now/.test(lc))
    return `Once you are done with ${ctx.stepName}, click Next at the bottom right. You can always click a completed step in the sidebar to go back and change settings.`
  if (/script|text|word|content|write|notes/.test(lc))
    return 'The AI can auto-generate a script from your slide content, or you can use your existing Presenter Notes. You can also set the approximate words per slide to control pacing.'
  if (/export|download|share|link|publish|send/.test(lc))
    return 'After generation, your project will appear in the Projects section. From there you can share a link, embed it, or download the video file.'
  if (/help|what.?can|how.?to|guide|tutorial|explain/.test(lc))
    return 'I am your Pitch Avatar assistant! I can answer questions about this wizard step — uploading files, choosing avatars, configuring voice, or understanding settings. What would you like to know?'
  return FALLBACK
}

/* ── Mouth bar visualiser ────────────────────────────── */
const MouthBars = ({ active }: { active: boolean }) => (
  <div className={`${styles.mouthBars} ${active ? styles.mouthBarsActive : ''}`}>
    {[...Array(7)].map((_, i) => (
      <span key={i} className={styles.mouthBar} style={{ animationDelay: `${i * 0.08}s` }} />
    ))}
  </div>
)

/* ── Component ─────────────────────────────────────── */
export default function WizardChat({
  stepName, stepNumber, wizardTitle, hint,
}: WizardChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)
  const [prevStep, setPrevStep] = useState(stepNumber)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioUploadRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  /* Check API support */
  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window))
    )
    setTtsSupported(
      typeof window !== 'undefined' && 'speechSynthesis' in window
    )
  }, [])

  /* Push hint on step change */
  useEffect(() => {
    if (stepNumber === prevStep && messages.length > 0) return
    setPrevStep(stepNumber)
    const msg: Message = { id: uid(), role: 'ai', text: hint }
    setMessages(prev => [...prev, msg])
    if (isOpen) speakText(hint)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepNumber, hint])

  /* Auto-scroll */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, avatarState])

  /* Focus input when opened */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200)
  }, [isOpen])

  /* TTS helper */
  const speakText = useCallback((text: string) => {
    if (!ttsSupported || isMuted) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.0
    u.pitch = 1.05
    u.lang = 'en-US'
    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      /samantha|google us english|zira|david|alex/i.test(v.name)
    )
    if (preferred) u.voice = preferred
    u.onstart = () => setAvatarState('speaking')
    u.onend = () => setAvatarState('idle')
    u.onerror = () => setAvatarState('idle')
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
  }, [ttsSupported, isMuted])

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setAvatarState('idle')
  }

  /* Send message */
  const sendMessage = useCallback((text?: string) => {
    const txt = (text ?? input).trim()
    if (!txt) return
    setInput('')
    stopSpeaking()

    const userMsg: Message = { id: uid(), role: 'user', text: txt }
    setMessages(prev => [...prev, userMsg])
    setAvatarState('thinking')

    const delay = 600 + Math.random() * 700
    setTimeout(() => {
      const reply = buildResponse(txt, { stepName, wizardTitle })
      const aiMsg: Message = { id: uid(), role: 'ai', text: reply }
      setMessages(prev => [...prev, aiMsg])
      setAvatarState('idle')
      speakText(reply)
    }, delay)
  }, [input, stepName, wizardTitle, speakText])

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
      setInput(transcript)
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

  /* Audio file upload */
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    // Mock: treat filename as question context
    const mockQ = `I uploaded an audio file: "${file.name}". Can you help me with this step?`
    sendMessage(mockQ)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  /* Open dialog and speak first hint */
  const openDialog = () => {
    setIsOpen(true)
    if (messages.length > 0) {
      const last = messages[messages.length - 1]
      if (last.role === 'ai') setTimeout(() => speakText(last.text), 400)
    }
  }

  /* ── Render ── */
  return (
    <>
      {/* FAB trigger */}
      {!isOpen && (
        <button className={styles.fab} onClick={openDialog} aria-label="Open AI assistant">
          <img
            src="https://i.pravatar.cc/56?u=wizard-assistant"
            alt="AI assistant"
            className={styles.fabAvatar}
          />
          <span className={styles.fabOnline} />
          <span className={styles.fabLabel}>AI Assistant</span>
        </button>
      )}

      {/* Dialog */}
      {isOpen && (
        <div className={styles.dialog} role="dialog" aria-label="AI avatar assistant">

          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.headerDot} />
              <span className={styles.headerName}>Pitch Avatar AI</span>
              <span className={styles.headerStep}>· Step {stepNumber}: {stepName}</span>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerBtn}
                onClick={() => { isMuted ? setIsMuted(false) : (stopSpeaking(), setIsMuted(true)) }}
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

          {/* ── Avatar zone ── */}
          <div className={styles.avatarZone}>
            <div className={`${styles.avatarRing} ${avatarState === 'speaking' ? styles.avatarRingSpeaking : ''}`}>
              {/* Ripple rings */}
              {avatarState === 'speaking' && (
                <>
                  <span className={`${styles.ripple} ${styles.ripple1}`} />
                  <span className={`${styles.ripple} ${styles.ripple2}`} />
                  <span className={`${styles.ripple} ${styles.ripple3}`} />
                </>
              )}
              <img
                src="https://i.pravatar.cc/96?u=wizard-assistant"
                alt="AI avatar"
                className={`${styles.avatarImg} ${avatarState === 'speaking' ? styles.avatarImgSpeaking : ''}`}
              />
            </div>

            {/* State label */}
            <div className={styles.avatarStatus}>
              {avatarState === 'speaking' && (
                <span className={styles.statusSpeaking}>
                  <MouthBars active /> Speaking…
                </span>
              )}
              {avatarState === 'thinking' && (
                <span className={styles.statusThinking}>
                  <span className={styles.thinkDots}><span /><span /><span /></span> Thinking…
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
                  <img
                    src="https://i.pravatar.cc/28?u=wizard-assistant"
                    alt=""
                    className={styles.bubbleAvatar}
                  />
                )}
                <span className={styles.bubbleText}>{m.text}</span>
              </div>
            ))}
            {avatarState === 'thinking' && (
              <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                <img src="https://i.pravatar.cc/28?u=wizard-assistant" alt="" className={styles.bubbleAvatar} />
                <span className={styles.bubbleText}>
                  <span className={styles.thinkDots}><span /><span /><span /></span>
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* ── Quick suggestions ── */}
          <div className={styles.suggestions}>
            {['How long will this take?', 'What formats are supported?', 'How do I share my result?'].map(s => (
              <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          {/* ── Input zone ── */}
          <div className={styles.inputZone}>
            {/* Mic */}
            {voiceSupported && (
              <button
                className={`${styles.iconBtn} ${isRecording ? styles.iconBtnRecording : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? 'Stop recording' : 'Record voice question'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}

            {/* Audio file upload */}
            <button
              className={styles.iconBtn}
              onClick={() => audioUploadRef.current?.click()}
              title="Upload audio question"
            >
              <Upload size={16} />
            </button>
            <input
              ref={audioUploadRef}
              type="file"
              accept="audio/*"
              hidden
              onChange={handleAudioUpload}
            />

            {/* Text input */}
            <input
              ref={inputRef}
              className={styles.textInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? '🎤 Listening…' : 'Ask anything about this step…'}
              aria-label="Chat input"
              disabled={avatarState === 'thinking'}
            />

            {/* Send */}
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
