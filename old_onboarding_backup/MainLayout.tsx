'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '@/constants'
import OnboardingLabOverlay from '@/components/Wizard/OnboardingLabOverlay'
import ChecklistWidget from '@/components/Wizard/variants/ChecklistWidget'
import ContextualTour from '@/components/Wizard/variants/ContextualTour'
import { useUIStore } from '@/lib/store'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { 
    isOnboardingOpen, 
    closeOnboarding, 
    isChecklistOpen, 
    toggleChecklist, 
    isTourActive,
    isOnboardingCompleted
  } = useUIStore()

  const currentPath = pathname || ''
  
  const isCreationPage =
    currentPath.startsWith('/create') ||
    currentPath.startsWith('/chat-avatar/create') ||
    currentPath.includes('/onboarding')

  // Show checklist by default on Home or Create pages to drive conversion, unless completed
  useEffect(() => {
    if (!isOnboardingCompleted && (currentPath === '/' || currentPath.includes('/create'))) {
      toggleChecklist(true);
    }
  }, [currentPath, toggleChecklist, isOnboardingCompleted]);

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
      {isTourActive && <ContextualTour />}
    </div>
  )
}
