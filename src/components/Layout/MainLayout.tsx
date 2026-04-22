'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '@/constants'
import OnboardingLabOverlay from '@/components/Wizard/OnboardingLabOverlay'
import { useUIStore } from '@/lib/store'
import { useAuth } from '@/context/AuthContext'
import TourBuilder from '@/components/TourBuilder/TourBuilder'
import OnboardingGuide from '@/components/Onboarding/OnboardingGuide'
import WelcomeGuide from '@/components/Onboarding/WelcomeGuide'

const isLabMode = process.env.NEXT_PUBLIC_LAB_MODE === 'true'

const isDev = process.env.NODE_ENV === 'development'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { 
    isOnboardingOpen, 
    closeOnboarding, 
  } = useUIStore()

  const currentPath = pathname || ''
  
  const isCreationPage =
    currentPath.startsWith('/create') ||
    currentPath.startsWith('/chat-avatar/create') ||
    currentPath.includes('/onboarding') ||
    currentPath.startsWith('/editor')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff' }}>
      {!isCreationPage && <Sidebar />}
      <main style={{
        flex: 1,
        marginLeft: isCreationPage ? '0' : `${SIDEBAR_WIDTH}px`,
        backgroundColor: isCreationPage ? 'transparent' : '#fff',
        transition: 'all 0.3s',
      }}>
        {children}
      </main>
      <OnboardingLabOverlay isOpen={isOnboardingOpen} onClose={closeOnboarding} />
      {isDev && <OnboardingGuide />}
      {!isCreationPage && <WelcomeGuide mainGoal={user?.user_metadata?.main_goal ?? null} />}
      <TourBuilder />
      {isLabMode && (
        <div style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          backgroundColor: '#6366f1',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '0.05em',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          zIndex: 10000,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <span style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff' }} />
          LAB VERSION
        </div>
      )}
    </div>
  )
}
