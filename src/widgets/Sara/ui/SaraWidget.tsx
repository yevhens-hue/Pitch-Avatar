'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSaraStore } from '../store/useSaraStore'
import { captureSaraEvent } from '../analytics/posthog'
import { useAuth } from '@/context/AuthContext'
import { useSaraIdleDetector } from '../hooks/useSaraIdleDetector'
import { useSaraEventDetector } from '../hooks/useSaraEventDetector'
import ProactiveBubble from './components/ProactiveBubble'

export default function SaraWidget() {
  const pathname = usePathname()
  const { user } = useAuth()
  const mainGoal = user?.user_metadata?.main_goal ?? null

  const { isOpen, isDismissed, toggleChat } = useSaraStore()

  useSaraIdleDetector(pathname, mainGoal)
  useSaraEventDetector(pathname, mainGoal)

  useEffect(() => {
    captureSaraEvent('chat_avatar_rendered', { screen: pathname, main_goal: mainGoal })
  }, [pathname, mainGoal])

  // If permanently dismissed in this session, don't show anything
  if (isDismissed) return null

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {!isOpen && <ProactiveBubble />}
      {!isOpen ? (
        <button 
          onClick={() => {
            toggleChat()
            captureSaraEvent('chat_avatar_opened', { screen: pathname, main_goal: mainGoal })
          }}
          style={{
            width: '60px', height: '60px', borderRadius: '30px', 
            backgroundColor: '#6366f1', color: 'white', border: 'none',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          Sara
        </button>
      ) : (
        <div style={{ 
          width: '350px', height: '500px', backgroundColor: 'white', 
          borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <strong>Sara Assistant</strong>
            <button onClick={toggleChat} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {/* Chat History will go here */}
            <p>Chat interface skeleton</p>
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
            {/* Input will go here */}
            <input type="text" placeholder="Ask Sara anything..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>
      )}
    </div>
  )
}
