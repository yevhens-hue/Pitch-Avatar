'use client'

import dynamic from 'next/dynamic'

const SaraWidget = dynamic(() => import('@/components/Support/SaraWidget'), {
  ssr: false,
})

const StonlyGuideglowIntegration = dynamic(
  () => import('@/components/Onboarding/StonlyGuideglowIntegration'),
  { ssr: false },
)

export default function ClientWidgets({ isLabMode }: { isLabMode: boolean }) {
  if (isLabMode) return null
  return (
    <>
      <SaraWidget />
      <StonlyGuideglowIntegration />
    </>
  )
}
