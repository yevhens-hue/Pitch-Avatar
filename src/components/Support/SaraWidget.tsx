'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Minus, Send, Mic, MicOff, Upload, Volume2, VolumeX, Sparkles, MessageSquare, MoreHorizontal, RefreshCw, Info } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useAuth } from '@/context/AuthContext'
import { useSupportChatStore } from '@/lib/supportStore'
import { useUIStore } from '@/lib/store'
import { useKnowledgeStore } from '@/lib/knowledgeStore'
import styles from './SaraWidget.module.css'

/* ── Types ── */
type AvatarState = 'idle' | 'thinking' | 'speaking'

/* ── Constants & Contextual Logic ── */
const FALLBACK_RESPONSE = "Great question! I'm still learning, but I can help you with uploading files, choosing avatars, or launching interactive tours. What would you like to do? 😊"

const GET_CONTEXTUAL_DATA = (pathname: string, mainGoal: string | null) => {
  const isQuickWizard = pathname.includes('/create/quick')
  const isCreation = pathname.includes('/create')
  const isEditor = pathname.includes('/editor')
  
  let headerTitle = "Support Assistant"
  let chips: string[] = ["How it works?", "Talk to support", "Billing questions", "My account", "Report an issue", "Feature request"]
  
  if (isQuickWizard) {
    headerTitle = "Quick Wizard: Steps"
    chips = ["What formats work?", "Max file size?", "Tutorial video", "How to name avatar?", "Best voice for sales?", "Can I change language later?"]
  } else if (isCreation) {
    headerTitle = "Project Settings"
    chips = ["Name your project", "Select language", "Help with mode", "Change voice", "Add music?", "Share draft"]
  } else if (isEditor) {
    headerTitle = "Localization Editor"
    chips = ["How to dub?", "Change voice style", "Preview slide", "Edit transcript", "Add subtitles", "Translate to Spanish"]
  }
  
  return { headerTitle, chips }
}

/* ── SVG Character (Sara) ── */
const AvatarCharacter = ({ state, size = 'full' }: { state: AvatarState; size?: 'full' | 'mini' }) => {
  const cls = [
    styles.charSvg,
    size === 'mini' ? styles.charSvgMini : '',
    state === 'speaking' ? styles.charSpeaking : '',
    state === 'thinking' ? styles.charThinking : '',
  ].filter(Boolean).join(' ')

  return (
    <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" className={cls} aria-hidden="true">
      <path d="M22 248 L36 194 C54 180 80 187 90 197 L100 226 L110 197 C120 187 146 180 164 194 L178 248Z" fill="#1a2840" />
      <path d="M90 197 L100 226 L82 211 L70 196Z" fill="#223255" />
      <path d="M110 197 L100 226 L118 211 L130 196Z" fill="#223255" />
      <polygon points="86,157 100,228 114,157" fill="#f8fafc" />
      <path d="M86 157 L68 177 L86 168Z" fill="#f8fafc" />
      <path d="M114 157 L132 177 L114 168Z" fill="#f8fafc" />
      <circle cx="100" cy="163" r="5"   fill="#c7d2fe" />
      <circle cx="100" cy="163" r="2.8" fill="#6366f1" />
      <rect x="90" y="155" width="20" height="46" rx="8" fill="#F2C090" />
      <ellipse cx="100" cy="115" rx="50" ry="56" fill="#F2C090" />
      <ellipse cx="100" cy="88" rx="52" ry="44" fill="#180E06" />
      <path d="M50 96 Q47 120 50 152" stroke="#180E06" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M150 96 Q153 120 150 152" stroke="#180E06" strokeWidth="10" strokeLinecap="round" fill="none" />
      <ellipse cx="100" cy="122" rx="46" ry="52" fill="#F2C090" />
      <path d="M54 98 Q58 68 100 63 Q142 68 146 98 Q132 78 100 76 Q68 78 54 98Z" fill="#180E06" />
      <ellipse cx="100" cy="60" rx="18" ry="14" fill="#180E06" />
      <circle cx="52" cy="128" r="5"   fill="#EDE8E0" />
      <circle cx="148" cy="128" r="5"   fill="#EDE8E0" />
      <path d="M71 93 Q82 87 93 91" stroke="#180E06" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M107 91 Q118 87 129 93" stroke="#180E06" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <ellipse cx="82" cy="108" rx="11.5" ry="9.5" fill="white" />
      <ellipse cx="118" cy="108" rx="11.5" ry="9.5" fill="white" />
      <ellipse cx="82"  cy="109" rx="7"   ry="7.5" fill="#6B4020" />
      <ellipse cx="118" cy="109" rx="7"   ry="7.5" fill="#6B4020" />
      <circle cx="82.5"  cy="110" r="4"   fill="#0f0a06" />
      <circle cx="118.5" cy="110" r="4"   fill="#0f0a06" />
      <circle cx="85"   cy="107" r="2"   fill="white" opacity="0.95" />
      <circle cx="121"  cy="107" r="2"   fill="white" opacity="0.95" />
      <ellipse cx="82"  cy="108" rx="11.5" ry="9.5" fill="#F2C090" className={styles.eyelidL} />
      <ellipse cx="118" cy="108" rx="11.5" ry="9.5" fill="#F2C090" className={styles.eyelidR} />
      <rect x="68"  y="101" width="28" height="16" rx="3" fill="none" stroke="#1a1a2e" strokeWidth="2"   />
      <rect x="104" y="101" width="28" height="16" rx="3" fill="none" stroke="#1a1a2e" strokeWidth="2"   />
      <line x1="96" y1="109" x2="104" y2="109" stroke="#1a1a2e" strokeWidth="2" />
      <path d="M96 124 Q100 131 104 124" fill="none" stroke="#c8884a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M90 138 Q100 146 110 138" stroke="#8B3A2A" strokeWidth="2.2" strokeLinecap="round" fill="none" className={styles.mouthSmile} />
      <g className={styles.mouthSpeakGroup}>
        <ellipse cx="100" cy="141" rx="10" ry="7.5" fill="#8B3A2A" />
        <ellipse cx="100" cy="142" rx="6.5" ry="4.5" fill="#4a0f0f" />
      </g>
      <ellipse cx="100" cy="140" rx="5.5" ry="4.5" fill="none" stroke="#8B3A2A" strokeWidth="2" className={styles.mouthThink} />
    </svg>
  )
}

