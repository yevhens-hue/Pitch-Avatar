'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '@/constants'
import OnboardingLabOverlay from '@/components/Wizard/OnboardingLabOverlay'
import ChecklistWidget from '@/components/Wizard/variants/ChecklistWidget'
import { useUIStore } from '@/lib/store'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isOnboardingOpen, closeOnboarding, isChecklistOpen } = useUIStore()

  const isCreationPage =
    pathname.startsWith('/create') ||
    pathname.startsWith('/chat-avatar/create') ||
    pathname.includes('/onboarding')

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
      {isChecklistOpen && <ChecklistWidget />}
    </div>
  )
}
