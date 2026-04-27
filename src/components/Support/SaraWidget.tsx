'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Minus, Send, Mic, MicOff, Upload, Volume2, VolumeX, Sparkles, MessageSquare } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useAuth } from '@/context/AuthContext'
import { useSupportChatStore } from '@/lib/supportStore'
import { useUIStore } from '@/lib/store'
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
  let chips: string[] = ["How it works?", "Talk to support"]
  
  if (isQuickWizard) {
    headerTitle = "Quick Wizard: Steps"
    chips = ["What formats work?", "Max file size?", "Tutorial video"]
  } else if (isCreation) {
    headerTitle = "Project Settings"
    chips = ["Name your project", "Select language", "Help with mode"]
  } else if (isEditor) {
    headerTitle = "Localization Editor"
    chips = ["How to dub?", "Change voice style", "Preview slide"]
  }
  
  // Personalization based on mainGoal
  if (mainGoal === 'sales') {
    chips.push("How to share with client?")
  } else if (mainGoal === 'course') {
    chips.push("How to create a lesson?")
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
  
  const [input, setInput] = useState('')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  
  const endRef = useRef<HTMLDivElement>(null)
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
    
    setTimeout(() => {
      // Logic for special commands or RAG-like response
      let reply = FALLBACK_RESPONSE
      
      if (txt.toLowerCase().includes('formats') || txt.toLowerCase().includes('upload')) {
        reply = "You can upload PDF or PPTX files up to 100 MB. Click 'Browse Files' to start! 📎"
      } else if (txt.toLowerCase().includes('support') || txt.toLowerCase().includes('operator')) {
        reply = "Sure! I'll connect you with our support team. Opening the help desk now..."
        // @ts-ignore
        if (window.openStonlyGuide) window.openStonlyGuide()
        posthog.capture('chat_avatar_handoff_requested')
      } else if (txt.toLowerCase().includes('tutorial') || txt.toLowerCase().includes('show me')) {
        reply = "I'll start an interactive tour for you!"
        handleTourTrigger('upload-tour')
      }

      addMessage({ role: 'ai', text: reply })
      setAvatarState('idle')
      setIsTyping(false)
      speakText(reply)
    }, 1500)
  }, [input, addMessage, posthog, pathname, speakText, handleTourTrigger])

  if (!isEnabled || isChecklistOpen || isLabDeployment) return null

  return (
    <>
      {/* ── FAB ── */}
      {!isOpen && (
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
        <div className={styles.dialog}>
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
              <button className={styles.headerBtn} onClick={toggleChat}><Minus size={14} /></button>
              <button className={styles.headerBtn} onClick={toggleChat}><X size={14} /></button>
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
                <span className={styles.bubbleText}>{m.text}</span>
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
          <div className={styles.suggestions}>
            {chips.map(s => (
              <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          {/* Input */}
          <div className={styles.inputZone}>
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