/* ── Main Component ── */
export default function SaraWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const posthog = usePostHog()
  const { user } = useAuth()
  const { isOpen, toggleChat, messages, addMessage, isMuted, setMuted } = useSupportChatStore()
  const { isChecklistOpen } = useUIStore()
  const { settings: knowledgeSettings } = useKnowledgeStore()
  
  const [input, setInput] = useState('')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [chipPage, setChipPage] = useState(0)
  
  const endRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const mainGoal = user?.user_metadata?.main_goal ?? null
  const { headerTitle, chips } = useMemo(() => GET_CONTEXTUAL_DATA(pathname, mainGoal), [pathname, mainGoal])

  // Hide on lab deployment (runtime hostname check — works even if env var is not set in Vercel)
  const isLabDeployment = typeof window !== 'undefined' && window.location.hostname.includes('pitch-avatar-lab')

  // PostHog Feature Flag
  const isEnabled = posthog.isFeatureEnabled('chat-avatar-support')
  
  useEffect(() => {
    if (isEnabled) {
      posthog.capture('chat_avatar_rendered', { screen: pathname, main_goal: mainGoal })
    }
  }, [isEnabled, posthog, pathname, mainGoal])

  useEffect(() => {
    setVoiceSupported(typeof window !== 'undefined' && (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window)))
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, avatarState])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        toggleChat()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, toggleChat])

  /* ── Interaction Logic ── */
  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isMuted) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.0; u.pitch = 1.15; u.lang = 'en-US'
    u.onstart = () => setAvatarState('speaking')
    u.onend = () => setAvatarState('idle')
    window.speechSynthesis.speak(u)
  }, [isMuted])

  const handleTourTrigger = useCallback((tourId: string, targetScreen?: string) => {
    posthog.capture('chat_avatar_tour_triggered', { tour_id: tourId, screen: pathname })
    
    if (targetScreen && pathname !== targetScreen) {
      router.push(targetScreen)
      setTimeout(() => {
        // @ts-ignore
        if (window.Guideglow) window.Guideglow.startTour(tourId)
      }, 800)
    } else {
      // @ts-ignore
      if (window.Guideglow) window.Guideglow.startTour(tourId)
    }
    toggleChat() // Close chat when tour starts as per Mobile requirement in PRD
  }, [pathname, router, posthog, toggleChat])

  const sendMessage = useCallback((text?: string) => {
    const txt = (text ?? input).trim()
    if (!txt) return
    
    setInput('')
    addMessage({ role: 'user', text: txt })
    posthog.capture('chat_avatar_message_sent', { text: txt, screen: pathname })
    
    setAvatarState('thinking')
    setIsTyping(true)
    
    // Call our refined RAG API
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: txt,
        settings: knowledgeSettings
      })
    })
    .then(res => res.json())
    .then(data => {
      const reply = data.message || FALLBACK_RESPONSE
      const source = data.source || 'AI'
      
      addMessage({ role: 'ai', text: reply, source: source })
      setAvatarState('idle')
      setIsTyping(false)
      speakText(reply)

      // Handle special triggers if RAG returns specific text (or we can extend API to return actions)
      if (reply.toLowerCase().includes('connect you with our support team')) {
        // @ts-ignore
        if (window.openStonlyGuide) window.openStonlyGuide()
        posthog.capture('chat_avatar_handoff_requested')
      } else if (reply.toLowerCase().includes('start an interactive tour')) {
        handleTourTrigger('upload-tour')
      }
    })
    .catch(err => {
      console.error('Sara API Error:', err)
      addMessage({ role: 'ai', text: "I'm having trouble connecting to my knowledge base. How else can I help?" })
      setAvatarState('idle')
      setIsTyping(false)
    })
  }, [input, addMessage, posthog, pathname, speakText, handleTourTrigger, knowledgeSettings])

  if (!isEnabled || isChecklistOpen || isLabDeployment) return null

  return (
    <>
      {/* ── FAB ── */}
      {!isOpen && !isDismissed && (
        <button className={styles.fab} onClick={() => { toggleChat(); posthog.capture('chat_avatar_opened', { screen: pathname }) }}>
          <div className={styles.fabFaceWrap}>
            <div className={styles.fabFaceClip}><AvatarCharacter state="idle" /></div>
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
        <div className={styles.dialog} ref={dialogRef}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.headerDot} />
              <span className={styles.headerName}>Sara</span>
              <span className={styles.headerSep}>·</span>
              <span className={styles.headerStep}>{headerTitle}</span>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.headerBtn} onClick={() => setMuted(!isMuted)}>
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button className={styles.headerBtn}>
                <MoreHorizontal size={14} />
              </button>
              <button className={styles.headerBtn} onClick={() => { setIsDismissed(true); if(isOpen) toggleChat(); }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Character Zone */}
          <div className={styles.characterZone}>
            <div className={styles.charWrap}><AvatarCharacter state={avatarState} /></div>
            <div className={styles.charFooter}>
              <span className={styles.charName}>Sara</span>
              <span className={styles.charDivider}>·</span>
              {avatarState === 'speaking' ? <span className={styles.statusSpeaking}>Speaking…</span> : 
               avatarState === 'thinking' ? <span className={styles.statusThinking}>Thinking…</span> : 
               <span className={styles.statusIdle}>● Ready to help</span>}
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.bubbleAi}>
                <div className={styles.bubbleAvatarDot}>S</div>
                <span className={styles.bubbleText}>Hi! I'm Sara. How can I help you on this page?</span>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`${styles.bubble} ${m.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                {m.role === 'ai' && <div className={styles.bubbleAvatarDot}>S</div>}
                <div className={styles.bubbleBody}>
                    <span className={styles.bubbleText}>{m.text}</span>
                    {m.source && m.source !== 'AI' && (
                        <div className={styles.bubbleSource}><Info size={10} /> Source: {m.source}</div>
                    )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={styles.bubbleAi}>
                <div className={styles.bubbleAvatarDot}>S</div>
                <div className={styles.bubbleText}>
                  <div className={styles.typing}><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className={styles.suggestionsWrap}>
            <div className={styles.suggestions}>
              {chips.slice(chipPage * 3, chipPage * 3 + 3).map(s => (
                <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
            {chips.length > 3 && (
              <button className={styles.refreshChipsBtn} onClick={() => setChipPage(p => (p + 1) * 3 >= chips.length ? 0 : p + 1)}>
                <RefreshCw size={14} />
              </button>
            )}
          </div>

          {/* Input */}
          <div className={styles.inputZone}>
            <button className={`${styles.iconBtn} ${isRecording ? styles.iconBtnRecording : ''}`} onClick={() => setIsRecording(!isRecording)}>
              {isRecording ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <input
              className={styles.textInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Sara anything…"
              disabled={avatarState === 'thinking'}
            />
            <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={!input.trim() || avatarState === 'thinking'}>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
