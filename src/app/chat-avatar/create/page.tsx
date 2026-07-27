import React, { Suspense } from 'react'
import ChatAvatarCreator from '@/components/ChatAvatar/Creator/Creator'

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading avatar editor...</div>}>
      <ChatAvatarCreator />
    </Suspense>
  )
}

