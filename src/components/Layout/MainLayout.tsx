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

const isLabMode = true // Force enabled for testing
const isDev = process.env.NODE_ENV === 'development'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { 
    isOnboardingOpen, 
    closeOnboarding,
    isBillingTrial,
    setIsBillingTrial,
    isFutureVersion,
    setIsFutureVersion,
    isTourActive,
    activeSkinDomain,
    setActiveSkinDomain,
  } = useUIStore()

  const [isLabMenuOpen, setIsLabMenuOpen] = React.useState(false)

  const currentPath = pathname || ''
  
  const isCreationPage =
    currentPath.startsWith('/create') ||
    currentPath.startsWith('/chat-avatar/create') ||
    currentPath.includes('/onboarding') ||
    currentPath.startsWith('/editor') ||
    currentPath.startsWith('/play') ||
    currentPath.startsWith('/coach') ||
    currentPath.startsWith('/preview') ||
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
      {isFutureVersion && <SeatsQuotaBanner />}
      <OnboardingLabOverlay isOpen={isOnboardingOpen} onClose={closeOnboarding} />
      <OnboardingGuide />
      {/* <WelcomeGuide mainGoal={user?.user_metadata?.main_goal ?? null} /> */}
      {isTourActive && <ContextualTour />}
      <TourBuilder />
      {isLabMode && (
        <div style={{ position: 'fixed', top: '50%', right: '0', transform: 'translateY(-50%)', zIndex: 10000 }}>
          <button 
            onClick={() => setIsLabMenuOpen(!isLabMenuOpen)}
            style={{
              backgroundColor: '#fff',
              color: '#94a3b8',
              padding: '12px 6px',
              borderRadius: '8px 0 0 8px',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #e2e8f0',
              borderRight: 'none',
              cursor: 'pointer',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transition: 'color 0.2s, background-color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = '#fff'; }}
          >
            LAB
          </button>
          
          {isLabMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '50%',
              right: 'calc(100% + 8px)',
              transform: 'translateY(-50%)',
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.1)',
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

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Product Version
              </div>
              <button
                onClick={() => { setIsFutureVersion(false); setIsLabMenuOpen(false); }}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '13px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: !isFutureVersion ? '#f59e0b' : '#f1f5f9', 
                  color: !isFutureVersion ? '#fff' : '#475569', 
                  fontWeight: !isFutureVersion ? 600 : 400,
                  textAlign: 'left'
                }}
              >
                Current Version
              </button>
              <button
                onClick={() => { setIsFutureVersion(true); setIsLabMenuOpen(false); }}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '13px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: isFutureVersion ? '#8b5cf6' : '#f1f5f9', 
                  color: isFutureVersion ? '#fff' : '#475569', 
                  fontWeight: isFutureVersion ? 600 : 400,
                  textAlign: 'left'
                }}
              >
                Future (Quotas)
              </button>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />

              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                UI Skins
              </div>
              <button
                onClick={() => { setActiveSkinDomain(null); setIsLabMenuOpen(false); }}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '13px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: activeSkinDomain === null ? '#f59e0b' : '#f1f5f9', 
                  color: activeSkinDomain === null ? '#fff' : '#475569', 
                  fontWeight: activeSkinDomain === null ? 600 : 400,
                  textAlign: 'left'
                }}
              >
                Default (No Skin)
              </button>
              <button
                onClick={() => { setActiveSkinDomain('hr.localhost:3000'); setIsLabMenuOpen(false); }}
                style={{ 
                  padding: '6px 10px', 
                  fontSize: '13px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  background: activeSkinDomain === 'hr.localhost:3000' ? '#ec4899' : '#f1f5f9', 
                  color: activeSkinDomain === 'hr.localhost:3000' ? '#fff' : '#475569', 
                  fontWeight: activeSkinDomain === 'hr.localhost:3000' ? 600 : 400,
                  textAlign: 'left'
                }}
              >
                HR Onboarding Skin
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
