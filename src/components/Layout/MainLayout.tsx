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
import SeatsQuotaBanner from '@/components/Layout/SeatsQuotaBanner'
import ContextualTour from '@/components/Wizard/variants/ContextualTour'

const isLabMode = process.env.NEXT_PUBLIC_LAB_MODE === 'true'
const isDev = process.env.NODE_ENV === 'development'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { 
    isOnboardingOpen, 
    closeOnboarding,
    isBillingTrial,
    setIsBillingTrial,
    isTourActive,
  } = useUIStore()

  const [isLabMenuOpen, setIsLabMenuOpen] = React.useState(false)

  const currentPath = pathname || ''
  
  const isCreationPage =
    currentPath.startsWith('/create') ||
    currentPath.startsWith('/chat-avatar/create') ||
    currentPath.includes('/onboarding') ||
    currentPath.startsWith('/editor') ||
    (currentPath.startsWith('/presentation-templates/') && currentPath !== '/presentation-templates')

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
      <SeatsQuotaBanner />
      <OnboardingLabOverlay isOpen={isOnboardingOpen} onClose={closeOnboarding} />
      <OnboardingGuide />
      {/* <WelcomeGuide mainGoal={user?.user_metadata?.main_goal ?? null} /> */}
      {isTourActive && <ContextualTour />}
      <TourBuilder />
      {isLabMode && (
        <div style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 10000 }}>
          <button 
            onClick={() => setIsLabMenuOpen(!isLabMenuOpen)}
            style={{
              backgroundColor: '#6366f1',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }}
          >
            <span style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff' }} />
            LAB VERSION
          </button>
          
          {isLabMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '12px',
              width: '200px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Billing State Preview
              </div>
              <button
                onClick={() => { setIsBillingTrial(true); setIsLabMenuOpen(false); }}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '13px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: isBillingTrial ? '#10b981' : '#f1f5f9', 
                  color: isBillingTrial ? '#fff' : '#475569', 
                  fontWeight: isBillingTrial ? 600 : 400,
                  textAlign: 'left'
                }}
              >
                Free Trial
              </button>
              <button
                onClick={() => { setIsBillingTrial(false); setIsLabMenuOpen(false); }}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '13px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: !isBillingTrial ? '#3b82f6' : '#f1f5f9', 
                  color: !isBillingTrial ? '#fff' : '#475569', 
                  fontWeight: !isBillingTrial ? 600 : 400,
                  textAlign: 'left'
                }}
              >
                Active Subscription
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
