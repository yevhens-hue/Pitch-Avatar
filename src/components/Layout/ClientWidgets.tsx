'use client'

import dynamic from 'next/dynamic'

const SaraWidget = dynamic(() => import('@/widgets/Sara/ui/SaraWidgetContainer'), {
  ssr: false,
})

const StonlyOnboardingIntegration = dynamic(
  () => import('@/components/Onboarding/StonlyOnboardingIntegration'),
  { ssr: false },
)

export default function ClientWidgets({ isLabMode }: { isLabMode: boolean }) {
  return (
    <>
      <SaraWidget />
      <StonlyOnboardingIntegration />
    </>
  )
}
