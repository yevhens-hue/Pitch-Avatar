'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '@/constants'
import OnboardingLabOverlay from '@/components/Wizard/OnboardingLabOverlay'
import { useUIStore } from '@/lib/store'
import TourBuilder from '@/components/TourBuilder/TourBuilder'
import OnboardingGuide from '@/components/Onboarding/OnboardingGuide'

const isDev = process.env.NODE_ENV === 'development'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
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
      <OnboardingGuide />
      <TourBuilder />
    </div>
  )
}
