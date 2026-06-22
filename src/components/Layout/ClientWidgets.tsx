'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { registerStonlyMessageListener } from '@/lib/stonly'

const SaraWidget = dynamic(() => import('@/widgets/Sara/ui/SaraWidgetContainer'), {
  ssr: false,
})


export default function ClientWidgets({ isLabMode }: { isLabMode: boolean }) {
  const { user } = useAuth()

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).StonlyWidget && user) {
      const mainGoal = user.user_metadata?.main_goal || user.user_metadata?.goal || 'other';
      (window as any).StonlyWidget('identify', {
        userId: user.id,
        email: user.email,
        main_goal: mainGoal,
      });
    }
  }, [user])

  useEffect(() => {
    const cleanup = registerStonlyMessageListener(
      () => user?.id,
      () => user?.user_metadata?.main_goal || user?.user_metadata?.goal
    );
    return cleanup;
  }, [user])

  return (
    <>
      <SaraWidget />
    </>
  )
}
