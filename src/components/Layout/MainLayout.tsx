'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import { SIDEBAR_WIDTH } from '@/constants'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isCreationPage =
    pathname.startsWith('/create') ||
    pathname.startsWith('/chat-avatar/create') ||
    pathname.includes('/onboarding') ||
    pathname.includes('/onboarding/snov') ||
    pathname.includes('/onboarding/video') ||
    pathname.includes('/onboarding/walkthrough')

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
    </div>
  )
}
